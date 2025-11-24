from fastapi import APIRouter, WebSocket, Depends, WebSocketDisconnect
from app.services.websocket_manager import manager
from app.core.dependencies import get_current_user, get_current_user_ws
from app.models.user import User
import json

router = APIRouter()


@router.websocket("/ws/{channel_id}")
async def websocket_endpoint(websocket: WebSocket, channel_id: str, current_user: User = Depends(get_current_user_ws)):
    """
    Handles WebSocket connections for a specific channel.

    Args:
        websocket (WebSocket): The WebSocket connection.
        channel_id (str): The channel ID.
        current_user (User): The authenticated user.
    """
    await manager.connect(websocket, channel_id)

    # Annonce présence
    await manager.broadcast({
        "type": "presence",
        "user_id": current_user.id,
        "username": current_user.username,
        "status": "online"
    }, channel_id)

    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)

            if payload["type"] == "message":
                message_data = {
                    "type": "message",
                    "id": "temp-123",  # sera remplacé par Kafka plus tard
                    "content": payload["content"],
                    "user_id": current_user.id,
                    "username": current_user.username,
                    "channel_id": channel_id,
                    "created_at": "now"
                }
                await manager.broadcast(message_data, channel_id)


            elif payload["type"] == "message":

                message_data = {

                    "type": "message",

                    "content": payload["content"],

                    "user_id": current_user.id,

                    "username": current_user.username,

                    "channel_id": channel_id,

                }

                # Envoi vers Kafka (persistance + scaling)

                from app.services.kafka_producer import kafka_producer

                await kafka_producer.send_message(channel_id, message_data)

                # Broadcast immédiat (optimistic UI)

                optimistic_msg = message_data | {"id": "temp-" + str(hash(payload["content"])), "created_at": "now"}

                await manager.broadcast(optimistic_msg, channel_id)

    except WebSocketDisconnect:
        manager.disconnect(websocket, channel_id)
        await manager.broadcast({
            "type": "presence",
            "user_id": current_user.id,
            "username": current_user.username,
            "status": "offline"
        }, channel_id)