# import json
from typing import Sequence

from llama_index.core import (
    SimpleDirectoryReader,
    VectorStoreIndex,
    StorageContext,
    # Document,
    ServiceContext,
    # load_index_from_storage,
)
import numpy as np
# from pymilvus import MilvusClient
# import torch
# from llama_index.core.tools import QueryEngineTool, ToolMetadata
# from app import settings
from llama_index.vector_stores.milvus import MilvusVectorStore
# from llama_index.vector_stores.milvus import MilvusVectorStore
import textwrap

from app.engine import configuration
# from llama_index.core.data_structs import Node

# from  app.app.engine.constants import  SOURCE_DIR, VECTOR_STORAGE_DIR
# from app.app.engine import settings
# from query_manager import QueryEngineManager
SOURCE_DIR = "./originals/"
# "Kautilyas_Arthashastra_1915", "Patanjali-yogasutra_IGS", "bhagavad-gita", "Upanishads_of_the_Rig_Veda", "Essentials_of_Hindutva", "Valmiki_Ramayana_Trans_Bibek_Debroy"

# ar_idx_name = CHROMA_STORAGE_DIR + "Kautilyas_Arthashastra_1915"
# yg_idx_name = CHROMA_STORAGE_DIR + "Patanjali-yogasutra_IGS"
# gt_idx_name = CHROMA_STORAGE_DIR + "bhagavad-gita"
# rg_idx_name = CHROMA_STORAGE_DIR + "Upanishads_of_the_Rig_Veda"
# ht_idx_name = CHROMA_STORAGE_DIR + "Essentials_of_Hindutva"
# rm_idx_name = CHROMA_STORAGE_DIR + "Valmiki_Ramayana_Trans_Bibek_Debroy"
# mb_idx_name = CHROMA_STORAGE_DIR + "Mahabharata_Unabridged"

# def get_query_engine_tools():
#     try:
#         storage_context = StorageContext.from_defaults(
#             persist_dir=ar_idx_name
#         )
#         arthashastra_index = load_index_from_storage(storage_context)

#         storage_context = StorageContext.from_defaults(
#              persist_dir=yg_idx_name
#         )
#         yogsutra_index = load_index_from_storage(storage_context)

#         storage_context = StorageContext.from_defaults(
#              persist_dir=gt_idx_name
#         )
#         bhagvad_index = load_index_from_storage(storage_context)

#         storage_context = StorageContext.from_defaults(
#             persist_dir=rg_idx_name
#         )
#         rigveda_index = load_index_from_storage(storage_context)

#         storage_context = StorageContext.from_defaults(
#              persist_dir=ht_idx_name
#         )
#         hindutva_index = load_index_from_storage(storage_context)

#         storage_context = StorageContext.from_defaults(
#              persist_dir=rm_idx_name
#         )
#         ramayana_index = load_index_from_storage(storage_context)
        
#         storage_context = StorageContext.from_defaults(
#              persist_dir=mb_idx_name
#         )
#         mahabharat_index = load_index_from_storage(storage_context)

#         index_loaded = True
#     except:
#         index_loaded = False

#     if index_loaded:

#         artha_engine = arthashastra_index.as_query_engine(similarity_top_k=1)
#         ysutra_engine = yogsutra_index.as_query_engine(similarity_top_k=1)
#         bgita_engine = bhagvad_index.as_query_engine(similarity_top_k=1)
#         rveda_engine = rigveda_index.as_query_engine(similarity_top_k=1)
#         hindu_engine = hindutva_index.as_query_engine(similarity_top_k=1)
#         rama_engine = ramayana_index.as_query_engine(similarity_top_k=1)
#         mahabh_engine = mahabharat_index.as_query_engine(similarity_top_k=1)

#         query_engine_tools = [
#             QueryEngineTool(
#                 query_engine=artha_engine,
#                 metadata=ToolMetadata(
#                     name="Kautilyas_Arthashastra_1915",
#                     description=(
#                         "This is classic vedas Kautilyas_Arthashastra_1915 "
#                         "Use a detailed plain text question as input to the tool."
#                     ),
#                 ),
#             ),
#             QueryEngineTool(
#                 query_engine=ysutra_engine,
#                 metadata=ToolMetadata(
#                     name="Patanjali-yogasutra_IGS",
#                     description=(
#                         "Yhis is classic Yoga Sutras -  Patanjali-yogasutra_IGS"
#                         "Use a detailed plain text question as input to the tool."
#                     ),
#                 ),
#             ),
#             QueryEngineTool(
#                 query_engine=bgita_engine,
#                 metadata=ToolMetadata(
#                     name="bhagavad-gita",
#                     description=(
#                         "This is Bhagavad Gita. "
#                         "Use a detailed plain text question as input to the tool."
#                     ),
#                 ),
#             ),
#             QueryEngineTool(
#                 query_engine=rveda_engine,
#                 metadata=ToolMetadata(
#                     name="Upanishads_of_the_Rig_Veda",
#                     description=(
#                         "Rig Vedas one of the best Vedas "
#                         "Use a detailed plain text question as input to the tool."
#                     ),
#                 ),
#             ),
#             QueryEngineTool(
#                 query_engine=hindu_engine,
#                 metadata=ToolMetadata(
#                     name="Essentials_of_Hindutva",
#                     description=(
#                         "One of the best books on Hindutva "
#                         "Use a detailed plain text question as input to the tool."
#                     ),
#                 ),
#             ),
#             QueryEngineTool(
#                 query_engine=rama_engine,
#                 metadata=ToolMetadata(
#                     name="Valmiki_Ramayana_Trans_Bibek_Debroy",
#                     description=(
#                         "Ramayana - Our Epic "
#                         "Use a detailed plain text question as input to the tool."
#                     ),
#                 ),
#             ),
#             QueryEngineTool(
#                 query_engine=mahabh_engine,
#                 metadata=ToolMetadata(
#                     name="Mahabharata_Unabridged",
#                     description=(
#                         "Mahabharatha - Our Epic "
#                         "Use a detailed plain text question as input to the tool."
#                     ),
#                 ),
#             ),
#         ]
#         return query_engine_tools
    
