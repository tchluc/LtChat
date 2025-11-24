from pydantic import BaseModel

class GuildJoin(BaseModel):
    invite_code: str

class ChannelCreate(BaseModel):
    name: str
    type: str = "text"  # text, voice, category
