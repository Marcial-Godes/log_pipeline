import json
import asyncio
import threading

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

import redis.asyncio as redis

from app.websocket.manager import manager
from app.core.database import Base, engine
from app.core.settings import settings

from app.api.routes import logs, metrics
from app.api.routes.alerts import router as alerts_router

from worker import worker as run_worker
from alert_worker import run as run_alert_worker


app = FastAPI()

CHANNEL_NAME = "logs_channel"

# Cliente Redis asíncrono usado por la API y la difusión vía WebSocket
redis_client = redis.from_url(
    settings.REDIS_URL,
    decode_responses=True
)


@app.api_route("/", methods=["GET", "HEAD"])
def root():
    return JSONResponse(content={"message": "Log Pipeline API running"})


@app.get("/health")
def health():
    return {"status": "ok"}


# WebSocket para emitir eventos en tiempo real al frontend
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)

    try:
        while True:
            # Mantiene viva la conexión mientras el cliente siga conectado
            await asyncio.sleep(10)
    except WebSocketDisconnect:
        manager.disconnect(websocket)


# Suscripción a Redis Pub/Sub para reenviar eventos a clientes WebSocket
async def redis_listener():
    while True:
        try:
            pubsub = redis_client.pubsub()
            await pubsub.subscribe(CHANNEL_NAME)

            print("📡 Subscribed to Redis channel")

            while True:
                message = await pubsub.get_message(
                    ignore_subscribe_messages=True,
                    timeout=1.0,
                )

                if message:
                    data = json.loads(message["data"])
                    await manager.broadcast(data)

                await asyncio.sleep(0.01)

        except Exception as e:
            print("❌ Redis listener error:", e)
            await asyncio.sleep(2)


# Inicializa los procesos en segundo plano para logs y alertas
def start_background_workers():
    print("🚀 Starting background workers...")

    threading.Thread(target=run_worker, daemon=True).start()
    threading.Thread(target=run_alert_worker, daemon=True).start()


# Arranque de tablas, listener Redis y workers de background
@app.on_event("startup")
async def startup_event():
    Base.metadata.create_all(bind=engine)

    asyncio.create_task(redis_listener())

    start_background_workers()


# Configuración CORS para permitir acceso del frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Registro de rutas de la API
app.include_router(logs.router)
app.include_router(metrics.router)
app.include_router(alerts_router)