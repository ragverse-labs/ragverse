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


# from dotenv import load_dotenv

# load_dotenv()

# import logging
# from llama_index.core.indices import (
#     VectorStoreIndex,
# )
# from app.engine.constants import STORAGE_DIR
# from app.engine.loader import get_documents


# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger()


# def generate_datasource():
#     logger.info("Creating new index")
#     # load the documents and create the index
#     documents = get_documents()
#     index = VectorStoreIndex.from_documents(
#         documents,
#     )
#     # store it for later
#     index.storage_context.persist(STORAGE_DIR)
#     logger.info(f"Finished creating new index. Stored in {STORAGE_DIR}")


# if __name__ == "__main__":
#     # init_settings()
#     generate_datasource()
