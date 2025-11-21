from aiokafka import AIOKafkaConsumer
from app.core.config import settings
from app.db.session import async_session
from app.models.message import Message
import json
import asyncio

async def consume_messages():
    consumer = AIOKafkaConsumer(
        "messages",
        bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,
        group_id="ltchat-group",
        auto_offset_reset="earliest"
    )
    await consumer.start()
    try:
        async for msg in consumer:
            data = json.loads(msg.value.decode("utf-8"))
            async with async_session() as db:
                db_msg = Message(
                    content=data["content"],
                    user_id=data["user_id"],
                    channel_id=int(data["channel_id"])
                )
                db.add(db_msg)
                await db.commit()
                await db.refresh(db_msg)
                data["id"] = db_msg.id  # vrai ID persistant
                # Rebroadcast avec vrai ID
                from app.services.websocket_manager import manager
                await manager.broadcast(data, data["channel_id"])
    finally:
        await consumer.stop()

# Lancer au démarrage
def start_consumer():
    asyncio.create_task(consume_messages())