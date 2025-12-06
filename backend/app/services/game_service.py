from app.repositories.game_repository import GameRepository
from app.models.game import Game, Round, RoundResult, GameStatus
from app.services.scoring import calculate_round_score
from app.services.user_service import UserService

class GameService:
    def __init__(self):
        self.repo = GameRepository()
        self.user_service = UserService()

    def create_game(self, players: list[str]) -> Game:
        return self.repo.create_game(players)

    def get_game(self, game_id: str) -> Game:
        return self.repo.get_game(game_id)

    def start_round(self, game_id: str, round_num: int) -> Game:
        game = self.repo.get_game(game_id)
        if not game:
            raise ValueError("Game not found")
            
        # Check if round already exists
        for r in game.rounds:
            if r.round_num == round_num:
                return game # Already started
                
        new_round = Round(round_num=round_num, cards_dealt=round_num)
        game.rounds.append(new_round)
        self.repo.update_game(game)
        return game

    def submit_bids(self, game_id: str, round_num: int, bids: dict[str, int]) -> Game:
        game = self.repo.get_game(game_id)
        if not game:
            raise ValueError("Game not found")
            
        round_idx = -1
        for i, r in enumerate(game.rounds):
            if r.round_num == round_num:
                round_idx = i
                break
        
        if round_idx == -1:
            raise ValueError("Round not found")
            
        game.rounds[round_idx].bids = bids
        self.repo.update_game(game)
        return game

    def submit_results(self, game_id: str, round_num: int, results: dict) -> Game:
        # results: {player_name: {tricks_won: int, bonus: int, penalty: int}}
        game = self.repo.get_game(game_id)
        if not game:
            raise ValueError("Game not found")

        round_idx = -1
        for i, r in enumerate(game.rounds):
            if r.round_num == round_num:
                round_idx = i
                break
        
        if round_idx == -1:
            raise ValueError("Round not found")
            
        current_round = game.rounds[round_idx]
        
        # Calculate scores
        round_results = {}
        for player_name, data in results.items():
            bid = current_round.bids.get(player_name, 0)
            tricks = data.get('tricks_won', 0)
            bonus = data.get('bonus', 0)
            penalty = data.get('penalty', 0)
            
            score = calculate_round_score(bid, tricks, round_num, bonus, penalty)
            
            round_results[player_name] = RoundResult(
                tricks_won=tricks,
                bid=bid,
                bonus_points=bonus,
                penalty_points=penalty,
                round_score=score,
                potential_bonus=bonus, # Simplified for now
                pirate_bonus=0, # Placeholder until frontend sends details
                skull_king_bonus=0,
                mermaid_bonus=0,
                loot_bonus=0
            )
            
        current_round.results = round_results
        
        # Check if game is over (Round 10)
        if round_num == 10:
            game.status = GameStatus.COMPLETED
            self._handle_game_completion(game)
            
        self.repo.update_game(game)
        return game

    def _handle_game_completion(self, game: Game):
        # Calculate total scores
        player_scores = {p: 0 for p in game.players}
        for r in game.rounds:
            for p, res in r.results.items():
                player_scores[p] += res.round_score
        
        # Determine winner (highest score)
        # Handle ties? For now, multiple winners possible
        max_score = -float('inf')
        for s in player_scores.values():
            if s > max_score:
                max_score = s
                
        for player, score in player_scores.items():
            won = (score == max_score)
            self.user_service.update_stats_after_game(player, score, won)
