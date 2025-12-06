from app.models.user import UserStats

class UserRepository:
    def __init__(self):
        # In-memory storage for local development
        self.users = {}

    def get_user_stats(self, username: str) -> UserStats:
        if username not in self.users:
            self.users[username] = UserStats(username=username)
        return self.users[username]

    def update_user_stats(self, stats: UserStats):
        self.users[stats.username] = stats
