import os
import time
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv


if os.getenv("ENV") != "production":
    load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

print("DATABASE_URL:", DATABASE_URL)

MAX_RETRIES = 10
RETRY_DELAY = 2

for i in range(MAX_RETRIES):
    try:
        engine = create_engine(DATABASE_URL)
        connection = engine.connect()

        # 🔥 DEBUG REAL: saber a qué DB estás conectado
        result = connection.execute(text("SELECT current_database(), inet_server_addr();"))
        db_name, db_host = result.fetchone()

        print(f"✅ Connected to DB: {db_name} at {db_host}")

        connection.close()
        break
    except Exception as e:
        print(f"⏳ Waiting for DB... ({i+1}/{MAX_RETRIES})")
        time.sleep(RETRY_DELAY)
else:
    raise Exception("❌ Could not connect to database")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()