from aiokafka import AIOKafkaProducer
from app.core.config import settings
import json

class KafkaProducer:
    """
    Handles sending messages to Kafka.
    """
    def __init__(self):
        self.producer = AIOKafkaProducer(
            bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS
        )

    async def start(self):
        """
        Starts the Kafka producer.
        """
        # Retry logic
        for _ in range(10):
            try:
                await self.producer.start()
                break
            except Exception:
                import asyncio
                await asyncio.sleep(2)
        else:
            print("Failed to connect Producer to Kafka")

    async def stop(self):
        """
        Stops the Kafka producer.
        """
        await self.producer.stop()

    async def send_message(self, channel_id: str, message: dict):
        """
        Sends a message to the Kafka 'messages' topic.

        Args:
            channel_id (str): The channel ID to partition by.
            message (dict): The message payload.
        """
        await self.producer.send_and_wait(
            topic="messages",
            value=json.dumps(message).encode("utf-8"),
            key=str(message["user_id"]).encode("utf-8"),
            partition=int(channel_id) % 10  # simple partitionning
        )

kafka_producer = KafkaProducer()