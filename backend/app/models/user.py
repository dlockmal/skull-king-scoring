from pydantic import BaseModel

class UserStats(BaseModel):
    username: str
    total_wins: int = 0
    high_score: int = 0
    games_played: int = 0
