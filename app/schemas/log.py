from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class LogCreate(BaseModel):
    endpoint: str
    status_code: int
    timestamp: Optional[datetime] = None
    method: Optional[str] = None
    response_time: Optional[float] = None
    ip: Optional[str] = None
    user_agent: Optional[str] = None


class LogResponse(BaseModel):
    id: int
    timestamp: datetime
    method: Optional[str]
    endpoint: str
    status_code: int
    response_time: Optional[float]
    ip: Optional[str]
    user_agent: Optional[str]

    class Config:
        from_attributes = True


# 🔥 NUEVO (IMPORTANTE)
class LogQueuedResponse(BaseModel):
    status: str