from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import SessionLocal
from models import game as game_model, user as user_model, dual as dual_model
from pydantic import BaseModel
from datetime import datetime
import random
import json
from routes.auth import get_current_user
from openai import OpenAI
import os

openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
router = APIRouter()
LETTERS = list("ABCDEFGH")


# ------------------- Dependency -------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ------------------- Request Models -------------------
class DualStartRequest(BaseModel):
    n: int = 2  # default N-back


class DualSubmitRequest(BaseModel):
    game_id: int
    letter_match: bool
    position_match: bool
    response_time: float


# ------------------- Start Route -------------------
@router.post("/start", tags=["Dual N-Back"])
def start_dual_nback(
    payload: DualStartRequest,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user),
):
    n = payload.n
    total_rounds = 20
    grid_size = 3

    sequence = [
        {
            "grid_pos": random.randint(0, grid_size * grid_size - 1),
            "letter": random.choice(LETTERS),
        }
        for _ in range(total_rounds)
    ]

    state = {
        "sequence": sequence,
        "current_round": 0,
        "log": [],
        "n": n,
        "score": 0,
        "max_rounds": total_rounds,
    }

    new_game = game_model.Game(
        user_id=current_user.id,
        game_type="dual_nback",
        difficulty=f"N={n}",
        score=0,
        state=json.dumps(state),
    )
    db.add(new_game)
    db.commit()
    db.refresh(new_game)

    first_item = sequence[0]
    return {
        "game_id": new_game.id,
        "n": n,
        "round": 1,
        "grid_pos": first_item["grid_pos"],
        "letter": first_item["letter"],
    }


# ------------------- Submit Route -------------------
@router.post("/submit", tags=["Dual N-Back"])
def submit_dual_nback(
    payload: DualSubmitRequest,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user),
):
    game = (
        db.query(game_model.Game).filter(game_model.Game.id == payload.game_id).first()
    )
    if not game or game.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Game not found")

    state = json.loads(game.state or "{}")
    sequence = state.get("sequence", [])
    round_num = state.get("current_round", 0)
    n = state.get("n", 2)
    max_rounds = state.get("max_rounds", 20)
    log = state.get("log", [])

    if round_num >= len(sequence):
        return {"message": "Game already completed."}

    current_item = sequence[round_num]
    target_index = round_num - n
    correct_letter = correct_pos = False

    if target_index >= 0:
        target_item = sequence[target_index]
        correct_letter = target_item["letter"] == current_item["letter"]
        correct_pos = target_item["grid_pos"] == current_item["grid_pos"]

    is_letter_correct = payload.letter_match == correct_letter
    is_pos_correct = payload.position_match == correct_pos

    score = int(is_letter_correct) * 2 + int(is_pos_correct) * 2

    round_log = {
        "round": round_num + 1,
        "grid_pos": current_item["grid_pos"],
        "letter": current_item["letter"],
        "response_time": payload.response_time,
        "letter_match": payload.letter_match,
        "position_match": payload.position_match,
        "correct_letter": correct_letter,
        "correct_pos": correct_pos,
        "score": score,
    }

    log.append(round_log)
    game.score += score

    state.update({"current_round": round_num + 1, "log": log})

    if round_num + 1 >= max_rounds:
        state["finished"] = True
        game.end_time = datetime.utcnow()

    game.state = json.dumps(state)
    db.commit()

    next_item = sequence[round_num + 1] if round_num + 1 < max_rounds else None

    return {
        "correct_letter": correct_letter,
        "correct_position": correct_pos,
        "score_gained": score,
        "total_score": game.score,
        "next_round": (
            {
                "round": round_num + 2,
                "grid_pos": next_item["grid_pos"],
                "letter": next_item["letter"],
            }
            if next_item
            else None
        ),
        "round_log": round_log,
        "game_over": round_num + 1 >= max_rounds,
    }


# ------------------- Stats Route -------------------
@router.get("/stats", tags=["Dual N-Back"])
def dual_nback_stats(
    game_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user),
):
    game = db.query(game_model.Game).filter(game_model.Game.id == game_id).first()
    if not game or game.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Game not found")

    state = json.loads(game.state or "{}")
    log = state.get("log", [])
    if not log:
        return {"message": "No rounds played."}

    total_rounds = len(log)
    letter_correct = sum(1 for r in log if r["letter_match"] == r["correct_letter"])
    pos_correct = sum(1 for r in log if r["position_match"] == r["correct_pos"])
    total_responses = total_rounds * 2
    total_correct = letter_correct + pos_correct
    avg_time = sum(r["response_time"] for r in log) / total_rounds

    return {
        "game_id": game.id,
        "total_rounds": total_rounds,
        "correct_letter_matches": letter_correct,
        "correct_position_matches": pos_correct,
        "accuracy_percent": round((total_correct / total_responses) * 100, 2),
        "average_response_time_sec": round(avg_time, 2),
        "final_score": game.score,
        "finished": state.get("finished", False),
    }