# def create_indexes():
#     # load data
#     arthashastra_docs = SimpleDirectoryReader(
#             input_files=[DATA_DIR + "Kautilyas_Arthashastra_1915.pdf"]
#         ).load_data()
#     yogsutra_docs = SimpleDirectoryReader(
#             input_files=[DATA_DIR + "Patanjali-yogasutra_IGS.pdf"]
#         ).load_data()
#     bhagavad_docs = SimpleDirectoryReader(
#             input_files=[DATA_DIR + "bhagavad-gita.pdf"]
#         ).load_data()

#     rigveda_docs = SimpleDirectoryReader(
#             input_files=[DATA_DIR + "Upanishads_of_the_Rig_Veda.pdf"]
#         ).load_data()
#     hindutva_docs = SimpleDirectoryReader(
#             input_files=[DATA_DIR + "Essentials_of_Hindutva.pdf"]
#         ).load_data()
#     ramayana_docs = SimpleDirectoryReader(
#             input_files=[DATA_DIR + "Valmiki_Ramayana_Trans_Bibek_Debroy.pdf"]
#         ).load_data()


#     # build index
#     print("before")
#     arthasha_index = VectorStoreIndex.from_documents(arthashastra_docs)
#     print("arthasha_index")
#     yogsutra_index = VectorStoreIndex.from_documents(yogsutra_docs)
#     print("yogsutra_index")
#     bhagavad_index = VectorStoreIndex.from_documents(bhagavad_docs)
#     print("bhagavad_index")
#     rigveda_index = VectorStoreIndex.from_documents(rigveda_docs)
#     print("rigveda_index")
#     hindutva_index = VectorStoreIndex.from_documents(hindutva_docs)
#     print("hindutva_index")
#     ramayana_index = VectorStoreIndex.from_documents(ramayana_docs)
#     print("ramayana_index")

#     # persist index
#     arthasha_index.storage_context.persist(persist_dir=ar_idx_name)
#     yogsutra_index.storage_context.persist(persist_dir=yg_idx_name)
#     bhagavad_index.storage_context.persist(persist_dir=gt_idx_name)
#     rigveda_index.storage_context.persist(persist_dir=rg_idx_name)
#     hindutva_index.storage_context.persist(persist_dir=ht_idx_name)
#     ramayana_index.storage_context.persist(persist_dir=rm_idx_name)

def create_specific_index(pdf_name: str):
    # settings.init_settings()
    specific_docs = SimpleDirectoryReader(
            input_dir = SOURCE_DIR + pdf_name
    ).load_data()
    specific_index = VectorStoreIndex.from_documents(specific_docs, emded_model = configuration.membed_model )
    # name = CHROMA_STORAGE_DIR + pdf_name.removesuffix(".pdf")
    # name = VECTOR_STORAGE_DIR + pdf_name.removesuffix(".pdf")
    name =  pdf_name.removesuffix(".pdf")
    specific_index.storage_context.persist(persist_dir=name)


# print("creating index...")
# # create_indexes()
# print("done index...")
# # create the book index
# create_specific_index("bhagavad-gita.pdf")

TOKEN="40abf659fea7454be0a28c384c7e9b9eddb06ad6f9afcd18746c255fdf8fd56fde9616cae4b0be688a5b7416a84d75466d3fa805"
# URL="https://in03-124aa1577d66391.api.gcp-us-west1.zillizcloud.com"
# URL="http://localhost:19530"
URL="http://milvus-standalone:19530/"
def create_milrun_index(name: str):
    
    specific_docs = SimpleDirectoryReader(
            input_dir=SOURCE_DIR + name
    ).load_data()

    vector_store = MilvusVectorStore(
     uri=URL, token=TOKEN, dim=768, overwrite=False, collection_name=name,
    )
    
    storage_context = StorageContext.from_defaults(vector_store=vector_store)
    book_index = VectorStoreIndex.from_documents(
        specific_docs, storage_context=storage_context
    )
    query_engine = book_index.as_query_engine()
    return query_engine


