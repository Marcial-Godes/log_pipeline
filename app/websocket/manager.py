import json
from fastapi import WebSocket


# Gestiona conexiones WebSocket activas y broadcast en tiempo real
class ConnectionManager:
    def __init__(self):
        # Conexiones WebSocket actualmente suscritas
        self.active_connections = []

    # Acepta y registra una nueva conexión cliente
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print("🟢 WS connected")

    # Elimina conexiones cerradas o inválidas
    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        print("🔴 WS disconnected")

    # Difunde eventos a todos los clientes conectados
    async def broadcast(self, data: dict):
        # Se acumulan para evitar modificar la lista durante la iteración
        dead_connections = []

        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(data))
            except Exception as e:
                print(f"❌ WS send error: {e}")
                dead_connections.append(connection)

        # Limpieza de conexiones caídas detectadas durante el envío
        for conn in dead_connections:
            self.disconnect(conn)


manager = ConnectionManager()