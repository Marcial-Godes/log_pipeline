import os

from dotenv import load_dotenv


load_dotenv()

class Settings:
    def __init__(self):
        self.ENV = os.getenv("ENV", "dev")

        # Configuración de conexión a base de datos
        self.DATABASE_URL = os.getenv("DATABASE_URL")
        if not self.DATABASE_URL:
            raise RuntimeError("DATABASE_URL no definida")

        self.REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

        self.API_URL = os.getenv("API_URL", "http://localhost:8000")
        self.WS_URL = os.getenv("WS_URL", "ws://localhost:8000/ws")

settings = Settings()