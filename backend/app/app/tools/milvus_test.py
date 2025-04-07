# from llama_index import SimpleDirectoryReader, StorageContext, VectorStoreIndex, MilvusVectorStore
import numpy as np
from typing import Sequence

from llama_index.core import (
    SimpleDirectoryReader,
    VectorStoreIndex,
    StorageContext,
)
import numpy as np
# from app import settings
from llama_index.vector_stores.milvus import MilvusVectorStore


from  app.engine.constants import  SOURCE_DIR, VECTOR_STORAGE_DIR


URL="http://localhost:19530"
def create_milrun_index(name: str):
    # settings.init_settings()

    # Load documents from the specified directory
    specific_docs = SimpleDirectoryReader(
        input_dir=SOURCE_DIR + name
    ).load_data()

    # Ensure vectors are stored as 32-bit floats
    def ensure_32bit_floats(docs):
        for doc in docs:
            print(doc.metadata)
            if 'embedding' in doc.metadata:
                embedding = np.array(doc.metadata['embedding'], dtype=np.float32)
                print(f"Embedding dtype: {embedding.dtype}, shape: {embedding.shape}")
                doc.metadata['embedding'] = embedding.tolist()
        return docs
    
       # Ensure vectors are stored as 32-bit floats
    # def ensure_32bit_floats(docs):
    #     for doc in docs:
    #         if 'embedding' in doc.metadata:
    #             embedding = np.array(doc.metadata['embedding'], dtype=np.float32)
    #             print(f"Embedding dtype: {embedding.dtype}, shape: {embedding.shape}")
    #             doc.metadata['embedding'] = embedding.tolist()
    #     return docs
    

    specific_docs = ensure_32bit_floats(specific_docs)

    # Define the vector store with the correct dimension (768) and ensure it overwrites if necessary
    vector_store = MilvusVectorStore(
        uri=URL, dim=768, overwrite=True, collection_name=name
    )

    # Create storage context with the specified vector store
    storage_context = StorageContext.from_defaults(vector_store=vector_store)

    # Create the index from documents
    book_index = VectorStoreIndex.from_documents(
        specific_docs, storage_context=storage_context
    )

    # Get the query engine from the created index
    query_engine = book_index.as_query_engine()

    return query_engine

def query_milrun_index(name: str):
    m_vector_store = MilvusVectorStore(
        uri=URL, dim=768, collection_name=name)
    book_index = VectorStoreIndex.from_vector_store(vector_store=m_vector_store)
    query_engine = book_index.as_query_engine()
    return query_engine



# Function to query the index with a sample query vector
def test_query_engine(query_engine):
    query_vector = np.random.rand(768).astype(np.float32).tolist()  # 32-bit float
    print(f"Query vector dtype: {np.array(query_vector).dtype}, shape: {np.array(query_vector).shape}")
    results = query_engine.query(query_vector)
    for result in results:
        print(result)


# settings.init_settings()
# # Create index (uncomment if needed)
# query_engine = create_milrun_index("bhagavad_gita")

# # Query the index
# query_engine = query_milrun_index("bhagavad_gita")
# test_query_engine(query_engine)