def query_milrun_index(name: str):
    # settings.init_settings()
    m_vector_store = MilvusVectorStore(
        uri=URL, dim=768, collection_name=name)
    # m_vector_store = MilvusVectorStore(
    #     uri=URL, dim=768, token=TOKEN, overwrite=False, collection_name=pdf_name.removesuffix(".pdf"))
    # storage_context = StorageContext.from_defaults(
    #     vector_store=m_vector_store)
    # sc = ServiceContext.from_defaults(embed_model=settings.membed_model)
    book_index = VectorStoreIndex.from_vector_store(vector_store=m_vector_store)
    # book_index = load_index_from_storage(storage_context)
    query_engine = book_index.as_query_engine()
    return query_engine


configuration.init_settings()
# # cs = MilvusClient(URL)
query_engine = create_milrun_index("ramayana")
# # query_engine = query_milrun_index("bhagavad_gita")
# question="Explain background on Kunti illegit son"
question="What is biggest mistake of Ram's Father"
# question1="What is biggest dilemma Arjuna has?"
# # question1="explain brief about Karma, Bhakti, Jnana and Raja Yoga"
# question1="List three Nitis"
# question1="How to learn various aspects of Yoga"
# question2="List all the major sections of the book along with brief description?"
# question2="describe the traits of Luv and Kush"
# question2="What is ironical in the description of Krishna's character?"
# question2="Summarize the the World's Parliament of Religions, Chicago"
# question2="What is biggest lesson we learn from the book"
# # question2="Summarize the core essense of the book"
response = query_engine.query(question)
print(textwrap.fill(str(response), 100))

# response = query_engine.query(question2)
# print(textwrap.fill(str(response), 100))

# response = query_engine.query("What is Duality. explain with example?")
# print(textwrap.fill(str(response), 100))

# books = [
#     "bhagavad-gita",
#     "Bhakti-Yoga-by-Swami-Vivekananda",
#     # "Complete_Works_of_Swami_Vivekananda_all_volumes",
#     "Essentials_of_Hindutva",
#     "Jnana-Yoga-by-Swami-Vivekananda",
#     "Karma-Yoga-by-Swami-Vivekananda",
#     "Kautilyas_Arthashastra_1915",
#     "Mahabharata_Unabridged",
#     "Patanjali-yogasutra_IGS",
#     "Raja-Yoga-by-Swami-Vivekananda",
#     "Upanishads_of_the_Atharva_Veda",
#     "Upanishads_of_the_Krishna_Yajur_Veda",
#     "Upanishads_of_the_Rig_Veda",
#     "Upanishads_of_the_Shukla_Yajur_Veda",
#     "Valmiki_Ramayana_Trans_Bibek_Debroy"
# ]


# settings.init_settings()

# book_name = "Raja-Yoga-by-Swami-Vivekananda"
# # create_specific_index(book_name +".pdf")
# # # Complete_Works_of_Swami_Vivekananda_all_volumes"
# # # Jnana-Yoga-by-Swami-Vivekananda"
# # service_context = ServiceContext.from_defaults(
# #     chunk_size=1024,
# #     llm=settings.mllm,
# #     embed_model=settings.embedding
# # )

# storage_context = StorageContext.from_defaults( persist_dir = '/Users/mdalmia/our_vedas/backend/chroma_storage/' + book_name)
           
# book_index = load_index_from_storage(storage_context, embed_model=settings.embed_model)
# # load your index from stored vectors
# # VectorStore 
# # book_index = VectorStoreIndex.from_vector_store(storage_context=storage_context, embed_model=settings.embed_model)


                
# query_engine = book_index.as_query_engine(streaming=True, similarity_top_k=1)

# text = "What does book teaches us"
# print(query_engine.query(text))

# manager = QueryEngineManager()
# # book_name = 'Bhakti-Yoga-by-Swami-Vivekananda'
# # Essentials_of_Hindutva'
# # Jnana-Yoga-by-Swami-Vivekananda'
# for book_name in books:

#      # 
#     try:
#         engine = manager.get_engine_by_name(book_name)
#         print(book_name + "----")
#         text = "Highlight something interesting about the book"
#         print(engine.query(text))
#         # storage_context = StorageContext.from_defaults( persist_dir = '/Users/mdalmia/our_vedas/backend/chroma_storage/' + book_name)
           
#         # # book_index = load_index_from_storage(storage_context)
#         # book_index = load_index_from_storage(storage_context)
                
#         # query_engine = book_index.as_query_engine(streaming=True, similarity_top_k=1)

#         # text = "What does book teaches us"
#         # print(query_engine.query(text))
#     except Exception as e:
#             # index_loaded = False
#         print(f"Failed to load indices: {e}")
        

