from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.schemas.log import LogCreate
from app.models.log import Log
from app.metrics.metrics import metrics


def create_log(db: Session, log: LogCreate):
    print("🔥 create_log ejecutado")

    try:
        new_log = Log(
            endpoint=log.endpoint,
            method=log.method,
            status_code=log.status_code,
            timestamp=log.timestamp or datetime.utcnow(),
        )

        db.add(new_log)
        db.commit()

        print("💾 guardado en DB")

    except Exception as e:
        print("❌ ERROR:", e)
        db.rollback()

    if log.status_code and log.status_code >= 400:
        metrics.log_received("ERROR")
    else:
        metrics.log_received("INFO")

    return {"status": "stored"}


def create_logs_batch(db: Session, logs: List[LogCreate]):
    print("🔥 create_logs_batch ejecutado")

    try:
        for log in logs:
            new_log = Log(
                endpoint=log.endpoint,
                method=log.method,
                status_code=log.status_code,
                timestamp=log.timestamp or datetime.utcnow(),
            )
            db.add(new_log)

        db.commit()
        print("💾 batch guardado")

    except Exception as e:
        print("❌ ERROR:", e)
        db.rollback()

    return {"status": "stored"}