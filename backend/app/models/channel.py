from typing import Optional, List, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship
from .channel_member import ChannelMember

if TYPE_CHECKING:
    from .user import User
    from .guild import Guild
    from .message import Message



class Channel(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: Optional[str] = None # Optional for DMs
    guild_id: Optional[int] = Field(default=None, foreign_key="guild.id")
    type: str = Field(default="text")  # text, voice, category, dm
    position: int = Field(default=0)

    guild: Optional["Guild"] = Relationship(back_populates="channels")
    messages: List["Message"] = Relationship(back_populates="channel")
    members: List["User"] = Relationship(back_populates="dm_channels", link_model=ChannelMember)