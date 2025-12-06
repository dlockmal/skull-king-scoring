from fastapi import APIRouter, HTTPException
from app.services.user_service import UserService
from app.models.user import UserStats

router = APIRouter()
user_service = UserService()

@router.get("/{username}/stats", response_model=UserStats)
def get_user_stats(username: str):
    return user_service.get_user_stats(username)
