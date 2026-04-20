import time
import json
from datetime import datetime, UTC, timedelta

import redis

from app.models.alert import Alert
from app.core.database import SessionLocal, engine, Base
from app.core.settings import settings

CHANNEL_NAME = "logs_channel"

ALERT_THRESHOLD = 12
RECOVERY_THRESHOLD = 5

WINDOW_MINUTES = 5
CHECK_INTERVAL = 3

COOLDOWN_SECONDS = 15

# ✅ Redis desde settings (NO hardcode)
redis_client = redis.Redis.from_url(
    settings.REDIS_URL,
    decode_responses=True
)


# =========================
# 🧠 WAIT FOR DB
# =========================
def wait_for_db():
    print("⏳ Esperando a Postgres...")

    while True:
        try:
            conn = engine.connect()
            conn.close()
            print("✅ Postgres listo")
            return
        except Exception:
            print("❌ Postgres no disponible, reintentando...")
            time.sleep(2)


wait_for_db()

Base.metadata.create_all(bind=engine)


# =========================
# 🔧 UTILS
# =========================
def format_minute(dt):
    return dt.strftime("%Y-%m-%dT%H:%M")


def get_status_key():
    return "system:error_rate_status"


def get_last_alert_ts_key():
    return "system:last_alert_ts"


# =========================
# 📊 ERROR RATE
# =========================
def calculate_error_rate():
    now = datetime.now(UTC)

    totals = 0
    errors = 0

    for i in range(WINDOW_MINUTES):
        minute_dt = now - timedelta(minutes=i)
        minute = format_minute(minute_dt)

        totals += int(redis_client.get(f"metrics:{minute}:total") or 0)
        errors += int(redis_client.get(f"metrics:{minute}:errors") or 0)

    if totals == 0:
        return 0

    return (errors / totals) * 100


# =========================
# 🚨 ALERT HANDLER
# =========================
def handle_error_rate_alert():
    status_key = get_status_key()
    last_ts_key = get_last_alert_ts_key()

    current_status = redis_client.get(status_key) or "ok"
    last_ts = int(redis_client.get(last_ts_key) or 0)

    now_ts = int(time.time())

    error_rate = calculate_error_rate()
    error_rate_rounded = round(error_rate)

    db = SessionLocal()

    try:
        # =========================
        # 🔴 ALERT
        # =========================
        if error_rate >= ALERT_THRESHOLD:

            if current_status == "alert":
                return

            if now_ts - last_ts < COOLDOWN_SECONDS:
                return

            redis_client.set(status_key, "alert")
            redis_client.set(last_ts_key, now_ts)

            print(f"🚨 ALERT → error_rate={error_rate_rounded}")

            alert_db = Alert(
                type="error_rate",
                status="alert",
                endpoint="system",
                value=error_rate_rounded,
                threshold=ALERT_THRESHOLD,
            )

            db.add(alert_db)
            db.commit()

            print("💾 Guardado en DB")

            redis_client.publish(
                CHANNEL_NAME,
                json.dumps({
                    "type": "alert",
                    "data": {
                        "endpoint": "system",
                        "avg_response_time": error_rate_rounded,
                    },
                }),
            )

        # =========================
        # 🟢 RECOVERY
        # =========================
        elif error_rate < RECOVERY_THRESHOLD:

            if current_status != "alert":
                return

            if now_ts - last_ts < COOLDOWN_SECONDS:
                return

            redis_client.set(status_key, "ok")
            redis_client.set(last_ts_key, now_ts)

            print(f"🟢 RECOVERY → error_rate={error_rate_rounded}")

            alert_db = Alert(
                type="error_rate",
                status="recovery",
                endpoint="system",
                value=error_rate_rounded,
                threshold=RECOVERY_THRESHOLD,
            )

            db.add(alert_db)
            db.commit()

            print("💾 Recovery guardado en DB")

            redis_client.publish(
                CHANNEL_NAME,
                json.dumps({
                    "type": "recovery",
                    "data": {
                        "endpoint": "system",
                        "avg_response_time": error_rate_rounded,
                    },
                }),
            )

    except Exception as e:
        print("❌ ERROR guardando alert:", e)
        db.rollback()
    finally:
        db.close()


# =========================
# 🔁 LOOP
# =========================
def run():
    print("🚀 Alert Worker started...")

    while True:
        try:
            handle_error_rate_alert()
        except Exception as e:
            print("❌ ERROR en alert_worker:", e)

        time.sleep(CHECK_INTERVAL)


if __name__ == "__main__":
    run()