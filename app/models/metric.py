from sqlalchemy import Column, Integer, Float, String, DateTime
from app.core.database import Base


# Métricas agregadas por minuto y endpoint
class Metric(Base):
    __tablename__ = "metrics_aggregated"

    id = Column(Integer, primary_key=True, index=True)

    # Bucket temporal de agregación por minuto
    timestamp_minute = Column(DateTime, index=True)
    endpoint = Column(String, index=True)

    # Volumen total de peticiones observadas
    total = Column(Integer, default=0)
    # Número de respuestas erróneas
    errors = Column(Integer, default=0)

    # Latencia media agregada del bucket
    avg_response_time = Column(Float, default=0)