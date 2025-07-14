from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.orm import Session
from database import SessionLocal
from models import game as game_model, user as user_model
from routes.auth import get_current_user
from pydantic import conint
from typing import Annotated
import json

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

SUPPORTED_GAMES = {"pattern", "binary", "chunk", "stroop", "dual"}

LimitParam = Annotated[int, conint(ge=1, le=50)]

@router.get("/progress/{game_type}", tags=["Progress Tracking"])
def get_game_progress(
    game_type: str = Path(..., description="One of: pattern, binary, chunk, stroop, dual"),
    limit: LimitParam = 10,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user),
):
    if game_type not in SUPPORTED_GAMES:
        raise HTTPException(
            status_code=400,
            detail="Invalid game type. Choose from: pattern, binary, chunk, stroop, dual.",
        )

    games = (
        db.query(game_model.Game)
        .filter(
            game_model.Game.user_id == current_user.id,
            game_model.Game.game_type == game_type,
            game_model.Game.end_time != None,
        )
        .order_by(game_model.Game.end_time.desc())
        .limit(limit)
        .all()
    )

    progress_data = []

    for game in games:
        state = json.loads(game.state or "{}")
        log = state.get("log", [])
        total_rounds = len(log)
        correct = sum(1 for r in log if r.get("correct"))
        accuracy = round(correct / total_rounds * 100, 2) if total_rounds else 0.0

        progress_data.append({
            "game_id": game.id,
            "score": game.score,
            "rounds": total_rounds,
            "accuracy_percent": accuracy,
            "winner": state.get("winner"),
            "duration_sec": (
                (game.end_time - game.created_at).total_seconds()
                if game.end_time and game.created_at else None
            ),
            "completed_at": game.end_time.isoformat() if game.end_time else None,
        })

    return {
        "success": True,
        "game_type": game_type,
        "total_sessions": len(progress_data),
        "history": progress_data,
    }
