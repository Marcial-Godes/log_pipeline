from sqlalchemy import Column, Integer, String, Float, DateTime
from app.core.database import Base


# Modelo de persistencia para logs crudos de entrada
class Log(Base):
    __tablename__ = "raw_logs"

    id = Column(Integer, primary_key=True, index=True)
    # Timestamp original del evento recibido
    timestamp = Column(DateTime, nullable=False)
    method = Column(String, nullable=False)
    endpoint = Column(String, nullable=False)
    status_code = Column(Integer, nullable=False)
    # Latencia de respuesta en segundos
    response_time = Column(Float, nullable=False)
    ip = Column(String, nullable=False)
    # Información del cliente que originó la petición
    user_agent = Column(String, nullable=True)