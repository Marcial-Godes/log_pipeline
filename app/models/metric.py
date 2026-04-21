from sqlalchemy import Column, Integer, Float, String, DateTime
from app.core.database import Base


class Metric(Base):
    __tablename__ = "metrics_aggregated"

    id = Column(Integer, primary_key=True, index=True)

    timestamp_minute = Column(DateTime, index=True)
    endpoint = Column(String, index=True)

    total = Column(Integer, default=0)
    errors = Column(Integer, default=0)

    avg_response_time = Column(Float, default=0)
    

from app.models.metric import Metric
from sqlalchemy.orm import Session
from app.core.database import get_db
from fastapi import Depends

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