import os
import textwrap
from llama_index.core import SimpleDirectoryReader, VectorStoreIndex, StorageContext
from llama_index.vector_stores.milvus import MilvusVectorStore
from app.core.config import settings
from pymilvus import MilvusClient


def create_milrun_index(name: str, source_dir: str):
    specific_docs = SimpleDirectoryReader(
        input_dir=os.path.join(source_dir, name)
    ).load_data()

    vector_store = MilvusVectorStore(
        uri=settings.MILVUS_URL,
        token=settings.MILVUS_TOKEN,
        dim=768,
        overwrite=True,
        collection_name=name
    )

    storage_context = StorageContext.from_defaults(vector_store=vector_store)
    index = VectorStoreIndex.from_documents(specific_docs, storage_context=storage_context)
    return index.as_query_engine()


def create_index_for_data_source(data_source: str):
    folders = [f for f in os.listdir(data_source) if os.path.isdir(os.path.join(data_source, f))]
    for folder in folders:
        print(f"Indexing: {folder}")
        try:
            query_engine = create_milrun_index(folder, data_source)
            response = query_engine.query("What are 2 key points in the text?")
            print("-------")
            print(folder)
            print(textwrap.fill(str(response), 500))
            print("-------")
            print(f"Indexed collection: {folder}")
        except Exception as e:
            print(f"Failed to index {folder}: {e}")


def query_collection(collection_name: str, question: str):
    vector_store = MilvusVectorStore(
        uri=settings.MILVUS_URL,
        token=settings.MILVUS_TOKEN,
        dim=768,
        collection_name=collection_name
    )
    index = VectorStoreIndex.from_vector_store(vector_store=vector_store)
    query_engine = index.as_query_engine()
    response = query_engine.query(question)

    print("-------")
    print(collection_name)
    print(textwrap.fill(str(response), 500))
    print("-------")


def delete_collection(collection_name: str):
    client = MilvusClient(uri=settings.MILVUS_URL, token=settings.MILVUS_TOKEN)
    if client.has_collection(collection_name):
        client.drop_collection(collection_name)
        print(f"Deleted collection: {collection_name}")
    else:
        print(f"Collection '{collection_name}' does not exist.")
