import asyncio
import logging

from fastapi import FastAPI

from app.db.init_db import init_db
from app.db.session import MongoDatabase

from tenacity import after_log, before_log, retry, stop_after_attempt, wait_fixed

from app.core.config import Settings
from app.engine.model_data import ModelData

# from app.core.config import Settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

max_tries = 60 * 5  # 5 minutes
wait_seconds = 1


@retry(
    stop=stop_after_attempt(max_tries),
    wait=wait_fixed(wait_seconds),
    before=before_log(logger, logging.INFO),
    after=after_log(logger, logging.WARN),
)
async def populate_db() -> None:
    settings =  Settings()
    await init_db(MongoDatabase())

    # Place any code after this line to add any db population steps

# async def initialize() -> None:
#     settings = Settings()
#     await init_db(MongoDatabase())
#     # Add other initialization tasks here

# app = FastAPI()

# @app.on_event("startup")
# async def startup_event():
#     await initialize()


async def main() -> None:
    logger.info("Creating initial data")
    await populate_db()
    model_data = ModelData()
    await model_data.initialize()
    logger.info("Initial data created")


if __name__ == "__main__":
    asyncio.run(main())
