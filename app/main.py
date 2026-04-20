import json
import asyncio
import threading

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

import redis.asyncio as redis

from app.websocket.manager import manager
from app.core.database import Base, engine
from app.core.settings import settings

from app.api.routes import logs, analytics, metrics
from app.api.routes.alerts import router as alerts_router

# 🔥 IMPORTANTE
from worker import worker as run_worker
from alert_worker import run as run_alert_worker


app = FastAPI()

CHANNEL_NAME = "logs_channel"

# Redis async (para API / WS)
redis_client = redis.from_url(
    settings.REDIS_URL,
    decode_responses=True
)


@app.get("/")
def root():
    return {"message": "Log Pipeline API running"}


@app.get("/health")
def health():
    return {"status": "ok"}


# =========================
# 🔌 WEBSOCKET
# =========================
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)

    try:
        while True:
            await asyncio.sleep(10)
    except WebSocketDisconnect:
        manager.disconnect(websocket)


# =========================
# 📡 REDIS LISTENER
# =========================
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


# =========================
# 🔥 START WORKERS (KEY)
# =========================
def start_background_workers():
    print("🚀 Starting background workers...")

    # worker principal
    threading.Thread(target=run_worker, daemon=True).start()

    # alert worker
    threading.Thread(target=run_alert_worker, daemon=True).start()


@app.on_event("startup")
async def startup_event():
    Base.metadata.create_all(bind=engine)

    asyncio.create_task(redis_listener())

    # 🔥 CLAVE
    start_background_workers()


# =========================
# 🌐 CORS
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# 📦 ROUTERS
# =========================
app.include_router(logs.router)
app.include_router(analytics.router)
app.include_router(metrics.router)
app.include_router(alerts_router)