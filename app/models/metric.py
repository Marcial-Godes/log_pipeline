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
# 📊 WINDOW (FIX COMPLETO)
# =========================
@router.get("/window")
def metrics_window(
    minutes: int = Query(60, ge=1, le=1440),
    db: Session = Depends(get_db)
):
    since = datetime.now(UTC) - timedelta(minutes=minutes)

    # 🔢 Totales globales
    totals = db.query(
        func.sum(Metric.total).label("total"),
        func.sum(Metric.errors).label("errors"),
    ).filter(
        Metric.timestamp_minute >= since
    ).first()

    total = totals.total or 0
    errors = totals.errors or 0

    # 📊 Avg global REAL (ponderado)
    weighted = db.query(
        func.sum(Metric.avg_response_time * Metric.total).label("weighted_sum"),
        func.sum(Metric.total).label("total_sum"),
    ).filter(
        Metric.timestamp_minute >= since
    ).first()

    if weighted.total_sum and weighted.total_sum > 0:
        avg_global = weighted.weighted_sum / weighted.total_sum
    else:
        avg_global = 0

    # 🐢 Endpoints más lentos
    slow = db.query(
        Metric.endpoint,
        func.avg(Metric.avg_response_time).label("avg_response_time")
    ).filter(
        Metric.timestamp_minute >= since
    ).group_by(
        Metric.endpoint
    ).order_by(
        func.avg(Metric.avg_response_time).desc()
    ).limit(5).all()

    slowest = [
        {
            "endpoint": s.endpoint,
            "avg_response_time": float(s.avg_response_time or 0)
        }
        for s in slow
    ]

    return {
        "total": int(total),
        "errors": int(errors),
        "error_rate": round((errors / total * 100), 2) if total > 0 else 0,
        "avg_response_time_global": round(avg_global, 3),
        "slowest_endpoints": slowest
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