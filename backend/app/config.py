from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    app_name: str = "CyberGuard AI API"
    api_v1_prefix: str = "/api/v1"
    secret_key: str = "dev-secret-change-in-production-cyberguard-ai"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 480
    database_url: str = "sqlite:///./cyberguard.db"
    cors_origins: str = (
        "http://localhost:3000,http://localhost:3001,"
        "http://127.0.0.1:3000,http://127.0.0.1:3001"
    )

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
