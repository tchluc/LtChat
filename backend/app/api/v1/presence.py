from fastapi import APIRouter, Depends
from app.services.presence_service import presence_service
from app.core.dependencies import get_current_user
from app.models.user import User
from typing import List

router = APIRouter()


@router.get("/online", response_model=List[int])
async def get_online_users(current_user: User = Depends(get_current_user)):
    """
    Get list of all currently online user IDs.
    
    Returns:
        List of user IDs that are currently online
    """
    online_users = await presence_service.get_online_users()
    return list(online_users)


@router.get("/user/{user_id}", response_model=dict)
async def check_user_online(
    user_id: int,
    current_user: User = Depends(get_current_user)
):
    """
    Check if a specific user is currently online.
    
    Args:
        user_id: The ID of the user to check
        
    Returns:
        Dictionary with user_id and online status
    """
    is_online = await presence_service.is_online(user_id)
    return {
        "user_id": user_id,
        "online": is_online
    }


@router.post("/heartbeat")
async def send_heartbeat(current_user: User = Depends(get_current_user)):
    """
    Send a heartbeat to keep the user marked as online.
    
    This endpoint can be called periodically by clients to maintain
    online status even without an active WebSocket connection.
    
    Returns:
        Success message
    """
    await presence_service.heartbeat(current_user.id)
    return {"status": "ok", "message": "Heartbeat received"}


@router.get("/count", response_model=dict)
async def get_online_count(current_user: User = Depends(get_current_user)):
    """
    Get the total count of online users.
    
    Returns:
        Dictionary with the count of online users
    """
    count = await presence_service.get_user_count()
    return {"online_count": count}
