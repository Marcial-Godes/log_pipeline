from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.schemas.log import LogCreate, LogQueuedResponse
from app.services.ingestion import create_log, create_logs_batch
from app.core.database import SessionLocal

router = APIRouter(prefix="/logs", tags=["logs"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=LogQueuedResponse)
def create_new_log(log: LogCreate, db: Session = Depends(get_db)):
    return create_log(db, log)


@router.post("/batch", response_model=LogQueuedResponse)
def create_logs(logs: list[LogCreate], db: Session = Depends(get_db)):
    return create_logs_batch(db, logs)


@router.get("/stats/summary")
def get_summary(db: Session = Depends(get_db)):
    total = db.execute(text("SELECT COUNT(*) FROM raw_logs")).scalar()

    errors = db.execute(text("""
        SELECT COUNT(*) FROM raw_logs WHERE status_code >= 400
    """)).scalar()

    success = total - errors if total else 0

    return {
        "total": total,
        "errors": errors,
        "success": success
    }


@router.get("/recent")
def get_recent_logs(db: Session = Depends(get_db)):
    result = db.execute(text("""
        SELECT endpoint, status_code, method, response_time, timestamp
        FROM raw_logs
        ORDER BY timestamp DESC
        LIMIT 50
    """))

    logs = [dict(row._mapping) for row in result]

    return logs


@router.get("/stats/top-endpoints")
def top_endpoints(db: Session = Depends(get_db)):
    result = db.execute(text("""
        SELECT endpoint, COUNT(*) as count
        FROM raw_logs
        GROUP BY endpoint
        ORDER BY count DESC
        LIMIT 5
    """))

    return [dict(row._mapping) for row in result]