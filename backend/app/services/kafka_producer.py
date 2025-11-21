from aiokafka import AIOKafkaProducer
from app.core.config import settings
import json

class KafkaProducer:
    def __init__(self):
        self.producer = AIOKafkaProducer(
            bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS
        )

    async def start(self):
        await self.producer.start()

    async def stop(self):
        await self.producer.stop()

    async def send_message(self, channel_id: str, message: dict):
        await self.producer.send_and_wait(
            topic="messages",
            value=json.dumps(message).encode("utf-8"),
            key=str(message["user_id"]).encode("utf-8"),
            partition=int(channel_id) % 10  # simple partitionning
        )

kafka_producer = KafkaProducer()