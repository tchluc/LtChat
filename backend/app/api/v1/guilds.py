from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from app.db.session import get_session
from app.models.user import User
from app.models.guild import Guild, Channel
from app.core.dependencies import get_current_user
from typing import List
import uuid
from app.models.guild_member import GuildMember
from app.schemas.guild import GuildJoin, ChannelCreate




router = APIRouter(prefix="/guilds", tags=["guilds"])

@router.post("/", response_model=Guild)
async def create_guild(
    name: str = Query(..., description="Nom de la guilde"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """
    Creates a new guild.

    Args:
        name (str): The name of the guild.
        current_user (User): The authenticated user.
        db (AsyncSession): The database session.

    Returns:
        Guild: The created guild.
    """
    invite_code = str(uuid.uuid4())[:8]
    guild = Guild(name=name, owner_id=current_user.id, invite_code=invite_code)
    db.add(guild)
    await db.commit()
    await db.refresh(guild)

    # Add owner as member
    member = GuildMember(guild_id=guild.id, user_id=current_user.id, role="admin")
    db.add(member)


    # Channel par défaut
    default_channel = Channel(name="général", guild_id=guild.id, position=0)
    db.add(default_channel)
    await db.commit()
    return guild


@router.get("/", response_model=List[Guild])
async def list_my_guilds(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """
    Lists all guilds owned by the current user.

    Args:
        current_user (User): The authenticated user.
        db (AsyncSession): The database session.

    Returns:
        List[Guild]: A list of guilds owned by the user.
    """
    statement = select(Guild).join(GuildMember).where(GuildMember.user_id == current_user.id)
    result = await db.execute(statement)
    guilds = result.scalars().all()
    return guilds


@router.post("/join", response_model=Guild)
async def join_guild(
    join_data: GuildJoin,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """
    Joins a guild using an invite code.
    """
    statement = select(Guild).where(Guild.invite_code == join_data.invite_code)

    result = await db.execute(statement)
    guild = result.scalar_one_or_none()

    if not guild:
        raise HTTPException(status_code=404, detail="Guild not found")

    # Check if already member
    member_stmt = select(GuildMember).where(
        GuildMember.guild_id == guild.id,
        GuildMember.user_id == current_user.id
    )
    member_result = await db.execute(member_stmt)
    if member_result.scalar_one_or_none():
        return guild # Already member

    member = GuildMember(guild_id=guild.id, user_id=current_user.id, role="member")
    db.add(member)
    await db.commit()
    
    return guild


@router.post("/{guild_id}/channels", response_model=Channel)
async def create_channel(
    guild_id: int,
    channel_data: ChannelCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """
    Creates a new channel in a guild.
    """
    # Check if user is member of the guild
    member_stmt = select(GuildMember).where(
        GuildMember.guild_id == guild_id,
        GuildMember.user_id == current_user.id
    )
    member_result = await db.execute(member_stmt)
    member = member_result.scalar_one_or_none()
    
    if not member:
        raise HTTPException(status_code=403, detail="You are not a member of this guild")
    
    # Only admins and owners can create channels
    if member.role not in ["admin", "owner"]:
        raise HTTPException(status_code=403, detail="Only admins can create channels")
    
    # Get the current max position
    max_pos_stmt = select(Channel).where(Channel.guild_id == guild_id).order_by(Channel.position.desc())
    max_pos_result = await db.execute(max_pos_stmt)
    max_channel = max_pos_result.first()
    next_position = (max_channel[0].position + 1) if max_channel else 0
    
    # Create the channel
    channel = Channel(
        name=channel_data.name,
        guild_id=guild_id,
        type=channel_data.type,
        position=next_position
    )
    db.add(channel)
    await db.commit()
    await db.refresh(channel)
    
    return channel


@router.get("/{guild_id}/channels", response_model=List[Channel])
async def list_guild_channels(
    guild_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """
    Lists all channels in a guild.
    """
    # Check if user is member of the guild
    member_stmt = select(GuildMember).where(
        GuildMember.guild_id == guild_id,
        GuildMember.user_id == current_user.id
    )
    member_result = await db.execute(member_stmt)
    if not member_result.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="You are not a member of this guild")

    # Get all channels
    stmt = select(Channel).where(Channel.guild_id == guild_id).order_by(Channel.position)
    result = await db.execute(stmt)
    channels = result.scalars().all()
    
    return channels


@router.get("/{guild_id}/members", response_model=List[User])
async def list_guild_members(
    guild_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """
    Lists all members of a guild.
    """
    # Check if user is member of the guild
    member_stmt = select(GuildMember).where(
        GuildMember.guild_id == guild_id,
        GuildMember.user_id == current_user.id
    )
    member_result = await db.execute(member_stmt)
    if not member_result.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="You are not a member of this guild")

    # Get all members
    stmt = select(User).join(GuildMember).where(GuildMember.guild_id == guild_id)
    result = await db.execute(stmt)
    members = result.scalars().all()
    
    return members