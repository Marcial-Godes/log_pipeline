from fastapi import APIRouter, Depends, Request
from datetime import datetime, UTC
import json
import random

from app.core.redis_client import redis_client
from app.schemas.log import LogCreateSchema

router = APIRouter(prefix="/logs", tags=["logs"])

QUEUE_NAME = "log_queue"

TEST_NET_POOLS = {
    "🇪🇸 Barcelona": "203.0.113",
    "🇺🇸 Nevada": "198.51.100",
    "🇩🇪 Berlin": "192.0.2",
    "🇫🇷 Paris": "203.0.114",
}


def generate_fake_ip(location):
    prefix = TEST_NET_POOLS[location]
    last_octet = random.randint(10,250)
    return f"{prefix}.{last_octet}"


@router.post("/")
async def create_log(
    log: LogCreateSchema,
    request: Request,
):
    log_dict = log.model_dump()

    # ✅ convertir datetime -> string SIEMPRE
    if isinstance(log_dict.get("timestamp"), datetime):
        log_dict["timestamp"] = log_dict["timestamp"].isoformat()

    # timestamp por defecto
    if not log_dict.get("timestamp"):
        log_dict["timestamp"] = datetime.now(UTC).isoformat()

    # enrich
    location = random.choice(
        list(TEST_NET_POOLS.keys())
    )

    log_dict["ip"] = generate_fake_ip(location)
    log_dict["user_agent"] = request.headers.get("user-agent", "unknown")

    # ✅ async correctamente
    await redis_client.rpush(QUEUE_NAME, json.dumps(log_dict))

    return {"status": "queued"}