import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # App Settings
    PROJECT_NAME: str = "AI ScienceVerse"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = os.getenv("JWT_SECRET", "super-secret-key-for-scienceverse-development-2026")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    ALGORITHM: str = "HS256"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./scienceverse.db")
    
    # AI Keys
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    class Config:
        case_sensitive = True

settings = Settings()
