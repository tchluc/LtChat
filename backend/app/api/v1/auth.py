from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel.ext.asyncio.session import AsyncSession
from app.db.session import get_session
from app.models.user import User
from app.core.security import verify_password, get_password_hash, create_access_token
from app.schemas.auth import Token, UserCreate
from sqlmodel import select

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=Token)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_session)):
    """
    Registers a new user.

    Args:
        user_in (UserCreate): The user creation data.
        db (AsyncSession): The database session.

    Returns:
        Token: The access token for the newly registered user.

    Raises:
        HTTPException: If the username already exists.
    """
    # Fix 1 : utilisation correcte de select()
    result = await db.exec(select(User).where(User.username == user_in.username))
    if result.first():
        raise HTTPException(400, "Username already exists")

    hashed = get_password_hash(user_in.password)
    user = User(username=user_in.username, email=user_in.email, hashed_password=hashed)
    db.add(user)
    await db.commit()
    await db.refresh(user)  # ← important
    token = create_access_token({"sub": str(user.id)})
    return Token(access_token=token)


@router.post("/login", response_model=Token)
async def login(form: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_session)):
    """
    Authenticates a user and returns an access token.

    Args:
        form (OAuth2PasswordRequestForm): The login form data (username and password).
        db (AsyncSession): The database session.

    Returns:
        Token: The access token.

    Raises:
        HTTPException: If the credentials are invalid.
    """
    # Fix 2 : même chose ici
    result = await db.exec(select(User).where(User.username == form.username))
    user = result.first()  # ← .first() au lieu de scalar_one_or_none()

    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": str(user.id)})
    return Token(access_token=token)