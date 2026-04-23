import os


# Carga y valida configuración desde variables de entorno
class Settings:
    def __init__(self):
        # Entorno de ejecución de la aplicación
        self.ENV = os.getenv("ENV", "dev")

        # Configuración de conexión a base de datos
        self.DATABASE_URL = os.getenv("DATABASE_URL")
        # Falla rápido si falta configuración crítica
        if not self.DATABASE_URL:
            raise ValueError("DATABASE_URL no definida")

        # Configuración de Redis
        self.REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

        # URLs base para API y WebSocket
        self.API_URL = os.getenv("API_URL", "http://localhost:8000")
        self.WS_URL = os.getenv("WS_URL", "ws://localhost:8000/ws")


# Instancia compartida de configuración del proyecto
settings = Settings()