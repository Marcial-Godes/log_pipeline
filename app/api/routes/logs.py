from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.log import Log
from app.websocket.manager import manager

router = APIRouter(prefix="/logs", tags=["logs"])


# =========================
# CREATE LOG
# =========================
@router.post("/")
async def create_log(log: dict, db: Session = Depends(get_db)):
    new_log = Log(**log)
    db.add(new_log)
    db.commit()
    db.refresh(new_log)

    # 🔥 enviar por websocket
    await manager.broadcast({
        "type": "new_log",
        "data": {
            "endpoint": new_log.endpoint,
            "method": new_log.method,
            "status_code": new_log.status_code,
        }
    })

    return new_log


# =========================
# GET RECENT LOGS
# =========================
@router.get("/recent")
def get_recent_logs(db: Session = Depends(get_db)):
    logs = (
        db.query(Log)
        .order_by(Log.id.desc())
        .limit(50)
        .all()
    )

    return [
        {
            "endpoint": log.endpoint,
            "method": log.method,
            "status_code": log.status_code,
        }
        for log in logs
    ]