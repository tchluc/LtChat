from collections import defaultdict
from fastapi import WebSocket
import redis.asyncio as redis
from app.core.config import settings


class ConnectionManager:
    """
    Manages WebSocket connections and broadcasts messages.
    """
    def __init__(self):
        self.active_connections: dict[str, list[tuple[WebSocket, int]]] = defaultdict(list)
        self.redis = redis.from_url(settings.REDIS_URL)

    async def connect(self, websocket: WebSocket, channel_id: str, user_id: int):
        """
        Accepts a new WebSocket connection and adds it to the active connections list.

        Args:
            websocket (WebSocket): The WebSocket connection.
            channel_id (str): The channel ID.
            user_id (int): The ID of the connecting user.
        """
        await websocket.accept()
        self.active_connections[channel_id].append((websocket, user_id))

    def disconnect(self, websocket: WebSocket, channel_id: str):
        """
        Removes a WebSocket connection from the active connections list.

        Args:
            websocket (WebSocket): The WebSocket connection.
            channel_id (str): The channel ID.
        """
        self.active_connections[channel_id] = [
            (ws, uid) for ws, uid in self.active_connections[channel_id] if ws != websocket
        ]


    async def broadcast(self, message: dict, channel_id: str):
        """
        Broadcasts a message to all connected clients in a channel.

        Also publishes the message to Redis for scaling across multiple instances.

        Args:
            message (dict): The message payload.
            channel_id (str): The channel ID.
        """
        # Pub/Sub Redis pour scaler sur plusieurs instances
        await self.redis.publish(channel_id, str(message))

        # Broadcast direct aux connexions locales
        dead = []
        connections = self.active_connections[channel_id]
        print(f"DEBUG: Broadcasting to {len(connections)} connections in channel {channel_id}")
        for conn, _ in connections:
            try:
                await conn.send_json(message)
            except:
                dead.append(conn)
        
        # Cleanup dead connections
        if dead:
            self.active_connections[channel_id] = [
                (ws, uid) for ws, uid in self.active_connections[channel_id] if ws not in dead
            ]


manager = ConnectionManager()