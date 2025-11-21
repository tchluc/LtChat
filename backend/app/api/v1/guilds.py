from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from app.db.session import get_session
from app.models.user import User
from app.models.guild import Guild, Channel
from app.core.dependencies import get_current_user
from typing import List


router = APIRouter(prefix="/guilds", tags=["guilds"])

@router.post("/", response_model=Guild)
async def create_guild(
    name: str = Query(..., description="Nom de la guilde"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    guild = Guild(name=name, owner_id=current_user.id)
    db.add(guild)
    await db.commit()
    await db.refresh(guild)

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
    statement = select(Guild).where(Guild.owner_id == current_user.id)
    result = await db.execute(statement)
    guilds = result.scalars().all()  # ← c’est ça qui posait problème avant
    return guilds