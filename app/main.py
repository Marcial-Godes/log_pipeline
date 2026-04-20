import json
import asyncio

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

import redis.asyncio as redis

from app.websocket.manager import manager
from app.core.database import Base, engine
from app.core.settings import settings

from app.api.routes import logs, analytics, metrics
from app.api.routes.alerts import router as alerts_router


app = FastAPI()

CHANNEL_NAME = "logs_channel"

# ✅ Redis desde settings (NO hardcode)
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
# 📡 REDIS LISTENER (mejorado)
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
            await asyncio.sleep(2)  # 🔥 retry real


@app.on_event("startup")
async def startup_event():
    # ⚠️ mantenemos esto de momento, luego lo quitamos si quieres
    Base.metadata.create_all(bind=engine)

    asyncio.create_task(redis_listener())


# =========================
# 🌐 CORS
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # luego lo cerraremos
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