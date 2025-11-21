from collections import defaultdict
from fastapi import WebSocket
import redis.asyncio as redis
from app.core.config import settings


class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, list[WebSocket]] = defaultdict(list)
        self.redis = redis.from_url(settings.REDIS_URL)

    async def connect(self, websocket: WebSocket, channel_id: str):
        await websocket.accept()
        self.active_connections[channel_id].append(websocket)

    def disconnect(self, websocket: WebSocket, channel_id: str):
        self.active_connections[channel_id].remove(websocket)

    async def broadcast(self, message: dict, channel_id: str):
        # Pub/Sub Redis pour scaler sur plusieurs instances
        await self.redis.publish(channel_id, str(message))

        # Broadcast direct aux connexions locales
        dead = []
        for conn in self.active_connections[channel_id]:
            try:
                await conn.send_json(message)
            except:
                dead.append(conn)
        for conn in dead:
            self.active_connections[channel_id].remove(conn)


manager = ConnectionManager()