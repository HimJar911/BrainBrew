from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Session, relationship
from database import SessionLocal, Base
from models import user as user_model, game as game_model
from datetime import datetime
from pydantic import BaseModel
import random

router = APIRouter()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic model for starting game
class GameStartRequest(BaseModel):
    user_id: int
    difficulty: str  # "easy", "medium", "hard"
    game_type: str = "memory"

# Sample questions pool
sample_questions = {
    "easy": [
        {"question": "What is 2 + 2?", "options": ["3", "4", "5", "6"], "answer": "4"},
        {"question": "What color is the sky?", "options": ["blue", "red", "green", "yellow"], "answer": "blue"},
    ],
    "medium": [
        {"question": "What is 12 * 2?", "options": ["24", "22", "26", "28"], "answer": "24"},
    ],
    "hard": [
        {"question": "Solve: (5+3)*2", "options": ["16", "10", "8", "12"], "answer": "16"},
    ]
}

# Start game route
@router.post("/start")
def start_game(payload: GameStartRequest, db: Session = Depends(get_db)):
    user = db.query(user_model.User).filter(user_model.User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    question_pool = sample_questions.get(payload.difficulty, [])
    if not question_pool:
        raise HTTPException(status_code=400, detail="Invalid difficulty level")

    question = random.choice(question_pool)

    new_game = game_model.Game(
        user_id=payload.user_id,
        difficulty=payload.difficulty,
        game_type=payload.game_type,
        score=0,
        start_time=datetime.utcnow()
    )
    db.add(new_game)
    db.commit()
    db.refresh(new_game)

    return {
        "game_id": new_game.id,
        "question": question["question"],
        "options": question["options"],
        "difficulty": payload.difficulty
    }
class GameSubmitRequest(BaseModel):
    user_id: int
    game_id: int
    selected_option: str

class GameSubmitResponse(BaseModel):
    correct: bool
    next_question: dict | None = None
    message: str

@router.post("/submit", response_model=GameSubmitResponse)
def submit_answer(payload: GameSubmitRequest, db: Session = Depends(get_db)):
    game = db.query(game_model.Game).filter(game_model.Game.id == payload.game_id).first()

    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    # Use the same question pool logic
    question_pool = sample_questions.get(game.difficulty, [])
    if not question_pool:
        raise HTTPException(status_code=400, detail="Difficulty data missing")

    # Simulate the last question being randomly chosen
    # (In future we'll track real question → answer)
    last_question = random.choice(question_pool)
    is_correct = (payload.selected_option.strip().lower() == last_question["answer"].strip().lower())

    # Update score
    if is_correct:
        game.score += 10
        db.commit()
        msg = "Correct!"
    else:
        msg = "Incorrect!"

    # Optionally increase difficulty
    difficulty_order = ["easy", "medium", "hard"]
    current_index = difficulty_order.index(game.difficulty)
    if is_correct and current_index < 2:
        game.difficulty = difficulty_order[current_index + 1]
        db.commit()

    # Generate next question
    next_pool = sample_questions.get(game.difficulty, [])
    next_question = random.choice(next_pool) if next_pool else None

    return {
        "correct": is_correct,
        "next_question": {
            "question": next_question["question"],
            "options": next_question["options"],
            "difficulty": game.difficulty
        } if next_question else None,
        "message": msg
    }

