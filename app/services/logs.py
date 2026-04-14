from sqlalchemy.orm import Session
from app.models.log import Log
from app.schemas.log import LogCreate
from datetime import datetime


def create_log(db: Session, log_data: LogCreate):
    log = Log(
        timestamp=log_data.timestamp or datetime.utcnow(),
        method=log_data.method,
        endpoint=log_data.endpoint,
        status_code=log_data.status_code,
        response_time=log_data.response_time,
        ip=log_data.ip,
    )

    db.add(log)
    db.commit()
    db.refresh(log)

    return log


def bulk_create_logs(db: Session, logs: list[LogCreate]):
    db_logs = [
        Log(
            timestamp=log.timestamp or datetime.utcnow(),
            method=log.method,
            endpoint=log.endpoint,
            status_code=log.status_code,
            response_time=log.response_time,
            ip=log.ip,
        )
        for log in logs
    ]

    db.add_all(db_logs)
    db.commit()

    return {"inserted": len(db_logs)}
