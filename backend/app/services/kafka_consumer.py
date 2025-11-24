from aiokafka import AIOKafkaConsumer
from app.core.config import settings
from app.db.session import async_session
from app.models.message import Message
import json
import asyncio

async def consume_messages():
    """
    Consumes messages from the Kafka topic 'messages' and persists them to the database.

    This function runs indefinitely, listening for new messages, saving them to the DB,
    and then broadcasting them via WebSocket.
    """
    consumer = AIOKafkaConsumer(
        "messages",
        bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,
        group_id="ltchat-group",
        auto_offset_reset="earliest"
    )
    
    # Retry logic
    for _ in range(10):
        try:
            await consumer.start()
            break
        except Exception:
            await asyncio.sleep(2)
    else:
        print("Failed to connect to Kafka after retries")
        return
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
    """
    Starts the Kafka consumer as a background task.
    """
    asyncio.create_task(consume_messages())