from fastapi import APIRouter, Query, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.alert import Alert

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("/")
def get_alerts(
    limit: int = Query(default=20),
    db: Session = Depends(get_db),
):
    alerts = (
        db.query(Alert)
        .order_by(Alert.id.desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "id": a.id,
            "type": a.type,
            "status": a.status,
            "endpoint": a.endpoint,
            "value": a.value,
            "threshold": a.threshold,
            "timestamp": a.timestamp.isoformat(),
        }
        for a in alerts
    ]