from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class ChunkGame(Base):
    __tablename__ = "chunk_games"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    difficulty = Column(String, default="medium")
    total_rounds = Column(Integer)
    correct = Column(Integer)
    score = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)

    rounds = relationship("ChunkRound", back_populates="game")


class ChunkRound(Base):
    __tablename__ = "chunk_rounds"

    id = Column(Integer, primary_key=True, index=True)
    game_id = Column(Integer, ForeignKey("chunk_games.id"))
    round_number = Column(Integer)
    original_sequence = Column(String)  # e.g. "4 8 9 2"
    user_response = Column(String)      # e.g. "4 9 8 2"
    correct = Column(Boolean)
    response_time = Column(Integer)     # in ms
    timestamp = Column(DateTime, default=datetime.utcnow)

    game = relationship("ChunkGame", back_populates="rounds")
