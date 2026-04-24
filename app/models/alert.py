from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime, UTC

from app.core.database import Base


# Modelo de persistencia para eventos de alerta y recuperación
class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)

    # Tipo de condición monitorizada que genera la alerta
    type = Column(String, nullable=False)  
    # "alert" | "recovery"

    # Estado del ciclo de alerta: activación o recuperación
    status = Column(String, nullable=False)  
    # "alert" | "recovery"

    # Endpoint afectado cuando la alerta es específica
    endpoint = Column(String, nullable=True)

    # Valor observado que disparó o resolvió la alerta
    value = Column(Float, nullable=False)

    # Umbral configurado asociado a la alerta
    threshold = Column(Float, nullable=True)

    # Momento en que se registró la alerta
    timestamp = Column(DateTime, default=lambda: datetime.now(UTC), nullable=False)