@router.get("/feedback", tags=["Dual N-Back"])
def dual_feedback(
    game_id: int,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user),
):
    game = (
        db.query(dual_model.DualGame)
        .filter(
            dual_model.DualGame.id == game_id,
            dual_model.DualGame.user_id == current_user.id,
        )
        .first()
    )

    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    rounds = (
        db.query(dual_model.DualRound)
        .filter(dual_model.DualRound.game_id == game_id)
        .order_by(dual_model.DualRound.round_number)
        .all()
    )

    if not rounds:
        raise HTTPException(status_code=400, detail="No rounds found for this game.")

    # Extract raw data for GPT prompt
    response_times = [r.response_time for r in rounds]
    accuracy_flags = [r.correct for r in rounds]
    audio_hits = [r.audio_correct for r in rounds]
    visual_hits = [r.visual_correct for r in rounds]

    prompt = f"""
You're a cognitive psychologist analyzing a user's performance in a Dual N-Back game.

Each round tested their ability to remember both auditory and visual positions with a delay of N steps.

Here's the data:
- Total rounds: {len(rounds)}
- Audio match accuracy: {audio_hits}
- Visual match accuracy: {visual_hits}
- Overall correctness: {accuracy_flags}
- Response times: {response_times}

Return:
1. A profile title
2. Strengths observed
3. A tip to improve dual-task working memory

Format:
**🧠 Profile:** <title>  
**✅ Strengths:** <bulleted list>  
**💡 Tip:** <1-line tip>
"""

    response = openai_client.chat.completions.create(
        model="gpt-4", messages=[{"role": "user", "content": prompt}], temperature=0.7
    )

    return {"feedback": response.choices[0].message.content}


@router.get("/brain_profile", tags=["Dual N-Back"])
def dual_brain_profile(
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user),
):
    games = (
        db.query(game_model.Game)
        .filter(
            game_model.Game.user_id == current_user.id,
            game_model.Game.game_type == "dual_nback",
            game_model.Game.end_time != None,
        )
        .all()
    )

    if not games:
        return {"message": "No completed dual n-back games found."}

    all_logs = []
    for game in games:
        state = json.loads(game.state or "{}")
        all_logs.extend(state.get("log", []))

    if len(all_logs) < 5:
        return {"message": "Not enough data to generate profile."}

    accuracies = [
        int(r["letter_match"] == r["correct_letter"])
        + int(r["position_match"] == r["correct_pos"])
        for r in all_logs
    ]
    response_times = [r.get("response_time", 0) for r in all_logs]
    n_levels = [
        state.get("n", 2) for state in [json.loads(g.state or "{}") for g in games]
    ]

    avg_accuracy = round(sum(accuracies) / (len(accuracies) * 2) * 100, 2)
    avg_response = round(sum(response_times) / len(response_times), 2)
    consistency = round((max(n_levels) - min(n_levels)) / max(1, len(n_levels)), 2)

    prompt = f"""
You're a neuroscientist analyzing a user's long-term performance in the Dual N-Back game.

They played {len(games)} sessions and completed {len(all_logs)} rounds.

Stats:
- Avg Accuracy: {avg_accuracy}%
- Avg Response Time: {avg_response} seconds
- N-Back Levels Across Games: {n_levels}
- N-Level Consistency Score: {consistency}

Return:
1. A long-term brain profile title  
2. Strengths  
3. Working memory patterns or weaknesses  
4. One smart tip for boosting dual-task performance

Format:
**🧠 Cognitive Profile:** <title>  
**✅ Strengths:** <bullets>  
**📉 Weaknesses or Tendencies:** <bullets>  
**💡 Tip:** <1-sentence tip>
"""

    try:
        response = openai_client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
        )

        return {
            "summary": response.choices[0].message.content,
            "games_analyzed": len(games),
            "rounds_total": len(all_logs),
            "accuracy_percent": avg_accuracy,
            "avg_response_time_sec": avg_response,
            "n_level_consistency_score": consistency,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error generating brain profile.")
