from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from typing import Optional

from app.models.log import Log


def get_error_count(
    db: Session,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
):
    query = db.query(func.count(Log.id)).filter(Log.status_code >= 400)

    if start_date:
        query = query.filter(Log.timestamp >= start_date)

    if end_date:
        query = query.filter(Log.timestamp <= end_date)

    return {"error_count": query.scalar()}


def logs_by_endpoint(
    db: Session,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
):
    query = db.query(
        Log.endpoint,
        func.count(Log.id).label("count")
    )

    if start_date:
        query = query.filter(Log.timestamp >= start_date)

    if end_date:
        query = query.filter(Log.timestamp <= end_date)

    results = query.group_by(Log.endpoint).all()

    return [
        {"endpoint": r.endpoint, "count": r.count}
        for r in results
    ]


def status_codes(db: Session):
    results = db.query(
        Log.status_code,
        func.count(Log.id).label("count")
    ).group_by(Log.status_code).all()

    return [
        {"status_code": r.status_code, "count": r.count}
        for r in results
    ]


def top_endpoints(
    db: Session,
    limit: int = 5,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    errors_only: bool = False,
):
    query = db.query(
        Log.endpoint,
        func.count(Log.id).label("count")
    )

    if start_date:
        query = query.filter(Log.timestamp >= start_date)

    if end_date:
        query = query.filter(Log.timestamp <= end_date)

    if errors_only:
        query = query.filter(Log.status_code >= 400)

    results = (
        query
        .group_by(Log.endpoint)
        .order_by(func.count(Log.id).desc())
        .limit(limit)
        .all()
    )

    return [
        {"endpoint": r.endpoint, "count": r.count}
        for r in results
    ]


def latency_by_endpoint(
    db: Session,
    limit: int = 5,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
):
    query = db.query(
        Log.endpoint,
        func.avg(Log.response_time).label("avg_response_time"),
        func.count(Log.id).label("count")
    )

    if start_date:
        query = query.filter(Log.timestamp >= start_date)

    if end_date:
        query = query.filter(Log.timestamp <= end_date)

    results = (
        query
        .group_by(Log.endpoint)
        .order_by(func.avg(Log.response_time).desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "endpoint": r.endpoint,
            "avg_response_time": round(r.avg_response_time or 0, 3),
            "count": r.count
        }
        for r in results
    ]


# 🔥 NUEVO — PERCENTILES
def latency_percentiles(
    db: Session,
    limit: int = 5,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
):
    p95 = func.percentile_cont(0.95).within_group(Log.response_time)
    p99 = func.percentile_cont(0.99).within_group(Log.response_time)

    query = db.query(
        Log.endpoint,
        p95.label("p95"),
        p99.label("p99"),
        func.count(Log.id).label("count")
    )

    if start_date:
        query = query.filter(Log.timestamp >= start_date)

    if end_date:
        query = query.filter(Log.timestamp <= end_date)

    results = (
        query
        .group_by(Log.endpoint)
        .order_by(p99.desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "endpoint": r.endpoint,
            "p95": round(r.p95 or 0, 3),
            "p99": round(r.p99 or 0, 3),
            "count": r.count
        }
        for r in results
    ]