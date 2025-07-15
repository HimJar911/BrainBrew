from config import *
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from models import binary as binary_model, user as user_model
from schemas import binary as binary_schema
from routes.auth import get_current_user
from datetime import datetime
import random
from openai import OpenAI
import os
from schemas.binary import BinaryStartRequest, BinaryGuessRequest, BinaryStartResponse

router = APIRouter()
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


# ---------- Dependency ----------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------- Difficulty Ranges ----------
DIFFICULTY_RANGES = {"easy": (1, 50), "normal": (1, 100), "hard": (1, 1000)}


# ---------- Start Route ----------
@router.post(
    "/start",
    response_model=binary_schema.BinaryStartResponse,
    tags=["Binary Search Battle"],
)
def start_binary_game(
    payload: BinaryStartRequest,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user),
):
    if payload.difficulty not in DIFFICULTY_RANGES:
        raise HTTPException(status_code=400, detail="Invalid difficulty")

    range_min, range_max = DIFFICULTY_RANGES[payload.difficulty]
    target = random.randint(range_min, range_max)

    game = binary_model.BinaryGame(
        user_id=current_user.id,
        difficulty=payload.difficulty,
        range_min=range_min,
        range_max=range_max,
        target=target,
        winner=None,
    )
    db.add(game)
    db.commit()
    db.refresh(game)

    return {
        "game_id": game.id,
        "range_min": range_min,
        "range_max": range_max,
        "first_turn": "user",
    }


# ---------- Guess Route ----------
@router.post("/guess", tags=["Binary Search Battle"])
def make_guess(
    payload: BinaryGuessRequest,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user),
):
    game = (
        db.query(binary_model.BinaryGame)
        .filter(binary_model.BinaryGame.id == payload.game_id)
        .first()
    )

    if not game or game.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Game not found")

    if game.winner:
        return {"message": f"Game over! {game.winner} already won."}

    # Turn counter
    total_turns = (
        db.query(binary_model.BinaryRound)
        .filter(binary_model.BinaryRound.game_id == game.id)
        .count()
    )

    # ---------- Player Guess ----------
    if payload.guess == game.target:
        game.winner = "user"
        db.add(
            binary_model.BinaryRound(
                game_id=game.id,
                turn=total_turns + 1,
                guesser="user",
                guess=payload.guess,
                feedback="correct",
            )
        )
        db.commit()
        return {"result": "correct", "message": "You guessed it!", "winner": "user"}

    feedback = "too_low" if payload.guess < game.target else "too_high"

    db.add(
        binary_model.BinaryRound(
            game_id=game.id,
            turn=total_turns + 1,
            guesser="user",
            guess=payload.guess,
            feedback=feedback,
        )
    )

    # ---------- AI Guess ----------
    # Determine AI's current range based on all past rounds
    rounds = (
        db.query(binary_model.BinaryRound)
        .filter(binary_model.BinaryRound.game_id == game.id)
        .order_by(binary_model.BinaryRound.turn)
        .all()
    )

    ai_low = game.range_min
    ai_high = game.range_max

    for r in rounds:
        if r.guesser == "ai":
            continue
        if r.feedback == "too_low":
            ai_low = max(ai_low, r.guess + 1)
        elif r.feedback == "too_high":
            ai_high = min(ai_high, r.guess - 1)

    ai_guess = (ai_low + ai_high) // 2

    if ai_guess == game.target:
        game.winner = "ai"
        db.add(
            binary_model.BinaryRound(
                game_id=game.id,
                turn=total_turns + 2,
                guesser="ai",
                guess=ai_guess,
                feedback="correct",
            )
        )
        db.commit()
        return {
            "result": feedback,
            "ai_guess": ai_guess,
            "ai_result": "correct",
            "winner": "ai",
        }

    ai_feedback = "too_low" if ai_guess < game.target else "too_high"

    db.add(
        binary_model.BinaryRound(
            game_id=game.id,
            turn=total_turns + 2,
            guesser="ai",
            guess=ai_guess,
            feedback=ai_feedback,
        )
    )

    db.commit()

    return {
        "result": feedback,
        "ai_guess": ai_guess,
        "ai_result": ai_feedback,
        "round": (total_turns + 2) // 2,
    }


