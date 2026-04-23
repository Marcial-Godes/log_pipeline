from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.core.settings import settings


print("🔗 Database configured:", settings.DATABASE_URL)

# Engine principal de conexión a PostgreSQL
engine = create_engine(
    settings.DATABASE_URL,
    # Verifica conexiones muertas antes de reutilizarlas
    pool_pre_ping=True,
)

# Factoría de sesiones SQLAlchemy por request o worker
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Clase base para todos los modelos ORM
Base = declarative_base()


# Dependencia FastAPI para abrir y cerrar sesiones de base de datos
def get_db():
    session = SessionLocal()
    try:
        yield session
    finally:
        # Garantiza cierre de sesión aunque falle la petición
        session.close()