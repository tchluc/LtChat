from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.guilds import router as guilds_router
from app.api.v1.ws import router as ws_router

router = APIRouter(prefix="/v1")
router.include_router(auth_router)
router.include_router(guilds_router)
router.include_router(ws_router)
