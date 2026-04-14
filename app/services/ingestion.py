from sqlalchemy.orm import Session
from typing import List
import json
from datetime import datetime

from app.schemas.log import LogCreate
from app.metrics.metrics import metrics
from app.core.redis_client import redis_client


def serialize_log(data: dict) -> dict:
    """
    Convierte tipos no serializables (datetime) a formato JSON válido
    """
    if data.get("timestamp") and isinstance(data["timestamp"], datetime):
        data["timestamp"] = data["timestamp"].isoformat()

    return data


def create_log(db: Session, log: LogCreate):
    print("🔥 create_log ejecutado")

    try:
        data = log.dict()
        data = serialize_log(data)

        print(f"📥 Log recibido: {data}")

        redis_client.rpush("log_queue", json.dumps(data))
        print("📦 enviado a redis")

        length = redis_client.llen("log_queue")
        print(f"📊 Cola tamaño después de push: {length}")

    except Exception as e:
        print("❌ ERROR enviando a Redis:", e)

    if log.status_code and log.status_code >= 400:
        metrics.log_received("ERROR")
    else:
        metrics.log_received("INFO")

    return {"status": "queued"}


def create_logs_batch(db: Session, logs: List[LogCreate]):
    print("🔥 create_logs_batch ejecutado")

    try:
        for log in logs:
            data = log.dict()
            data = serialize_log(data)

            print(f"📥 Log batch: {data}")

            redis_client.rpush("log_queue", json.dumps(data))

        length = redis_client.llen("log_queue")
        print(f"📊 Cola tamaño después de batch: {length}")

    except Exception as e:
        print("❌ ERROR enviando batch a Redis:", e)

    for log in logs:
        if log.status_code and log.status_code >= 400:
            metrics.log_received("ERROR")
        else:
            metrics.log_received("INFO")

    return {"status": "queued"}