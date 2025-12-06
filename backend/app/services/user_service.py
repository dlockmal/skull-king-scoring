from app.repositories.user_repository import UserRepository
from app.models.user import UserStats

class UserService:
    def __init__(self):
        self.repo = UserRepository()

    def get_user_stats(self, username: str) -> UserStats:
        return self.repo.get_user_stats(username)

    def update_stats_after_game(self, username: str, score: int, won: bool):
        stats = self.repo.get_user_stats(username)
        stats.games_played += 1
        if won:
            stats.total_wins += 1
        if score > stats.high_score:
            stats.high_score = score
        self.repo.update_user_stats(stats)
