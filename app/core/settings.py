import os


class Settings:
    def __init__(self):
        # 🔥 entorno
        self.ENV = os.getenv("ENV", "dev")

        # 🔥 base de datos
        self.DATABASE_URL = os.getenv("DATABASE_URL")
        if not self.DATABASE_URL:
            raise ValueError("❌ DATABASE_URL no definida")

        # 🔥 redis
        self.REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

        # 🔥 websocket / api (para frontend si lo necesitas)
        self.API_URL = os.getenv("API_URL", "http://localhost:8000")
        self.WS_URL = os.getenv("WS_URL", "ws://localhost:8000/ws")


settings = Settings()