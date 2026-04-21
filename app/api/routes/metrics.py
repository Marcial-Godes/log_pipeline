from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.metric import Metric

router = APIRouter(
    prefix="/metrics",
    tags=["metrics"]
)


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