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