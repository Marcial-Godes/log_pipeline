from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta, UTC

from app.core.database import get_db
from app.models.metric import Metric

router = APIRouter(
    prefix="/metrics",
    tags=["metrics"]
)


# =========================
# 🧪 DEBUG
# =========================
@router.get("/db-test")
def test_db(db: Session = Depends(get_db)):
    data = db.query(Metric).order_by(Metric.id.desc()).limit(5).all()

    return [
        {
            "minute": str(m.timestamp_minute),
            "endpoint": m.endpoint,
            "total": m.total,
            "errors": m.errors,
            "avg": m.avg_response_time,
        }
        for m in data
    ]


# =========================
# 📊 WINDOW (agregado simple)
# =========================
@router.get("/window")
def metrics_window(
    minutes: int = Query(60, ge=1, le=1440),
    db: Session = Depends(get_db)
):
    since = datetime.now(UTC) - timedelta(minutes=minutes)

    data = db.query(
        func.sum(Metric.total).label("total"),
        func.sum(Metric.errors).label("errors"),
    ).filter(
        Metric.timestamp_minute >= since
    ).first()

    total = data.total or 0
    errors = data.errors or 0

    return {
        "total": int(total),
        "errors": int(errors),
        "error_rate": round((errors / total * 100), 2) if total > 0 else 0
    }


# =========================
# 📈 TIMESERIES
# =========================
@router.get("/timeseries")
def metrics_timeseries(
    minutes: int = Query(120, ge=1, le=1440),
    db: Session = Depends(get_db)
):
    since = datetime.now(UTC) - timedelta(minutes=minutes)

    rows = db.query(
        Metric.timestamp_minute,
        func.sum(Metric.total).label("total"),
        func.sum(Metric.errors).label("errors"),
        func.avg(Metric.avg_response_time).label("avg_response_time"),
    ).filter(
        Metric.timestamp_minute >= since
    ).group_by(
        Metric.timestamp_minute
    ).order_by(
        Metric.timestamp_minute
    ).all()

    return {
        "series": [
            {
                "minute": str(r.timestamp_minute),
                "total": int(r.total or 0),
                "errors": int(r.errors or 0),
                "avg_response_time": float(r.avg_response_time or 0),
            }
            for r in rows
        ]
    }