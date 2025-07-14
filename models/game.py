from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, Boolean, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base
from models.pattern_round import PatternRound

class Game(Base):
    __tablename__ = "games"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    score = Column(Integer, default=0)
    difficulty = Column(String, default="easy")  # "easy", "medium", "hard"
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    game_type = Column(String, default="memory")  # e.g., "reflex", "logic", "memory"
    state = Column(JSON, nullable=True)  
    pattern_rounds = relationship("PatternRound", back_populates="game", cascade="all, delete-orphan")
    user = relationship("User", back_populates="games")
    
# class PatternRound(Base):
#     __tablename__ = "pattern_rounds"

#     id = Column(Integer, primary_key=True, index=True)
#     game_id = Column(Integer, ForeignKey("games.id"))
#     round = Column(Integer)
#     correct = Column(Boolean)
#     response_time = Column(Float)
#     grid_size = Column(Integer)
#     sequence_length = Column(Integer)
#     score_this_round = Column(Integer)
#     mistake_type = Column(String)
#     timestamp = Column(DateTime, default=datetime.utcnow)