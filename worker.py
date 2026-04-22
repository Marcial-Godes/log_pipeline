import json
import time
from datetime import datetime, UTC

import redis
from sqlalchemy import select

from app.core.database import SessionLocal
from app.core.settings import settings
from app.models.log import Log
from app.models.metric import Metric

QUEUE_NAME = "log_queue"
CHANNEL_NAME = "logs_channel"

redis_client = redis.Redis.from_url(
    settings.REDIS_URL,
    decode_responses=True
)


def parse_timestamp(ts):
    if not ts:
        return datetime.now(UTC)
    if ts.endswith("Z"):
        ts = ts.replace("Z", "+00:00")
    return datetime.fromisoformat(ts)


def get_minute_key(dt):
    return dt.strftime("%Y-%m-%dT%H:%M")


def process_log(data):
    db = SessionLocal()

    try:
        ts = parse_timestamp(data.get("timestamp"))
        minute = get_minute_key(ts)

        endpoint = data.get("endpoint")
        status = data.get("status_code")
        response_time = data.get("response_time")

        # =========================
        # 🧾 GUARDAR LOG
        # =========================
        log = Log(
            endpoint=endpoint,
            method=data.get("method"),
            status_code=status,
            response_time=response_time,
            timestamp=ts,
            ip=data.get("ip"),
            user_agent=data.get("user_agent"),
        )

        db.add(log)
        db.commit()

        # =========================
        # 📊 REDIS METRICS
        # =========================
        pipe = redis_client.pipeline()

        pipe.incr(f"metrics:{minute}:total")

        if 200 <= status < 300:
            pipe.incr(f"metrics:{minute}:success")
        elif status >= 400:
            pipe.hincrby(f"metrics:{minute}:errors_by_endpoint", endpoint, 1)

        pipe.hincrby(f"metrics:{minute}:endpoints", endpoint, 1)

        pipe.hincrbyfloat(
            f"metrics:{minute}:response_time_sum",
            endpoint,
            float(response_time)
        )

        pipe.hincrby(
            f"metrics:{minute}:response_time_count",
            endpoint,
            1
        )

        pipe.execute()

        # =========================
        # 💾 PERSISTENCIA
        # =========================
        total = int(
            redis_client.hget(f"metrics:{minute}:endpoints", endpoint) or 0
        )

        errors = int(
            redis_client.hget(f"metrics:{minute}:errors_by_endpoint", endpoint) or 0
        )

        time_sum = float(
            redis_client.hget(f"metrics:{minute}:response_time_sum", endpoint) or 0
        )

        time_count = int(
            redis_client.hget(f"metrics:{minute}:response_time_count", endpoint) or 0
        )

        avg = (time_sum / time_count) if time_count > 0 else 0

        minute_dt = datetime.strptime(minute, "%Y-%m-%dT%H:%M").replace(tzinfo=UTC)

        existing = db.execute(
            select(Metric).where(
                Metric.timestamp_minute == minute_dt,
                Metric.endpoint == endpoint
            )
        ).scalar_one_or_none()

        if existing:
            existing.total = total
            existing.errors = errors
            existing.avg_response_time = round(avg, 3)
        else:
            metric = Metric(
                timestamp_minute=minute_dt,
                endpoint=endpoint,
                total=total,
                errors=errors,
                avg_response_time=round(avg, 3),
            )
            db.add(metric)

        db.commit()

        # =========================
        # 📡 WEBSOCKET
        # =========================
        redis_client.publish(
            CHANNEL_NAME,
            json.dumps({"type": "new_log", "data": data})
        )

        print(f"✅ Guardado + persistido: {endpoint} {status}")

    except Exception as e:
        print("❌ Error procesando log:", e)
        db.rollback()
    finally:
        db.close()


# 🔥 ESTA ES LA CLAVE QUE TE FALTA
def worker():
    print("🚀 Worker started...")

    while True:
        try:
            item = redis_client.blpop(QUEUE_NAME, timeout=5)

            if item:
                _, raw = item
                data = json.loads(raw)

                process_log(data)

        except Exception as e:
            print("❌ Worker error:", e)
            time.sleep(1)