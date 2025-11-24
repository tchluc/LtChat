from fastapi import APIRouter, WebSocket, Depends, WebSocketDisconnect
from app.services.websocket_manager import manager
from app.core.dependencies import get_current_user, get_current_user_ws
from app.models.user import User
from app.models.message import Message
from app.db.session import get_session
from sqlmodel.ext.asyncio.session import AsyncSession
import json

router = APIRouter()


@router.websocket("/ws/{channel_id}")
async def websocket_endpoint(
    websocket: WebSocket, 
    channel_id: str, 
    current_user: User = Depends(get_current_user_ws),
    db: AsyncSession = Depends(get_session)
):
    """
    Handles WebSocket connections for a specific channel.
    """
    print(f"DEBUG: WS Connection request for channel {channel_id} from {current_user.username}")
    await manager.connect(websocket, channel_id, current_user.id)
    print(f"DEBUG: WS Connection accepted for channel {channel_id}")

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
            # print(f"DEBUG: Received WS data: {data}")
            payload = json.loads(data)

            if payload["type"] == "message":
                # Determine status
                connections = manager.active_connections[channel_id]
                other_users = [uid for _, uid in connections if uid != current_user.id]
                status = "delivered" if other_users else "sent"

                # Persist message
                new_message = Message(
                    content=payload["content"],
                    user_id=current_user.id,
                    channel_id=int(channel_id),
                    status=status
                )
                db.add(new_message)
                await db.commit()
                await db.refresh(new_message)

                message_data = {
                    "type": "message",
                    "id": new_message.id,
                    "content": new_message.content,
                    "user_id": current_user.id,
                    "username": current_user.username,
                    "channel_id": channel_id,
                    "created_at": new_message.created_at.isoformat(),
                    "status": status
                }
                await manager.broadcast(message_data, channel_id)

            elif payload["type"] == "read":
                # Update status in DB
                message_id = payload.get("message_id")
                if message_id:
                    # This should ideally verify the message belongs to this channel/user context
                    # For now, we just update it
                    # We need to find the message first
                    # stmt = select(Message).where(Message.id == message_id)
                    # result = await db.execute(stmt)
                    # msg = result.scalar_one_or_none()
                    # if msg:
                    #    msg.status = "read"
                    #    db.add(msg)
                    #    await db.commit()
                    
                    # Broadcast read receipt
                    await manager.broadcast({
                        "type": "status_update",
                        "message_id": message_id,
                        "status": "read",
                        "channel_id": channel_id
                    }, channel_id)

    except WebSocketDisconnect:
        manager.disconnect(websocket, channel_id)
        await manager.broadcast({
            "type": "presence",
            "user_id": current_user.id,
            "username": current_user.username,
            "status": "offline"
        }, channel_id)