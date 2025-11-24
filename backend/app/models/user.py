from typing import Optional, List, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from .base import Base
from .channel_member import ChannelMember


if TYPE_CHECKING:
    from .guild import Guild
    from .channel import Channel

class User(Base, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    email: str = Field(index=True, unique=True)
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    guilds: List["Guild"] = Relationship(back_populates="owner")
    dm_channels: List["Channel"] = Relationship(back_populates="members", link_model=ChannelMember)