from typing import Dict
from llama_index.core import (
    VectorStoreIndex
)
from llama_index.vector_stores.milvus import MilvusVectorStore
from llama_index.core.memory import ChatMemoryBuffer
from app.engine import configuration
from app.engine.prompt_manager import PromptManager
from llama_index.storage.chat_store.redis import RedisChatStore
from app.core.config import settings
from app.engine.model_data import ModelData
from llama_index.core.chat_engine.types import BaseChatEngine

class QueryEngineToolsLoader:
    def __init__(self):
        configuration.init_settings() 
        self.token = settings.MILVUS_TOKEN
        self.url = settings.MILVUS_URL
        self.query_indexes: Dict[str, VectorStoreIndex] = {}
        self.load_indices()
        self.prompt_manager = PromptManager()
        self.chat_store  = RedisChatStore(redis_url=settings.REDIS_CHAT_STORE_URL, ttl=300)
       

    def health_check(self, query_engine):
        try:
            print(query_engine.query("Give a one-sentence summary from your internal information"))
            return True
        except Exception as e:
            print("LLM pipeline failed:", e)
            return False


    def load_indices(self):
        # if self.index_loaded == False:
            try:
                model_data = ModelData()
                # collections = ["research", "united_nations", "medical_manuals", "rbi_documents"]
                collections = model_data.get_books()
                print("for loading indices")
                # print(collections)
                for collection in collections:
                    collection_name=collection["identifier"]
                    m_vector_store = MilvusVectorStore(
                        uri=self.url,  dim=768, collection_name=collection_name)
                    
                    book_index = VectorStoreIndex.from_vector_store(vector_store=m_vector_store)
                    self.health_check(book_index.as_query_engine())
                    self.query_indexes[collection_name] = book_index
            except Exception as e:
                self.index_loaded = False
                print(f"Failed to load indices: {e}")
            # milvus_client.close()

            self.index_loaded = True
            return self.index_loaded

     
    def get_query_engines(self):
        return self.query_indexes


    def get_engine(self, book_name, userId, reset_chat) -> BaseChatEngine:

        try:
            print("1-" + userId)
            chat_memory = ChatMemoryBuffer.from_defaults(
                    token_limit=3000,
                    chat_store=self.chat_store,
                    chat_store_key=userId,
                    )
            
            
            if reset_chat:
                chat_memory.reset()
            index = self.query_indexes[book_name]

            prmpt = self.prompt_manager.get_system_prompt(prompt_type=book_name)
            chat_engine = index.as_chat_engine(chat_mode="context", streaming=True, 
                                                            memory=chat_memory,  
                                                            similarity_top_k=1,
                                                            context_prompt=prmpt,
                                                            verbose=True)

        except Exception as e:
            # change the default
            index  =  self.query_indexes["research"]
            chat_engine = index.as_chat_engine(chat_mode="context", streaming=True, 
                                                            context_prompt=self.prompt_manager.get_system_prompt(prompt_type=book_name),
                                                            verbose=True)
            # return chat_engine    
            print(f"Failed to load indices: {e}")
        return chat_engine
    
    


