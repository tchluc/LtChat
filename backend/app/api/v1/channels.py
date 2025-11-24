from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select, or_
from app.db.session import get_session
from app.models.user import User
from app.models.channel import Channel
from app.models.channel_member import ChannelMember
from app.core.dependencies import get_current_user
from typing import List

router = APIRouter(prefix="/channels", tags=["channels"])

@router.post("/dm", response_model=Channel)
async def create_dm_channel(
    target_user_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """
    Creates or retrieves a DM channel with another user.
    """
    if target_user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot DM yourself")

    # Check if DM already exists
    # This is a bit complex in SQLModel/SQLAlchemy without explicit join tables for many-to-many queries
    # We want a channel of type 'dm' where both users are members
    
    # Simplified approach: Find all DM channels for current user, then check if target is in them
    stmt = select(Channel).join(ChannelMember).where(
        ChannelMember.user_id == current_user.id,
        Channel.type == "dm"
    )
    result = await db.execute(stmt)
    my_dms = result.scalars().all()

    for channel in my_dms:
        # Check if target is in this channel
        member_stmt = select(ChannelMember).where(
            ChannelMember.channel_id == channel.id,
            ChannelMember.user_id == target_user_id
        )
        if (await db.execute(member_stmt)).scalar_one_or_none():
            return channel

    # Create new DM channel
    channel = Channel(type="dm")
    db.add(channel)
    await db.commit()
    await db.refresh(channel)

    # Add members
    member1 = ChannelMember(channel_id=channel.id, user_id=current_user.id)
    member2 = ChannelMember(channel_id=channel.id, user_id=target_user_id)
    db.add(member1)
    db.add(member2)
    await db.commit()
    
    return channel

@router.get("/dm", response_model=List[Channel])
async def list_dm_channels(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """
    Lists all DM channels for the current user.
    """
    stmt = select(Channel).join(ChannelMember).where(
        ChannelMember.user_id == current_user.id,
        Channel.type == "dm"
    )
    result = await db.execute(stmt)
    return result.scalars().all()
