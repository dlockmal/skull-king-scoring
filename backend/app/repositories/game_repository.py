from app.models.game import Game, GameStatus
import uuid
from datetime import datetime
from app.core.config import settings
from app.db.dynamodb import get_dynamodb_table
import json
from boto3.dynamodb.conditions import Key

class GameRepository:
    def __init__(self):
        self.use_dynamodb = settings.USE_DYNAMODB
        if not self.use_dynamodb:
            self.games = {} # In-memory storage
        else:
            self.table = get_dynamodb_table()

    def create_game(self, players: list[str]) -> Game:
        game_id = str(uuid.uuid4())
        game = Game(
            game_id=game_id,
            players=players,
            date=datetime.utcnow().isoformat(),
            status=GameStatus.ACTIVE,
            rounds=[]
        )
        
        if self.use_dynamodb:
            # Convert Pydantic model to dict, handling nested models
            item = json.loads(game.model_dump_json())
            self.table.put_item(Item=item)
        else:
            self.games[game_id] = game
            
        return game

    def get_game(self, game_id: str) -> Game:
        if self.use_dynamodb:
            response = self.table.get_item(Key={'game_id': game_id})
            item = response.get('Item')
            if item:
                return Game(**item)
            return None
        else:
            return self.games.get(game_id)

    def update_game(self, game: Game):
        if self.use_dynamodb:
            item = json.loads(game.model_dump_json())
            self.table.put_item(Item=item)
        else:
            self.games[game.game_id] = game
