from sqlalchemy import Column, Integer, String, Float, DateTime
from app.core.database import Base


class Log(Base):
    __tablename__ = "raw_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, nullable=False)
    method = Column(String, nullable=False)
    endpoint = Column(String, nullable=False)
    status_code = Column(Integer, nullable=False)
    response_time = Column(Float, nullable=False)
    ip = Column(String, nullable=False)
    user_agent = Column(String, nullable=True)  # 👈 CLAVE