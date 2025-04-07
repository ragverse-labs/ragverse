import logging
import os

# import chromadb
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader
from app.engine.constants import  CHROMA_STORAGE_DIR, STORAGE_DIR
from llama_index.core.storage import StorageContext
from llama_index.core.indices import load_index_from_storage

# from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.core import StorageContext
# from llama_index.embeddings.huggingface import HuggingFaceEmbedding

# from query_manager import QueryEngineManager

logger = logging.getLogger("uvicorn")

# def get_index():
#     manager = QueryEngineManager()
#     agent = manager.get_agent_query_engine()
#     return agent

def get_index():
    
    # check if storage already exists
    if not os.path.exists(STORAGE_DIR):
        raise Exception(
            "StorageContext is empty - call 'python app/engine/generate.py' to generate the storage first"
        )

    # load the existing index
    logger.info(f"Loading index from {STORAGE_DIR}...")
    storage_context = StorageContext.from_defaults(persist_dir=STORAGE_DIR)
    index = load_index_from_storage(storage_context)
    logger.info(f"Finished loading index from {STORAGE_DIR}")
    return index

# def get_index():
#     if not os.path.exists(CHROMA_STORAGE_DIR):
#         raise Exception(
#             "StorageContext is empty - call 'python app/engine/load_pdfs.py' to generate the storage first"
#         )

#     logger.info(f"Loading index from {CHROMA_STORAGE_DIR}...")
#     #change to higher dimentionality to 768
#     embed_model = HuggingFaceEmbedding(model_name="BAAI/bge-small-en-v1.5") 

#     db = chromadb.PersistentClient(path=CHROMA_STORAGE_DIR)
#     chroma_col = db.get_collection(CHROMA_COLLECTION)
#     vector_store = ChromaVectorStore(chroma_collection=chroma_col)
#     index = VectorStoreIndex.from_vector_store(
#                 vector_store,
#                 embed_model=embed_model,
#     )
#     logger.info(f"Finished loading index from {CHROMA_STORAGE_DIR}")
#     return index