from fastapi import APIRouter, Query, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.alert import Alert

# Endpoints para consulta del histórico de alertas
router = APIRouter(prefix="/alerts", tags=["alerts"])


# Devuelve las alertas más recientes en orden descendente
@router.get("/")
def get_alerts(
    # Número máximo de alertas a devolver
    limit: int = Query(default=20),
    db: Session = Depends(get_db),
):
    # Consulta del histórico ordenado por más reciente primero
    alerts = (
        db.query(Alert)
        .order_by(Alert.id.desc())
        .limit(limit)
        .all()
    )

    # Serialización ligera para respuesta API
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