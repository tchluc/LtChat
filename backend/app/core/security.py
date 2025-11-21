from datetime import datetime, timedelta, UTC
from jose import jwt, JWTError
from passlib.context import CryptContext

SECRET_KEY = "ltchat-super-secret-change-in-prod-2025"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 jours

# Forçage du backend bcrypt + fix bug connu
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__ident = "2b",           # ← Force l'ident correct
    bcrypt__min_rounds = 12,
)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def get_password_hash(password: str) -> str:
    # bcrypt refuse >72 bytes → on tronque proprement (standard de l’industrie)
    return pwd_context.hash(password[:72])

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.now(UTC) + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)