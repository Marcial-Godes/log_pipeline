from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime, UTC

from app.core.database import Base


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)

    # tipo de alerta
    type = Column(String, nullable=False)  
    # "latency" | "error_rate"

    # estado
    status = Column(String, nullable=False)  
    # "alert" | "recovery"

    # opcional (solo para latency)
    endpoint = Column(String, nullable=True)

    # valor actual
    value = Column(Float, nullable=False)

    # umbral que dispara alerta
    threshold = Column(Float, nullable=True)

    timestamp = Column(DateTime, default=lambda: datetime.now(UTC), nullable=False)