from sqlalchemy import Column, Integer, ForeignKey, Boolean, Float, String
from sqlalchemy.orm import relationship
from database import Base


class DualGame(Base):
    __tablename__ = "dual_games"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    difficulty = Column(String, default="medium")
    score = Column(Integer, default=0)
    total_rounds = Column(Integer, default=0)
    correct = Column(Integer, default=0)

    user = relationship("User", back_populates="dual_games")
    rounds = relationship("DualRound", back_populates="game", cascade="all, delete")


class DualRound(Base):
    __tablename__ = "dual_rounds"

    id = Column(Integer, primary_key=True, index=True)
    game_id = Column(Integer, ForeignKey("dual_games.id"))
    round_number = Column(Integer)
    visual_stimulus = Column(String)
    audio_stimulus = Column(String)
    user_response_visual = Column(Boolean)
    user_response_audio = Column(Boolean)
    correct_visual = Column(Boolean)
    correct_audio = Column(Boolean)
    response_time = Column(Float)

    game = relationship("DualGame", back_populates="rounds")