# ---------- Stats Route ----------
@router.get("/stats", tags=["Binary Search Battle"])
def binary_stats(
    game_id: int,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user),
):
    game = (
        db.query(binary_model.BinaryGame)
        .filter(binary_model.BinaryGame.id == game_id)
        .first()
    )

    if not game or game.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Game not found")

    rounds = (
        db.query(binary_model.BinaryRound)
        .filter(binary_model.BinaryRound.game_id == game_id)
        .order_by(binary_model.BinaryRound.turn)
        .all()
    )

    player_guesses = [r.guess for r in rounds if r.guesser == "user"]
    ai_guesses = [r.guess for r in rounds if r.guesser == "ai"]

    return {
        "winner": game.winner,
        "total_rounds": len(rounds) // 2,
        "player_guesses": player_guesses,
        "ai_guesses": ai_guesses,
    }


@router.get("/feedback", tags=["Binary Search Battle"])
def binary_feedback(
    game_id: int,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user),
):
    game = (
        db.query(binary_model.BinaryGame)
        .filter(binary_model.BinaryGame.id == game_id)
        .first()
    )

    if not game or game.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Game not found")

    if not game.winner:
        raise HTTPException(status_code=400, detail="Game not finished yet")

    rounds = (
        db.query(binary_model.BinaryRound)
        .filter(binary_model.BinaryRound.game_id == game.id)
        .order_by(binary_model.BinaryRound.turn)
        .all()
    )

    user_guesses = [r.guess for r in rounds if r.guesser == "user"]

    prompt = f"""
You are a cognitive psychologist analyzing a player's binary search strategy in a turn-based game. The target number was {game.target}.

Here are the user's guesses in order: {user_guesses}

1. Assign the player a 'Brain Profile' title (e.g., Precision Splitter, Instinctive Digger, Cautious Mapper).
2. Describe their strategic strengths.
3. Suggest one smart improvement they can make.
4. Keep it short, helpful, and motivational.

Respond as:
**🧠 Brain Profile:** <title>
**✅ Strengths:** <bullets>
**💡 Tip:** <1-sentence tip>
    """

    try:
        response = openai_client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.8,
        )
        return {"feedback": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error generating feedback.")


@router.get("/brain_profile", tags=["Binary Search Battle"])
def binary_brain_profile(
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user),
):
    # Get all completed games
    games = (
        db.query(binary_model.BinaryGame)
        .filter(
            binary_model.BinaryGame.user_id == current_user.id,
            binary_model.BinaryGame.winner != None,
        )
        .all()
    )

    if not games:
        return {"message": "No completed games found."}

    total_games = len(games)
    user_wins = sum(1 for g in games if g.winner == "user")
    ai_wins = total_games - user_wins

    total_user_guesses = 0
    all_user_guess_sequences = []

    for game in games:
        rounds = (
            db.query(binary_model.BinaryRound)
            .filter(binary_model.BinaryRound.game_id == game.id)
            .order_by(binary_model.BinaryRound.turn)
            .all()
        )

        user_guesses = [r.guess for r in rounds if r.guesser == "user"]
        total_user_guesses += len(user_guesses)
        all_user_guess_sequences.append(user_guesses)

    avg_guesses = round(total_user_guesses / total_games, 2)
    win_rate = round(user_wins / total_games * 100, 1)

    prompt = f"""
You are a brain game psychologist. A player has completed {total_games} binary search games against a perfect AI.

Their win rate is {win_rate}% and their average guesses per game is {avg_guesses}.
Here are their guess sequences across all games:

{all_user_guess_sequences}

Analyze their cognitive strategy and assign:
1. A long-term Brain Profile title
2. Key tendencies in how they approach binary search
3. Tips to improve their overall approach

Format it like this:
**🧠 Cognitive Profile:** <title>
**📈 Tendencies:** <bullets>
**💡 Advice:** <1-sentence improvement tip>
    """

    try:
        response = openai_client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.8,
        )
        return {
            "summary": response.choices[0].message.content,
            "total_games": total_games,
            "user_wins": user_wins,
            "ai_wins": ai_wins,
            "avg_guesses_per_game": avg_guesses,
            "win_rate_percent": win_rate,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error generating brain profile.")
