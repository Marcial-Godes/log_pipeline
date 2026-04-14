import redis
import os

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

print(f"🔗 Connecting to Redis at: {REDIS_URL}")

try:
    redis_client = redis.Redis.from_url(REDIS_URL)
    # ❌ NO hacer ping aquí
except Exception as e:
    print(f"❌ Redis connection error: {e}")
    redis_client = None