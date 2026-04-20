from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from datetime import datetime, UTC
import json

from app.core.database import get_db
from app.core.redis_client import redis_client
from app.schemas.log import LogCreateSchema

router = APIRouter(prefix="/logs", tags=["logs"])

QUEUE_NAME = "log_queue"


@router.post("/")
async def create_log(
    log: LogCreateSchema,
    request: Request,
    db: Session = Depends(get_db),
):
    log_dict = log.model_dump()

    # ✅ convertir datetime -> string SIEMPRE
    if isinstance(log_dict.get("timestamp"), datetime):
        log_dict["timestamp"] = log_dict["timestamp"].isoformat()

    # timestamp por defecto
    if not log_dict.get("timestamp"):
        log_dict["timestamp"] = datetime.now(UTC).isoformat()

    # enrich
    log_dict["ip"] = request.client.host if request.client else "unknown"
    log_dict["user_agent"] = request.headers.get("user-agent", "unknown")

    # ✅ async correctamente
    await redis_client.rpush(QUEUE_NAME, json.dumps(log_dict))

    return {"status": "queued"}