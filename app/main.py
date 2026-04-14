from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import logs, analytics
from app.database import Base, engine

# 🔥 IMPORTAR MODELOS (solo los necesarios)
from app.models.log import Log

app = FastAPI()


# =========================
# CREAR TABLAS
# =========================
def init_db():
    Base.metadata.create_all(bind=engine)


# =========================
# STARTUP
# =========================
@app.on_event("startup")
def startup_event():
    init_db()


# =========================
# CORS
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 👈 para desarrollo, lo más simple
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# ROUTES
# =========================
app.include_router(logs.router)
app.include_router(analytics.router)