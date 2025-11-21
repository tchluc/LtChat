from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship


class Channel(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    guild_id: int = Field(foreign_key="guild.id")
    type: str = Field(default="text")  # text, voice, category
    position: int = Field(default=0)

    guild: "Guild" = Relationship(back_populates="channels")
    messages: List["Message"] = Relationship(back_populates="channel")