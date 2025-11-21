from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/ltchat"
    REDIS_URL: str = "redis://localhost:6379/0"

    KAFKA_BOOTSTRAP_SERVERS: str = "kafka:9092"
    MINIO_ENDPOINT: str = "minio:9000"
    MEILISEARCH_HOST: str = "http://meilisearch:7700"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()