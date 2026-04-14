import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise Exception("❌ DATABASE_URL not set")

print("DATABASE_URL:", DATABASE_URL)

# 🔥 IMPORTANTE PARA RENDER
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,   # evita conexiones muertas
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()