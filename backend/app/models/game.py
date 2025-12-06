from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from enum import Enum
from datetime import datetime
import uuid

class GameStatus(str, Enum):
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"

class Player(BaseModel):
    name: str
    score: int = 0

class RoundResult(BaseModel):
    tricks_won: int
    bid: int
    bonus_points: int = 0
    penalty_points: int = 0
    round_score: int = 0
    # Detailed breakdown for display/debugging
    potential_bonus: int = 0 # e.g. 10 or 20 per trick
    pirate_bonus: int = 0
    skull_king_bonus: int = 0
    mermaid_bonus: int = 0
    loot_bonus: int = 0

class Round(BaseModel):
    round_num: int
    cards_dealt: int
    bids: Dict[str, int] = {}  # player_name -> bid
    results: Dict[str, RoundResult] = {} # player_name -> result

class GameBase(BaseModel):
    players: List[str]

class GameCreate(GameBase):
    pass

class Game(GameBase):
    game_id: str
    date: str
    status: GameStatus
    rounds: List[Round] = []
    
    class Config:
        orm_mode = True
