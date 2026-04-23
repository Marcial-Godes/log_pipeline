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

STATUS_KEY = "system:error_rate_status"
LAST_ALERT_TS_KEY = "system:last_alert_ts"

# Cliente Redis configurado desde settings del proyecto
redis_client = redis.Redis.from_url(
    settings.REDIS_URL,
    decode_responses=True
)


# Espera activa hasta que PostgreSQL esté disponible
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


# Validar conexión antes de arrancar el worker
wait_for_db()

Base.metadata.create_all(bind=engine)


# Utilidades auxiliares
def format_minute(dt):
    return dt.strftime("%Y-%m-%dT%H:%M")


# ERROR RATE

def calculate_error_rate():
    now = datetime.now(UTC)

    totals = 0
    errors = 0

    # Calcula error rate sobre una ventana móvil de N minutos
    for i in range(WINDOW_MINUTES):
        minute_dt = now - timedelta(minutes=i)
        minute = format_minute(minute_dt)

        totals += int(redis_client.get(f"metrics:{minute}:total") or 0)
        errors += sum(
            int(v) for v in redis_client.hvals(f"metrics:{minute}:errors_by_endpoint") or []
        )

    if totals == 0:
        return 0

    return (errors / totals) * 100



# ALERT HANDLER

def handle_error_rate_alert():
    STATUS_KEY
    LAST_ALERT_TS_KEY

    current_status = redis_client.get(status_key) or "ok"
    last_ts = int(redis_client.get(last_ts_key) or 0)

    now_ts = int(time.time())

    error_rate = calculate_error_rate()
    error_rate_rounded = round(error_rate)

    db = SessionLocal()

    try:
        # Generación de alerta por exceso de errores
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

        # Recuperación cuando la tasa vuelve a niveles normales
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

            print("💾 Recovery guardada en DB")

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


# Bucle principal del worker de alertas
def run():
    print("🚀 Alert Worker started...")

    while True:
        try:
            handle_error_rate_alert()
        except Exception as e:
            print("❌ ERROR en alert_worker:", e)

        # Espera entre evaluaciones de alertas
        time.sleep(CHECK_INTERVAL)


if __name__ == "__main__":
    run()