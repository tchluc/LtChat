from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlmodel.ext.asyncio.session import AsyncSession
from app.db.session import get_session
from app.models.user import User
from app.core.security import SECRET_KEY, ALGORITHM
from sqlmodel import select

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="v1/auth/login")


async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_session)):
    """
    Retrieves the current authenticated user based on the provided JWT token.

    Args:
        token (str): The OAuth2 access token.
        db (AsyncSession): The database session.

    Returns:
        User: The authenticated user object.

    Raises:
        HTTPException: If the token is invalid or the user is not found.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401)
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    result = await db.exec(select(User).where(User.id == int(user_id)))
    user = result.first()
    if not user:
        raise HTTPException(status_code=401)
    return user

async def get_current_user_ws(token: str, db: AsyncSession = Depends(get_session)):
    """
    Retrieves the current authenticated user for WebSockets (token in query param).
    """
    try:
        print(f"DEBUG: Validating WS token: {token[:10]}...")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if not user_id:
            print("DEBUG: No user_id in token")
            raise HTTPException(status_code=401)
    except JWTError as e:
        print(f"DEBUG: JWT Error: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")

    result = await db.exec(select(User).where(User.id == int(user_id)))
    user = result.first()
    if not user:
        print(f"DEBUG: User {user_id} not found")
        raise HTTPException(status_code=401)
    
    print(f"DEBUG: WS User authenticated: {user.username}")
    return user