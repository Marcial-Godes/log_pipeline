import redis.asyncio as redis

from app.core.settings import settings


print(f"🔗 Connecting to Redis at: {settings.REDIS_URL}")

redis_client = redis.from_url(
    settings.REDIS_URL,
    decode_responses=True
)