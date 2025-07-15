# models/binary.py

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class BinaryGame(Base):
    __tablename__ = "binary_games"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    difficulty = Column(String, default="normal")  # e.g., easy, normal, hard
    range_min = Column(Integer, default=1)
    range_max = Column(Integer, default=100)
    target = Column(Integer)
    winner = Column(String, nullable=True)  # "user", "ai", or None
    created_at = Column(DateTime, default=datetime.utcnow)

    rounds = relationship("BinaryRound", back_populates="game")
# models/binary.py (continued)

class BinaryRound(Base):
    __tablename__ = "binary_rounds"

    id = Column(Integer, primary_key=True, index=True)
    game_id = Column(Integer, ForeignKey("binary_games.id"))
    turn = Column(Integer)  # 1, 2, 3, ...
    guesser = Column(String)  # "user" or "ai"
    guess = Column(Integer)
    feedback = Column(String)  # "too_low", "too_high", "correct"
    response_time = Column(Integer, nullable=True)  # ms or seconds
    timestamp = Column(DateTime, default=datetime.utcnow)

    game = relationship("BinaryGame", back_populates="rounds")
