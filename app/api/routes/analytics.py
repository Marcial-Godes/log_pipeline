from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional

from app.core.database import SessionLocal
from app.metrics.metrics import metrics
from app.services.analytics import (
    get_error_count,
    logs_by_endpoint,
    status_codes,
    top_endpoints,
    latency_by_endpoint,
    latency_percentiles,
)

router = APIRouter(prefix="/analytics")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/errors")
def error_count(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
):
    return get_error_count(db, start_date, end_date)


@router.get("/by-endpoint")
def by_endpoint(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
):
    return logs_by_endpoint(db, start_date, end_date)


@router.get("/status-codes")
def codes(db: Session = Depends(get_db)):
    return status_codes(db)


@router.get("/top-endpoints")
def top(
    limit: int = Query(5),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    errors_only: bool = Query(False),
    db: Session = Depends(get_db),
):
    return top_endpoints(
        db,
        limit=limit,
        start_date=start_date,
        end_date=end_date,
        errors_only=errors_only,
    )


@router.get("/latency")
def latency(
    limit: int = Query(5),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
):
    return latency_by_endpoint(
        db,
        limit=limit,
        start_date=start_date,
        end_date=end_date,
    )


@router.get("/latency/percentiles")
def latency_p(
    limit: int = Query(5),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
):
    return latency_percentiles(
        db,
        limit=limit,
        start_date=start_date,
        end_date=end_date,
    )


@router.get("/metrics")
def system_metrics():
    return metrics.get_metrics()