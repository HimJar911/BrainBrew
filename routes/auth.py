from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials, OAuth2PasswordRequestForm
from pydantic import BaseModel

from database import SessionLocal
from models import user as user_model
from schemas import user as user_schema
from auth import hash, jwt_handler

router = APIRouter()
oauth2_scheme = HTTPBearer()


# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Register
@router.post("/register", response_model=user_schema.UserOut)
def register(user: user_schema.UserCreate, db: Session = Depends(get_db)):
    existing = (
        db.query(user_model.User).filter(user_model.User.email == user.email).first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = hash.hash_password(user.password)
    new_user = user_model.User(
        username=user.username, email=user.email, hashed_password=hashed_pw
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


# Login
@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    user = (
        db.query(user_model.User)
        .filter(user_model.User.email == form_data.username)
        .first()
    )
    if not user or not hash.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = jwt_handler.create_access_token({"user_id": user.id})
    return {"access_token": token, "token_type": "bearer"}


# Auth helper
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    try:
        token = credentials.credentials  # Extract token string from Bearer header
        payload = jwt_handler.decode_token(token)
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = db.query(user_model.User).filter(user_model.User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


# /me route
class UserResponse(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        from_attributes = True


@router.get("/me", response_model=UserResponse)
def read_current_user(current_user: user_model.User = Depends(get_current_user)):
    return current_user
