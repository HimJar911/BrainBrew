from pydantic_settings import BaseSettings
import os
from dotenv import load_dotenv

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:Himanshujar911!@localhost:5432/BrainBrew"

settings = Settings()
load_dotenv()
