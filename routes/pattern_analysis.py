# routes/pattern_analysis.py

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import SessionLocal
from models.pattern_round import PatternRound
from models.game import Game
from routes.auth import get_current_user
import statistics

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/pattern/analysis", tags=["Pattern Memory Matrix"])
def analyze_pattern_game(
    game_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game or game.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Game not found")

    rounds = db.query(PatternRound).filter(PatternRound.game_id == game_id).all()
    if not rounds or len(rounds) < 3:
        return {"message": "Not enough data for analysis."}

    # Extract features
    response_times = [r.response_time for r in rounds]
    correct = [r.correct for r in rounds]
    grid_sizes = [r.grid_size for r in rounds]

    avg_time = round(sum(response_times) / len(response_times), 2)
    std_time = round(statistics.stdev(response_times), 2) if len(response_times) > 1 else 0.0
    accuracy = round(sum(correct) / len(correct) * 100, 2)
    avg_grid = round(sum(grid_sizes) / len(grid_sizes), 2)

    early_correct = correct[:len(correct)//2]
    late_correct = correct[len(correct)//2:]
    early_acc = round(sum(early_correct)/len(early_correct) * 100, 2)
    late_acc = round(sum(late_correct)/len(late_correct) * 100, 2)

    # Rule-based profiling
    if accuracy >= 85 and avg_time > 3:
        profile = "Accuracy-Oriented"
    elif avg_time < 2.2 and accuracy < 75:
        profile = "Speedster"
    elif late_acc - early_acc > 20:
        profile = "Reactive Learner"
    elif early_acc - late_acc > 20:
        profile = "Burst Fader"
    else:
        profile = "Balanced Performer"

    highlights = []
    if avg_time < 2:
        highlights.append("Quick thinker with fast reaction times.")
    if accuracy >= 85:
        highlights.append("Highly accurate even on harder levels.")
    if std_time < 1.0:
        highlights.append("Maintains consistent performance.")
    if late_acc > early_acc:
        highlights.append("Improves over time — learns on the go.")

    recommendations = []
    if profile == "Speedster":
        recommendations.append("Slow down slightly and focus on sequence order.")
    elif profile == "Accuracy-Oriented":
        recommendations.append("Try increasing the base difficulty next round.")
    elif profile == "Reactive Learner":
        recommendations.append("Consider doing a warm-up round to avoid early mistakes.")
    elif profile == "Burst Fader":
        recommendations.append("Take short breaks to maintain focus in later rounds.")
    else:
        recommendations.append("Great all-rounder — keep challenging yourself!")

    return {
        "game_id": game_id,
        "profile": profile,
        "metrics": {
            "accuracy_percent": accuracy,
            "avg_response_time": avg_time,
            "stddev_response_time": std_time,
            "avg_grid_size": avg_grid,
            "early_accuracy": early_acc,
            "late_accuracy": late_acc
        },
        "highlights": highlights,
        "recommendations": recommendations
    }
@router.get("/pattern/brain_profile", tags=["Pattern Memory Matrix"])
def get_brain_profile(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Get all PatternGames played by the user
    pattern_games = db.query(Game).filter(
        Game.user_id == current_user.id,
        Game.game_type == "pattern"
    ).all()

    if not pattern_games:
        return {"message": "No pattern games played yet."}

    all_rounds = []
    for game in pattern_games:
        rounds = db.query(PatternRound).filter(PatternRound.game_id == game.id).all()
        all_rounds.extend(rounds)

    if len(all_rounds) < 5:
        return {"message": "Not enough rounds across games to build profile."}

    # Extract metrics
    response_times = [r.response_time for r in all_rounds]
    correct = [r.correct for r in all_rounds]
    grid_sizes = [r.grid_size for r in all_rounds]

    avg_time = round(sum(response_times) / len(response_times), 2)
    std_time = round(statistics.stdev(response_times), 2) if len(response_times) > 1 else 0.0
    accuracy = round(sum(correct) / len(correct) * 100, 2)
    avg_grid = round(sum(grid_sizes) / len(grid_sizes), 2)

    # Learning Trend (first 30% vs last 30%)
    split = len(correct) // 3
    early_acc = round(sum(correct[:split])/split * 100, 2)
    late_acc = round(sum(correct[-split:])/split * 100, 2)
    trend = late_acc - early_acc

    # Long-term Profile
    if accuracy >= 85 and avg_time > 3:
        profile = "Accuracy-Oriented"
    elif avg_time < 2.2 and accuracy < 75:
        profile = "Speedster"
    elif trend > 15:
        profile = "Reactive Learner"
    elif trend < -15:
        profile = "Burst Fader"
    else:
        profile = "Balanced Performer"

    return {
        "user_id": current_user.id,
        "profile": profile,
        "summary": {
            "avg_accuracy_percent": accuracy,
            "avg_response_time": avg_time,
            "consistency": std_time,
            "avg_grid_size": avg_grid,
            "early_accuracy": early_acc,
            "late_accuracy": late_acc,
            "learning_trend": trend
        },
        "games_analyzed": len(pattern_games),
        "rounds_total": len(all_rounds)
    }
