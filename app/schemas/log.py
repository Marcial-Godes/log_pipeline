from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class LogCreateSchema(BaseModel):
    # 🔥 obligatorio (mínimo necesario)
    endpoint: str = Field(..., example="/test")

    # 🔥 defaults inteligentes (ya no obligatorios)
    method: str = Field(default="GET", example="GET")
    status_code: int = Field(default=200, example=200)

    # 🔥 ya estaban bien
    response_time: Optional[float] = Field(
        default=0.0, example=123.4
    )

    ip: Optional[str] = Field(
        default="0.0.0.0", example="127.0.0.1"
    )

    user_agent: Optional[str] = None

    timestamp: Optional[datetime] = None