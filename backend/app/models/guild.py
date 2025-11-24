from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from .user import User
from .channel import Channel
from .guild_member import GuildMember

from typing import Optional, List, TYPE_CHECKING
if TYPE_CHECKING:
    from .user import User

class Guild(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    owner_id: int = Field(foreign_key="user.id")
    icon: Optional[str] = None
    invite_code: str = Field(index=True, unique=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    owner: "User" = Relationship(back_populates="guilds")
    channels: List["Channel"] = Relationship(back_populates="guild")
    members: List["GuildMember"] = Relationship(back_populates="guild")