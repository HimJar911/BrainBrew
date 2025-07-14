from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import SessionLocal
from models import game as game_model, user as user_model
from pydantic import BaseModel, conint, confloat, field_validator
from datetime import datetime
import random
import json
from routes.auth import get_current_user
import statistics
from models.pattern_round import PatternRound
from typing import Annotated

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ------------------- Request Models -------------------
class PatternStartRequest(BaseModel):
    grid_size: Annotated[int, conint(ge=2, le=8)] = 3

class PatternSubmitRequest(BaseModel):
    game_id: Annotated[int, conint(gt=0)]
    sequence: list[Annotated[int, conint(ge=0)]]
    response_time: Annotated[float, confloat(gt=0.0, le=30.0)]

    @field_validator("sequence")
    def sequence_not_empty(cls, v):
        if not v:
            raise ValueError("Sequence cannot be empty.")
        return v

# ------------------- Start Route -------------------
@router.post("/start", tags=["Pattern Memory Matrix"])
def start_pattern_game(
    payload: PatternStartRequest,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user),
):
    grid_size = payload.grid_size
    total_cells = grid_size * grid_size
    sequence_length = 3
    sequence = random.sample(range(total_cells), k=sequence_length)

    state = {
        "grid_size": grid_size,
        "sequence": sequence,
        "sequence_length": sequence_length,
        "round": 1,
        "log": [],
        "correct_streak": 0,
        "max_streak": 0,
        "revive_used": False,
        "max_time_sec": 5,
        "max_rounds": 10,
        "winner": None,
    }

    new_game = game_model.Game(
        user_id=current_user.id,
        game_type="pattern",
        difficulty="easy",
        score=0,
        state=json.dumps(state),
    )
    db.add(new_game)
    db.commit()
    db.refresh(new_game)

    return {
        "game_id": new_game.id,
        "grid_size": grid_size,
        "sequence": sequence,
        "round": 1,
    }


