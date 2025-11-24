from sqlmodel import SQLModel, Field, Relationship

class ChannelMember(SQLModel, table=True):
    channel_id: int = Field(foreign_key="channel.id", primary_key=True)
    user_id: int = Field(foreign_key="user.id", primary_key=True)
