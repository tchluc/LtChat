from sqlmodel import SQLModel, Field, Relationship

class GuildMember(SQLModel, table=True):
    guild_id: int = Field(foreign_key="guild.id", primary_key=True)
    user_id: int = Field(foreign_key="user.id", primary_key=True)
    role: str = Field(default="member")  # admin, moderator, member

    guild: "Guild" = Relationship(back_populates="members")
    user: "User" = Relationship()