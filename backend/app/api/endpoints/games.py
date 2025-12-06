from fastapi import APIRouter, HTTPException, Depends
from app.services.game_service import GameService
from app.models.game import Game, GameCreate
from typing import List, Dict

router = APIRouter()
game_service = GameService()

@router.post("/", response_model=Game)
def create_game(game_create: GameCreate):
    return game_service.create_game(game_create.players)

@router.get("/{game_id}", response_model=Game)
def get_game(game_id: str):
    game = game_service.get_game(game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    return game

@router.post("/{game_id}/rounds/{round_num}/start", response_model=Game)
def start_round(game_id: str, round_num: int):
    try:
        return game_service.start_round(game_id, round_num)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{game_id}/rounds/{round_num}/bids", response_model=Game)
def submit_bids(game_id: str, round_num: int, bids: Dict[str, int]):
    try:
        return game_service.submit_bids(game_id, round_num, bids)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{game_id}/rounds/{round_num}/results", response_model=Game)
def submit_results(game_id: str, round_num: int, results: Dict[str, Dict[str, int]]):
    try:
        return game_service.submit_results(game_id, round_num, results)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
