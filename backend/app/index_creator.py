import os
import textwrap
from llama_index.core import (
    SimpleDirectoryReader,
    VectorStoreIndex,
    StorageContext,
)
from llama_index.vector_stores.milvus import MilvusVectorStore
from app.engine import configuration

SOURCE_DIR = "./app/data-source/"
TOKEN = "40abf659fea7454be0a28c384c7e9b9eddb06ad6f9afcd18746c255fdf8fd56fde9616cae4b0be688a5b7416a84d75466d3fa805"
URL = "http://localhost:19530"

configuration.init_settings()
print("init_settings created")

def create_milrun_index(name: str):
    
    specific_docs = SimpleDirectoryReader(
            input_dir=SOURCE_DIR + name
    ).load_data()

    vector_store = MilvusVectorStore(
     uri=URL, token=TOKEN, dim=768, overwrite=True, collection_name=name,
    )
    
    
    storage_context = StorageContext.from_defaults(vector_store=vector_store)
    book_index = VectorStoreIndex.from_documents(
        specific_docs, storage_context=storage_context
    )
    query_engine = book_index.as_query_engine()
    return query_engine

def create_index_for_all_folders():
    folders = [f for f in os.listdir(SOURCE_DIR) if os.path.isdir(os.path.join(SOURCE_DIR, f))]
    for folder in folders:
        print(f"Indexing: {folder}")
        try:
            documents = SimpleDirectoryReader(input_dir=os.path.join(SOURCE_DIR, folder)).load_data()
            vector_store = MilvusVectorStore(
                uri=URL, token=TOKEN, dim=768, overwrite=False, collection_name=folder
            )
            storage_context = StorageContext.from_defaults(vector_store=vector_store)
            VectorStoreIndex.from_documents(documents, storage_context=storage_context)
            print(f"Indexed collection: {folder}")
        except Exception as e:
            print(f"Failed to index {folder}: {e}")

def query_collection(collection_name: str, question: str):
    vector_store = MilvusVectorStore(uri=URL, token=TOKEN, dim=768, collection_name=collection_name)
    index = VectorStoreIndex.from_vector_store(vector_store=vector_store)
    query_engine = index.as_query_engine()
    response = query_engine.query(question)
    print("-------")
    print(collection_name)
    print(textwrap.fill(str(response), 500))
    print("-------")

def delete_collection(collection_name: str):
    from pymilvus import MilvusClient
    client = MilvusClient(uri=URL, token=TOKEN)
    if client.has_collection(collection_name):
        client.drop_collection(collection_name)
        print(f"Deleted collection: {collection_name}")
    else:
        print(f"Collection '{collection_name}' does not exist.")

# Example Usage
# create_index_for_all_folders()
# delete_collection("rbi_documents")
# create_milrun_index("rbi_documents")
# # query_collection("rbi_documents", "What are 2 key points in the text? name the book also. Strictly rely provided information. Do not refer external sources")
# # delete_collection("research")
# create_milrun_index("research")
# # query_collection("research", "Explain about Attention is all you need. Strictly rely provided information. Do not refer external sources")
# # # delete_collection("united_nations")
# create_milrun_index("united_nations")
# # query_collection("united_nations", "What is Promise in Peril? Strictly rely provided information. Do not refer external sources")
# # # query_collection("united_nations", "what are 5 key areas of urgent action??")
# # # delete_collection("medical_manuals")
# create_milrun_index("medical_manuals")
query_collection("medical_manuals", "What are 2 key points in the text? Strictly rely provided information. Do not refer external sources")
query_collection("research", "What are 2 key points in the text? name the book also")
query_collection("united_nations", "What are 2 key points in the text? name the book also")
query_collection("rbi_documents", "What are 2 key points in the text? name the book also")

