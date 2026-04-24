from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.core.settings import settings


print("🔗 Database configured:", settings.DATABASE_URL)

engine = create_engine(
    settings.DATABASE_URL,
    # Verifica conexiones muertas antes de reutilizarlas
    pool_pre_ping=True,
)

# Sesiones de base de datos para API y workers
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Clase base para todos los modelos ORM
Base = declarative_base()


# Dependencia para gestionar sesiones por petición
def get_db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()