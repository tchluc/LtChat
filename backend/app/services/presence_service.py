import time
from typing import List, Set
import redis.asyncio as redis
from app.core.config import settings


class PresenceService:
    """
    Manages user online presence using Redis.
    
    Uses Redis sorted sets where:
    - Key: "presence:online"
    - Score: timestamp of last activity
    - Member: user_id
    
    Users are considered online if their last activity was within PRESENCE_TTL seconds.
    """
    
    PRESENCE_TTL = 30  # seconds - users expire after 30s without heartbeat
    PRESENCE_KEY = "presence:online"
    
    def __init__(self):
        self.redis = redis.from_url(settings.REDIS_URL)
    
    async def set_online(self, user_id: int) -> None:
        """
        Mark a user as online with current timestamp.
        
        Args:
            user_id: The ID of the user to mark as online
        """
        current_time = time.time()
        await self.redis.zadd(self.PRESENCE_KEY, {str(user_id): current_time})
    
    async def set_offline(self, user_id: int) -> None:
        """
        Remove a user from the online set.
        
        Args:
            user_id: The ID of the user to mark as offline
        """
        await self.redis.zrem(self.PRESENCE_KEY, str(user_id))
    
    async def heartbeat(self, user_id: int) -> None:
        """
        Update user's last activity timestamp (heartbeat).
        
        Args:
            user_id: The ID of the user sending heartbeat
        """
        await self.set_online(user_id)
    
    async def get_online_users(self) -> Set[int]:
        """
        Get all currently online users.
        
        Automatically removes expired users (older than PRESENCE_TTL).
        
        Returns:
            Set of user IDs that are currently online
        """
        current_time = time.time()
        cutoff_time = current_time - self.PRESENCE_TTL
        
        # Remove expired users
        await self.redis.zremrangebyscore(self.PRESENCE_KEY, 0, cutoff_time)
        
        # Get remaining online users
        online_user_ids = await self.redis.zrange(self.PRESENCE_KEY, 0, -1)
        return {int(uid) for uid in online_user_ids}
    
    async def is_online(self, user_id: int) -> bool:
        """
        Check if a specific user is online.
        
        Args:
            user_id: The ID of the user to check
            
        Returns:
            True if user is online, False otherwise
        """
        score = await self.redis.zscore(self.PRESENCE_KEY, str(user_id))
        if score is None:
            return False
        
        current_time = time.time()
        cutoff_time = current_time - self.PRESENCE_TTL
        
        # Check if user's last activity is within TTL
        return score >= cutoff_time
    
    async def get_user_count(self) -> int:
        """
        Get the count of online users.
        
        Returns:
            Number of users currently online
        """
        online_users = await self.get_online_users()
        return len(online_users)
    
    async def cleanup_expired(self) -> int:
        """
        Manually cleanup expired users.
        
        Returns:
            Number of users removed
        """
        current_time = time.time()
        cutoff_time = current_time - self.PRESENCE_TTL
        removed = await self.redis.zremrangebyscore(self.PRESENCE_KEY, 0, cutoff_time)
        return removed


# Global instance
presence_service = PresenceService()
