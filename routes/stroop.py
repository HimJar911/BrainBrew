from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import SessionLocal
from models import game as game_model, user as user_model, stroop as stroop_model
from pydantic import BaseModel
from datetime import datetime
import random
import json
from routes.auth import get_current_user
from openai import OpenAI
import os

router = APIRouter()
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ------------ Game Setup ------------

COLORS = ["RED", "GREEN", "BLUE", "YELLOW", "ORANGE", "PURPLE"]


class StroopSubmitRequest(BaseModel):
    game_id: int
    response_color: str
    response_time: float


class StroopStartRequest(BaseModel):
    rounds: int = 5


# ------------ Start Game ------------
@router.post("/stroop/start", tags=["Stroop Inferno"])
def start_stroop_game(
    request: StroopStartRequest,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user),
):
    word = random.choice(COLORS)
    font_color = random.choice(COLORS)
    congruent = word == font_color

    state = {
        "round": 1,
        "total_rounds": request.rounds,
        "log": [],
        "current_word": word,
        "current_color": font_color,
    }

    game = game_model.Game(
        user_id=current_user.id,
        game_type="stroop",
        difficulty="medium",
        score=0,
        state=json.dumps(state),
    )
    db.add(game)
    db.commit()
    db.refresh(game)

    return {
        "game_id": game.id,
        "word": word,
        "font_color": font_color,
        "is_congruent": congruent,
        "round": 1,
    }


# ------------ Submit Response ------------
@router.post("/stroop/submit", tags=["Stroop Inferno"])
def submit_stroop_response(
    payload: StroopSubmitRequest,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user),
):
    game = (
        db.query(game_model.Game).filter(game_model.Game.id == payload.game_id).first()
    )
    if not game or game.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Game not found")

    state = json.loads(game.state or "{}")
    word = state.get("current_word")
    font_color = state.get("current_color")
    round_num = state.get("round", 1)

    is_correct = payload.response_color.strip().upper() == font_color
    is_congruent = word == font_color

    base = 10 if not is_congruent else 7
    time_penalty = min(payload.response_time * 2, base)
    score = int((base - time_penalty) if is_correct else 0)
    game.score += score

    # Log performance
    log = state.get("log", [])
    log.append(
        {
            "round": round_num,
            "word": word,
            "font_color": font_color,
            "response_color": payload.response_color.upper(),
            "response_time": payload.response_time,
            "correct": is_correct,
            "congruent": is_congruent,
            "score": score,
        }
    )

    # Prepare next round
    next_word = random.choice(COLORS)
    next_color = random.choice(COLORS)
    congruent = next_word == next_color

    state.update(
        {
            "round": round_num + 1,
            "log": log,
            "current_word": next_word,
            "current_color": next_color,
        }
    )

    game.state = json.dumps(state)
    db.commit()

    return {
        "correct": is_correct,
        "score": score,
        "congruent": is_congruent,
        "next_round": {
            "word": next_word,
            "font_color": next_color,
            "is_congruent": congruent,
            "round": round_num + 1,
        },
        "round_log": log[-1],
    }


# ------------ Stats ------------
@router.get("/stroop/stats", tags=["Stroop Inferno"])
def get_stroop_stats(
    game_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user),
):
    game = db.query(game_model.Game).filter(game_model.Game.id == game_id).first()
    if not game or game.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Game not found")

    state = json.loads(game.state or "{}")
    logs = state.get("log", [])
    if not logs:
        return {"message": "No rounds played."}

    total_rounds = len(logs)
    correct = sum(1 for r in logs if r["correct"])
    incongruent_correct = sum(1 for r in logs if r["correct"] and not r["congruent"])
    total_incongruent = sum(1 for r in logs if not r["congruent"])
    avg_time = round(sum(r["response_time"] for r in logs) / total_rounds, 2)

    return {
        "game_id": game_id,
        "total_rounds": total_rounds,
        "correct_answers": correct,
        "accuracy_percent": round((correct / total_rounds) * 100, 2),
        "avg_response_time_sec": avg_time,
        "incongruent_accuracy_percent": (
            round((incongruent_correct / total_incongruent) * 100, 2)
            if total_incongruent > 0
            else None
        ),
        "final_score": game.score,
    }


@router.get("/stroop/feedback", tags=["Stroop Inferno"])
def stroop_feedback(
    game_id: int,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user),
):
    game = (
        db.query(stroop_model.StroopGame)
        .filter(
            stroop_model.StroopGame.id == game_id,
            stroop_model.StroopGame.user_id == current_user.id,
        )
        .first()
    )

    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    rounds = (
        db.query(stroop_model.StroopRound)
        .filter(stroop_model.StroopRound.game_id == game_id)
        .order_by(stroop_model.StroopRound.round_number)
        .all()
    )

    if not rounds:
        raise HTTPException(status_code=400, detail="No rounds found for this game.")

    correct_flags = [r.correct for r in rounds]
    response_times = [r.response_time for r in rounds]
    word_color_conflicts = [
        r.conflict for r in rounds
    ]  # e.g. True if color and word were different

    prompt = f"""
You're a cognitive scientist analyzing a user's Stroop task performance.

In this game:
- Correct answers: {correct_flags}
- Response times in ms: {response_times}
- Conflict trials: {word_color_conflicts}

Analyze their ability to suppress automatic reading and respond to ink color under interference.

Return:
1. A brain profile title
2. Strengths (e.g., inhibitory control, fast conflict resolution)
3. Weaknesses (e.g., slowed on conflict trials)
4. A smart improvement tip

Format:
**🧠 Brain Profile:** <title>  
**✅ Strengths:** <bullets>  
**📉 Weaknesses:** <bullets>  
**💡 Tip:** <1-sentence tip>
"""

    response = openai_client.chat.completions.create(
        model="gpt-4", messages=[{"role": "user", "content": prompt}], temperature=0.8
    )

    return {"feedback": response.choices[0].message.content}
@router.get("/stroop/brain_profile", tags=["Stroop Inferno"])
def stroop_brain_profile(
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    # Get all stroop games
    games = db.query(stroop_model.StroopGame).filter(
        stroop_model.StroopGame.user_id == current_user.id
    ).all()

    if not games:
        raise HTTPException(status_code=404, detail="No Stroop games found.")

    game_ids = [g.id for g in games]

    # Get all rounds for those games
    rounds = db.query(stroop_model.StroopRound).filter(
        stroop_model.StroopRound.game_id.in_(game_ids)
    ).all()

    if not rounds:
        raise HTTPException(status_code=404, detail="No Stroop rounds found.")

    correct_total = sum(r.correct for r in rounds)
    total = len(rounds)
    avg_response_time = round(sum(r.response_time for r in rounds) / total, 2)

    conflict_trials = [r for r in rounds if r.conflict]
    correct_conflict = sum(r.correct for r in conflict_trials)
    total_conflict = len(conflict_trials)

    # Build summary
    summary = {
        "total_games_played": len(games),
        "total_rounds": total,
        "overall_accuracy_percent": round((correct_total / total) * 100, 2),
        "avg_response_time_sec": avg_response_time,
        "conflict_accuracy_percent": round((correct_conflict / total_conflict) * 100, 2) if total_conflict > 0 else None
    }

    # Generate brain profile title (naive)
    if summary["overall_accuracy_percent"] > 85 and avg_response_time < 1.0:
        profile = "Laser-Focused Reactor"
    elif summary["conflict_accuracy_percent"] and summary["conflict_accuracy_percent"] > 80:
        profile = "Conflict Crusher"
    else:
        profile = "Developing Inhibitor"

    summary["brain_profile"] = profile
    return summary