# ------------------- Submit Route -------------------
@router.post("/submit", tags=["Pattern Memory Matrix"])
def submit_pattern(
    payload: PatternSubmitRequest,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user),
):
    game = (
        db.query(game_model.Game).filter(game_model.Game.id == payload.game_id).first()
    )
    if not game or game.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Game not found")

    state = json.loads(game.state or "{}")
    expected = state.get("sequence", [])
    round_num = state.get("round", 1)
    grid_size = state.get("grid_size", 3)
    sequence_length = state.get("sequence_length", 3)
    max_time = state.get("max_time_sec", 5)
    max_rounds = state.get("max_rounds", 10)
    correct_streak = state.get("correct_streak", 0)
    max_streak = state.get("max_streak", 0)
    revive_used = state.get("revive_used", False)
    performance_log = state.get("log", [])

    # --- Determine outcome ---
    timed_out = payload.response_time > max_time
    wrong_order = payload.sequence != expected
    is_correct = not timed_out and not wrong_order

    # --- Classify mistake ---
    if timed_out and wrong_order:
        mistake_type = "mixed"
    elif timed_out:
        mistake_type = "timeout"
    elif wrong_order:
        mistake_type = "wrong_order"
    else:
        mistake_type = "none"

    # --- Scoring ---
    base_score = sequence_length * 5
    time_penalty = min(payload.response_time * 2, base_score)
    raw_score = max(0, base_score - time_penalty)

    # Perfect streak bonus
    perfect_streak = (
        correct_streak >= 2 and is_correct and payload.response_time <= 0.75 * max_time
    )
    bonus_score = 10 if perfect_streak else 0

    # Streak multiplier
    streak_multiplier = 1 + (correct_streak // 3) * 0.1
    final_score = int(
        (raw_score + bonus_score) * streak_multiplier if is_correct else 0
    )

    # --- Update streaks ---
    if is_correct:
        correct_streak += 1
        max_streak = max(max_streak, correct_streak)
    else:
        correct_streak = 0

    game.score += final_score

    # --- Projected Score ---
    rounds_remaining = max_rounds - round_num
    avg_score_so_far = (
        sum(r["score_this_round"] for r in performance_log) / len(performance_log)
        if performance_log
        else 0
    )
    projected_final_score = int(game.score + avg_score_so_far * rounds_remaining)

    # --- Revive Logic ---
    allow_revive = (
        not is_correct
        and not revive_used
        and len(performance_log) >= 5
        and sum(1 for r in performance_log[-5:] if not r["correct"]) == 0
    )
    revived = False

    if allow_revive:
        revive_used = True
        revived = True
        state.update(
            {
                "revive_used": True,
                "log": performance_log,
                "correct_streak": correct_streak,
                "max_streak": max_streak,
            }
        )
        game.state = json.dumps(state)
        db.commit()
        return {
            "correct": False,
            "message": "Revive used! Try the same round again.",
            "revived": True,
            "next_round": {"sequence": expected, "round": round_num},
            "round_log": None,
        }

    # --- Log round performance ---
    round_log = {
        "round": round_num,
        "correct": is_correct,
        "mistake_type": mistake_type,
        "grid_size": grid_size,
        "sequence_length": sequence_length,
        "response_time": payload.response_time,
        "base_score": base_score,
        "time_penalty": round(time_penalty, 2),
        "perfect_streak_bonus": bonus_score,
        "score_multiplier": round(streak_multiplier, 2),
        "score_this_round": final_score,
        "correct_streak_at_time": correct_streak,
        "max_streak_so_far": max_streak,
        "projected_final_score": projected_final_score,
    }
    performance_log.append(round_log)
    new_round = PatternRound(
        game_id=game.id,
        round_number=round_num,
        correct=is_correct,
        mistake_type=mistake_type,
        grid_size=grid_size,
        sequence_length=sequence_length,
        response_time=payload.response_time,
        score_this_round=final_score,
        correct_streak_at_time=correct_streak,
        max_streak_so_far=max_streak,
        projected_final_score=projected_final_score,
    )
    db.add(new_round)

    # --- Adaptive Difficulty ---
    if is_correct and round_num < max_rounds:
        next_length = sequence_length + 1
        if payload.response_time <= 0.6 * max_time:
            # Fast = harder
            next_length += 1
        if correct_streak >= 3 and grid_size < 6:
            grid_size += 1
        total_cells = grid_size * grid_size
        new_sequence = random.sample(
            range(total_cells), k=min(next_length, total_cells)
        )

        state.update(
            {
                "grid_size": grid_size,
                "sequence": new_sequence,
                "sequence_length": next_length,
                "round": round_num + 1,
                "log": performance_log,
                "correct_streak": correct_streak,
                "max_streak": max_streak,
                "revive_used": revive_used,
            }
        )
        game.state = json.dumps(state)
        db.commit()

        return {
            "correct": True,
            "message": "Correct!",
            "score_gained": final_score,
            "total_score": game.score,
            "next_round": {"sequence": new_sequence, "round": round_num + 1},
            "round_log": round_log,
            "revived": False,
        }

    # --- End Game ---
    winner = "Player" if is_correct and round_num >= max_rounds else "Game"
    state.update(
        {
            "log": performance_log,
            "winner": winner,
            "correct_streak": correct_streak,
            "max_streak": max_streak,
            "revive_used": revive_used,
        }
    )
    game.end_time = datetime.utcnow()
    game.state = json.dumps(state)
    db.commit()

    return {
        "correct": is_correct,
        "message": "Correct!" if is_correct else "Incorrect!",
        "score_gained": final_score,
        "total_score": game.score,
        "next_round": None,
        "round_log": round_log,
        "game_over": True,
        "winner": winner,
        "revived": False,
    }


# ------------------- Stats Route -------------------
@router.get("/stats", tags=["Pattern Memory Matrix"])
def get_pattern_stats(
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
        return {"message": "No rounds played yet."}

    total_rounds = len(log)
    correct_rounds = sum(1 for r in log if r["correct"])
    total_time = sum(r["response_time"] for r in log)
    final_sequence_length = state.get("sequence_length", 3)
    time_stddev = (
        round(statistics.stdev([r["response_time"] for r in log]), 2)
        if total_rounds > 1
        else 0.0
    )
    mistake_breakdown = {
        "timeout": sum(1 for r in log if r["mistake_type"] == "timeout"),
        "wrong_order": sum(1 for r in log if r["mistake_type"] == "wrong_order"),
        "mixed": sum(1 for r in log if r["mistake_type"] == "mixed"),
    }

    return {
        "game_id": game_id,
        "total_rounds": total_rounds,
        "correct_answers": correct_rounds,
        "accuracy_percent": round(correct_rounds / total_rounds * 100, 2),
        "average_response_time_sec": round(total_time / total_rounds, 2),
        "response_time_stddev": time_stddev,
        "mistake_breakdown": mistake_breakdown,
        "final_sequence_length": final_sequence_length,
        "final_score": game.score,
        "max_streak": state.get("max_streak", 0),
        "winner": state.get("winner", None),
    }


@router.get("/feedback", tags=["Pattern Memory Matrix"])
def get_pattern_feedback(
    game_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user),
):
    game = db.query(game_model.Game).filter(game_model.Game.id == game_id).first()
    if not game or game.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Game not found")

    state = json.loads(game.state or "{}")
    log = state.get("log", [])

    if not log or len(log) < 3:
        return {"message": "Not enough data for feedback."}

    # --- Metrics ---
    avg_time = sum(r["response_time"] for r in log) / len(log)
    time_stddev = (
        statistics.stdev([r["response_time"] for r in log]) if len(log) > 1 else 0
    )
    accuracy = sum(1 for r in log if r["correct"]) / len(log)
    high_grid_rounds = [r for r in log if r["grid_size"] >= 5]
    high_grid_success = sum(1 for r in high_grid_rounds if r["correct"])

    # --- Streak Dynamics ---
    first_half = log[: len(log) // 2]
    second_half = log[len(log) // 2 :]
    streak_trend = sum(r["correct"] for r in second_half) - sum(
        r["correct"] for r in first_half
    )

    # --- Profile Logic ---
    if avg_time < 3 and accuracy < 0.7:
        profile = "Speedster"
    elif avg_time >= 3 and accuracy >= 0.8:
        profile = "Accuracy-Oriented"
    elif streak_trend > 1:
        profile = "Reactive Learner"
    else:
        profile = "Burst Fader"

    # --- Highlights ---
    highlights = []
    if avg_time < 2:
        highlights.append("Quick response times across most rounds.")
    if accuracy >= 0.8:
        highlights.append("High accuracy even under pressure.")
    if high_grid_success >= 2:
        highlights.append("Handled large grid sizes with confidence.")
    if time_stddev < 1.0:
        highlights.append("Very consistent response times.")

    # --- Recommendations ---
    recommendations = []
    if profile == "Speedster":
        recommendations.append("Slow down slightly to avoid sequence mistakes.")
        recommendations.append("Focus on visual chunking to improve accuracy.")
    elif profile == "Accuracy-Oriented":
        recommendations.append("Try pushing to higher grid sizes earlier.")
        recommendations.append("Maintain your slow-and-steady rhythm!")
    elif profile == "Reactive Learner":
        recommendations.append(
            "Strong learning curve — keep practicing long sequences."
        )
        recommendations.append("Analyze what changed mid-game and repeat that setup.")
    elif profile == "Burst Fader":
        recommendations.append("Pace yourself — avoid mental fatigue mid-game.")
        recommendations.append("Use early rounds to build rhythm, not speed.")

    return {
        "game_id": game_id,
        "profile": profile,
        "highlights": highlights,
        "recommendations": recommendations,
        "metrics": {
            "accuracy_percent": round(accuracy * 100, 2),
            "avg_response_time": round(avg_time, 2),
            "response_time_stddev": round(time_stddev, 2),
        },
    }


@router.get("/progress", tags=["Pattern Memory Matrix"])
def get_pattern_progress(
    game_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user),
):
    game = db.query(game_model.Game).filter(game_model.Game.id == game_id).first()
    if not game or game.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Game not found")

    state = json.loads(game.state or "{}")

    if state.get("winner") is not None:
        return {"message": "Game already ended."}

    return {
        "game_id": game_id,
        "round": state.get("round"),
        "grid_size": state.get("grid_size"),
        "sequence_length": state.get("sequence_length"),
        "sequence": state.get("sequence"),
        "revive_used": state.get("revive_used"),
        "correct_streak": state.get("correct_streak"),
        "max_streak": state.get("max_streak"),
        "log_length": len(state.get("log", [])),
    }
