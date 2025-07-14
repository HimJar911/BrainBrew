from sqlalchemy import Column, Integer, String
from database import Base
from sqlalchemy.orm import relationship 

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    games = relationship("Game", back_populates="user")
    dual_games = relationship("DualGame", back_populates="user", cascade="all, delete")

