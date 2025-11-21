from typing import Optional
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime

from .user import User
from .channel import  Channel


class Message(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    content: str
    user_id: int = Field(foreign_key="user.id")
    channel_id: int = Field(foreign_key="channel.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    edited_at: Optional[datetime] = None

    user: "User" = Relationship()
    channel: "Channel" = Relationship(back_populates="messages")