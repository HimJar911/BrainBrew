from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class StroopGame(Base):
    __tablename__ = "stroop_games"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    difficulty = Column(String, default="medium")
    total_rounds = Column(Integer)
    correct = Column(Integer)
    score = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)

    rounds = relationship("StroopRound", back_populates="game")


class StroopRound(Base):
    __tablename__ = "stroop_rounds"

    id = Column(Integer, primary_key=True, index=True)
    game_id = Column(Integer, ForeignKey("stroop_games.id"))
    round_number = Column(Integer)
    word_shown = Column(String)        # e.g. "RED"
    font_color = Column(String)        # e.g. "green"
    user_response = Column(String)     # e.g. "green"
    correct = Column(Boolean)
    conflict = Column(Boolean)         # True if word != font color
    response_time = Column(Integer)    # in ms
    timestamp = Column(DateTime, default=datetime.utcnow)

    game = relationship("StroopGame", back_populates="rounds")
