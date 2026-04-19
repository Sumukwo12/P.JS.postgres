from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
import os, sys
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:sumuu@localhost:5432/shopkenya"
)

# Fix Heroku-style URLs
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

try:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    print("[OK] PostgreSQL connected successfully.")
except Exception as e:
    print("\n" + "="*60)
    print("[ERROR] Cannot connect to PostgreSQL!")
    print(f"   Error: {e}")
    print("\n   Fix:")
    print("   1. Make sure PostgreSQL is running (check Windows Services)")
    print("   2. Run in pgAdmin:  CREATE DATABASE shopkenya;")
    print("   3. Check password in backend/.env:")
    print("      DATABASE_URL=postgresql://postgres:sumuu@localhost:5432/shopkenya")
    print("="*60 + "\n")
    sys.exit(1)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
