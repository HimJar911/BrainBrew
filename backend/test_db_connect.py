from sqlalchemy import create_engine, text
from config import settings

try:
    engine = create_engine(settings.DATABASE_URL)
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        print("✅ PostgreSQL connection successful!")
        print("Result:", result.scalar())
except Exception as e:
    print("❌ Connection failed:")
    print(e)
