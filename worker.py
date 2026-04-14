import json
import time
from datetime import datetime, UTC

from app.database import SessionLocal
from app.models.log import Log
from app.core.redis_client import redis_client

QUEUE_NAME = "log_queue"


def process_log(data):
    db = SessionLocal()

    try:
        print(f"📥 Procesando log: {data}")

        if not data.get("timestamp"):
            data["timestamp"] = datetime.now(UTC)

        log = Log(**data)

        db.add(log)
        db.commit()
        db.refresh(log)

        print(f"✅ Log guardado en DB ID={log.id}")

    except Exception as e:
        print("❌ ERROR guardando en DB:")
        print(e)
        db.rollback()

    finally:
        db.close()


def run_worker():
    print("🚀 Worker started...")

    while True:
        item = redis_client.blpop(QUEUE_NAME, timeout=5)

        if item:
            _, log_data = item

            print(f"📦 Mensaje recibido: {log_data}")

            try:
                data = json.loads(log_data)
                process_log(data)
            except Exception as e:
                print("❌ ERROR procesando mensaje:")
                print(e)
        else:
            time.sleep(1)


if __name__ == "__main__":
    run_worker()