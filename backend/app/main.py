from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel
from app.db.session import engine
from app.core.config import settings
from app.api.v1 import router as v1_router
from app.api.v1.channels import router as channels_router

from app.services.kafka_producer import kafka_producer
from app.services.kafka_consumer import start_consumer


app = FastAPI(title="LtChat", version="0.1.0")

app.include_router(v1_router)
app.include_router(channels_router, prefix="/v1")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Création auto des tables au démarrage (dev only)
# @app.on_event("startup")
# async def on_startup():
#     async with engine.begin() as conn:
#         await conn.run_sync(SQLModel.metadata.create_all)


@app.on_event("startup")
async def startup_event():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

    await kafka_producer.start()
    start_consumer()  # Démarre le consumer en tâche de fond


@app.on_event("shutdown")
async def shutdown_event():
    await kafka_producer.stop()