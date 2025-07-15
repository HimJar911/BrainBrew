# models/pattern_round.py

from sqlalchemy import Column, Integer, Float, Boolean, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class PatternRound(Base):
    __tablename__ = "pattern_rounds"

    id = Column(Integer, primary_key=True, index=True)
    game_id = Column(Integer, ForeignKey("games.id"), nullable=False)
    round_number = Column(Integer, nullable=False)
    correct = Column(Boolean, default=False)
    mistake_type = Column(String)
    grid_size = Column(Integer)
    sequence_length = Column(Integer)
    response_time = Column(Float)
    score_this_round = Column(Integer)
    correct_streak_at_time = Column(Integer)
    max_streak_so_far = Column(Integer)
    projected_final_score = Column(Integer)

    game = relationship("Game", back_populates="pattern_rounds")
