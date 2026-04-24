import redis.asyncio as redis

from app.core.settings import settings


# Cliente Redis asíncrono compartido para API y WebSocket
redis_client = redis.from_url(
    settings.REDIS_URL,
    decode_responses=True
)