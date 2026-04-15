from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import logs, analytics
from app.database import Base, engine, SessionLocal

# modelos
from app.models.log import Log

app = FastAPI()


# =========================
# DB INIT + SEED
# =========================
def init_db():
    Base.metadata.create_all(bind=engine)


@app.on_event("startup")
def startup_event():
    init_db()

    db = SessionLocal()

    # 🌱 seed si está vacío
    if db.query(Log).count() == 0:
        print("🌱 Seeding database...")

        sample_logs = [
            Log(endpoint="/login", method="POST", status_code=200),
            Log(endpoint="/login", method="POST", status_code=401),
            Log(endpoint="/orders", method="GET", status_code=200),
            Log(endpoint="/orders", method="POST", status_code=500),
            Log(endpoint="/users", method="GET", status_code=200),
        ]

        for log in sample_logs:
            db.add(log)

        db.commit()

    db.close()


# =========================
# HEALTH CHECK 🔥
# =========================
@app.get("/health")
def health():
    return {"status": "ok"}


# =========================
# CORS
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# ROUTES
# =========================
app.include_router(logs.router)
app.include_router(analytics.router)