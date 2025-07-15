from config import *
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import SessionLocal
from models import game as game_model, user as user_model
from pydantic import BaseModel
from models import chunk as chunk_model
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


# ---------- Request Models ----------
class ChunkStartRequest(BaseModel):
    length: int = 9
    max_chunk_size: int = 4


class ChunkSubmitRequest(BaseModel):
    game_id: int
    chunks: list[list[int]]
    response_time: float


# ---------- Start Route ----------
@router.post("/chunk/start", tags=["Chunking Challenge"])
def start_chunk_game(
    payload: ChunkStartRequest,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user),
):
    sequence = random.sample(range(10), payload.length)

    state = {
        "sequence": sequence,
        "round": 1,
        "log": [],
        "max_chunk_size": payload.max_chunk_size,
        "total_score": 0,
    }

    new_game = game_model.Game(
        user_id=current_user.id,
        game_type="chunking",
        difficulty="medium",
        score=0,
        state=json.dumps(state),
    )
    db.add(new_game)
    db.commit()
    db.refresh(new_game)

    return {
        "game_id": new_game.id,
        "sequence": sequence,
        "round": 1,
    }


# ---------- Submit Route ----------
@router.post("/chunk/submit", tags=["Chunking Challenge"])
def submit_chunk_response(
    payload: ChunkSubmitRequest,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user),
):
    game = db.query(game_model.Game).filter(game_model.Game.id == payload.game_id).first()
    if not game or game.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Game not found")

    state = json.loads(game.state or "{}")
    expected_sequence = state["sequence"]
    flat_chunks = [item for chunk in payload.chunks for item in chunk]

    is_correct = flat_chunks == expected_sequence

    # Chunk efficiency scoring
    chunk_sizes = [len(c) for c in payload.chunks]
    avg_chunk = sum(chunk_sizes) / len(chunk_sizes)
    max_chunk = max(chunk_sizes)
    chunk_style = (
        "Balanced" if max_chunk <= 4 and avg_chunk <= 4
        else "Greedy" if max_chunk > 5
        else "Scattered"
    )

    score = 0
    if is_correct:
        base = len(expected_sequence) * 3
        time_penalty = min(payload.response_time * 2, base)
        score = int(base - time_penalty)
        game.score += score

    state["log"].append({
        "round": state["round"],
        "chunks": payload.chunks,
        "flat_sequence": flat_chunks,
        "correct": is_correct,
        "chunk_sizes": chunk_sizes,
        "style": chunk_style,
        "response_time": payload.response_time,
        "score": score
    })

    # Prepare next round
    new_sequence = random.sample(range(10), len(expected_sequence))
    state["sequence"] = new_sequence
    state["round"] += 1
    game.state = json.dumps(state)
    db.commit()

    return {
        "correct": is_correct,
        "score": score,
        "chunk_efficiency": chunk_style,
        "total_score": game.score,
        "next_round": {
            "sequence": new_sequence,
            "round": state["round"]
        },
        "round_log": state["log"][-1]
    }


# ---------- Stats Route ----------
@router.get("/chunk/stats", tags=["Chunking Challenge"])
def get_chunk_stats(
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
    avg_chunk_size = round(sum(sum(r["chunk_sizes"]) for r in logs) / sum(len(r["chunk_sizes"]) for r in logs), 2)
    styles = [r["style"] for r in logs]
    dominant = max(set(styles), key=styles.count)

    return {
        "game_id": game_id,
        "total_rounds": total_rounds,
        "correct_answers": correct,
        "accuracy_percent": round((correct / total_rounds) * 100, 2),
        "average_chunk_size": avg_chunk_size,
        "dominant_style": dominant,
        "final_score": game.score
    }
@router.get("/chunk/feedback", tags=["Chunking Challenge"])
def chunk_feedback(
    game_id: int,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    game = db.query(chunk_model.ChunkGame).filter(
        chunk_model.ChunkGame.id == game_id,
        chunk_model.ChunkGame.user_id == current_user.id
    ).first()

    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    rounds = db.query(chunk_model.ChunkRound).filter(
        chunk_model.ChunkRound.game_id == game_id
    ).order_by(chunk_model.ChunkRound.round_number).all()

    if not rounds:
        raise HTTPException(status_code=400, detail="No rounds found for this game.")

    sequence_lengths = [len(r.original_sequence) for r in rounds]
    correct_flags = [r.correct for r in rounds]
    response_times = [r.response_time for r in rounds]

    prompt = f"""
You're a cognitive scientist analyzing a user's performance in a chunking memory game.

They were shown sequences like ['4 8 9 2 3'] and had to reproduce them from memory. Here's their data:

- Sequences per round: {sequence_lengths}
- Correct rounds: {correct_flags}
- Response times per round (in seconds): {response_times}

Analyze their memory chunking performance and return:
1. A brain profile title
2. Strengths (e.g., fast recall, pattern recognition)
3. A tip for improving memory compression

Format:
**🧠 Brain Profile:** <title>  
**✅ Strengths:** <bulleted list>  
**💡 Tip:** <1-sentence improvement tip>
"""

    response = openai_client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.8
    )

    return {
        "feedback": response.choices[0].message.content
    }
@router.get("/chunk/brain_profile", tags=["Chunking Challenge"])
def chunk_brain_profile(
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    # Get all user games
    games = db.query(chunk_model.ChunkGame).filter(
        chunk_model.ChunkGame.user_id == current_user.id,
        chunk_model.ChunkGame.correct != None
    ).all()

    if not games:
        return {"message": "No completed chunking games found."}

    total_games = len(games)
    total_correct = sum(g.correct for g in games)
    total_rounds = sum(g.total_rounds for g in games)

    rounds_all = db.query(chunk_model.ChunkRound).join(chunk_model.ChunkGame).filter(
        chunk_model.ChunkGame.user_id == current_user.id
    ).all()

    avg_response_time = round(sum(r.response_time for r in rounds_all) / len(rounds_all) / 1000, 2)  # in seconds
    sequence_lengths = [len(r.original_sequence.split()) for r in rounds_all]
    consistency = round(
        (max(sequence_lengths) - min(sequence_lengths)) / max(1, len(sequence_lengths)), 2
    )

    prompt = f"""
You're a neuroscientist analyzing a user's chunking memory strategy across {total_games} games.

They completed {total_rounds} rounds total and got {total_correct} correct.
Their average response time is {avg_response_time} seconds.
Their sequence lengths varied like this: {sequence_lengths}
Their sequence complexity consistency score is: {consistency}

Please return:
1. A long-term brain profile title
2. Strengths
3. Memory pattern tendencies
4. A smart improvement tip

Respond like this:
**🧠 Cognitive Profile:** <title>  
**✅ Strengths:** <bullets>  
**📉 Weaknesses or Tendencies:** <bullets>  
**💡 Tip:** <1-sentence tip>
"""

    response = openai_client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.8
    )

    return {
        "summary": response.choices[0].message.content,
        "games_analyzed": total_games,
        "rounds_total": total_rounds,
        "accuracy_percent": round((total_correct / total_rounds) * 100, 1),
        "avg_response_time_sec": avg_response_time,
        "sequence_consistency_score": consistency
    }
