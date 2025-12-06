from pydantic import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Skull King Companion"
    DYNAMODB_TABLE: str = "skull_king_data"
    AWS_REGION: str = "us-east-1"
    USE_DYNAMODB: bool = False
    
    class Config:
        env_file = ".env"

settings = Settings()
