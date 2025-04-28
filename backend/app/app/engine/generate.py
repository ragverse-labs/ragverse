import logging
from app.engine.index_creator import (
    create_index_for_data_source,

)
from app.engine import configuration

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
SOURCE_DIR = "./data-source/"

def generate_datasource():
    logger.info("Initializing settings...")
    configuration.init_settings()

    logger.info("Creating index for all folders...")
    create_index_for_data_source(SOURCE_DIR)

    logger.info("Datasource generation and querying completed.")

if __name__ == "__main__":
    generate_datasource()



