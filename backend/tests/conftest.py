import pytest
from fastapi.testclient import TestClient
from main import app
from database import SessionLocal, Base, engine
from models import user as user_model

@pytest.fixture(scope="module")
def test_client():
    Base.metadata.create_all(bind=engine)
    client = TestClient(app)
    yield client
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="module")
def test_user(test_client):
    user_data = {"email": "test@example.com", "password": "testpass"}
    test_client.post("/auth/register", json=user_data)
    response = test_client.post("/auth/login", json=user_data)
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
