import os
from pathlib import Path
from typing import List
from dotenv import load_dotenv

# Base backend directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env file
env_path = BASE_DIR / ".env"
load_dotenv(dotenv_path=env_path)


class Settings:
    """Application configuration loaded from environment variables."""

    # API Keys & Secrets
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "").strip() or os.getenv("VITE_GEMINI_API_KEY", "").strip()

    # Server settings
    PORT: int = int(os.getenv("PORT", "8000"))
    HOST: str = os.getenv("HOST", "0.0.0.0")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # CORS Origins
    _cors_raw: str = os.getenv(
        "CORS_ORIGINS", "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173"
    )
    CORS_ORIGINS: List[str] = [origin.strip() for origin in _cors_raw.split(",") if origin.strip()]

    # Uploads & File limits
    MAX_FILE_SIZE_BYTES: int = 10 * 1024 * 1024  # 10 MB limit
    ALLOWED_MIME_TYPES: List[str] = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/jpg",
    ]
    UPLOAD_DIR: Path = BASE_DIR / "uploads"


settings = Settings()
