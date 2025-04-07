from typing import List, Optional
from app.models.prompt import Prompt
from app.engine.model_data import ModelData

class SingletonMeta(type):
    _instances = {}

    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            instance = super().__call__(*args, **kwargs)
            cls._instances[cls] = instance
        return cls._instances[cls]

class PromptManager(metaclass=SingletonMeta):
    def __init__(self):
        model_data = ModelData()
        raw_prompts = model_data.get_prompts()
        # Convert list of dicts to Prompt objects
        self.prompts = [Prompt(**p) if isinstance(p, dict) else p for p in raw_prompts]

    def _get_prompt_by_type(self, prompt_type: str) -> Optional[Prompt]:
        return next((p for p in self.prompts if p.type == prompt_type), None)

    def get_user_prompt(self, prompt_type: str) -> Optional[str]:
        prompt = self._get_prompt_by_type(prompt_type)
        return prompt.user_prompt if prompt else None

    def get_system_prompt(self, prompt_type: str) -> Optional[str]:
        prompt = self._get_prompt_by_type(prompt_type)
        if not prompt:
            return None
        return f"{prompt.system_prompt or ''}\n{prompt.system_prompt_sfx or ''}".strip()

        # self._initialized = False

    # async def initialize(self):
    #     if not self._initialized:
    #         self.prompts = await deps.get_all_prompts()
    #         self._initialized = True

    # def _get_prompt_by_type(self, prompt_type: str) -> Optional[Prompt]:
    #     return next((p for p in self.prompts if p.type == prompt_type), None)

    # def get_user_prompt(self, prompt_type: str) -> Optional[str]:
    #     prompt = self._get_prompt_by_type(prompt_type)
    #     return prompt.user_prompt if prompt else None

    # def get_system_prompt(self, prompt_type: str) -> Optional[str]:
    #     prompt = self._get_prompt_by_type(prompt_type)
    #     if not prompt:
    #         return None
    #     return f"{prompt.system_prompt or ''}\n{prompt.system_prompt_sfx or ''}".strip()
    

# import json
# from llama_index.core import VectorStoreIndex, PromptTemplate
# from llama_index.core.schema import TextNode

# from app.api import deps

# class SingletonMeta(type):
#     _instances = {}

#     def __call__(cls, *args, **kwargs):
#         if cls not in cls._instances:
#             instance = super().__call__(*args, **kwargs)
#             cls._instances[cls] = instance
#         return cls._instances[cls]

# class PromptManager(metaclass=SingletonMeta):
#     def __init__(self):
#         # self.setup_prompts()
#         self.prompts = deps.get_all_prompts()

#     def get_user_prompt(self, type):
#         return self.prompts
    
#     def get_system_prompt(self, type):
#         return self.prompts
    
#     def setup_prompts(self):
#         guarding_rails_str = self.guarding_rails_fn()

#         self.qa_prompt_tmpl_str = f"""
#         You are RagVerse — an integrated, specialized assistant powered by Retrieval-Augmented Generation (RAG).
#         Your task is to answer queries using only the information available in the provided context. Do not use prior knowledge or any external data.

#         Be factual, helpful, and precise. If the question is not covered by the context, politely respond that no relevant information could be found.

#         Be cautious not to introduce misinformation or hallucinations. Do not engage in opinions, personal judgments, or speculation.

#         Below are moderation and safety guidelines:

#         ---------------------
#         {guarding_rails_str}
#         ---------------------
#         """

#         self.qa_prompt_tmpl = PromptTemplate(
#             self.qa_prompt_tmpl_str,
#         )

#     def few_shot_examples_fn(self, **kwargs):
#         few_shot_nodes = []
#         with open('few_shots.jsonl', "r") as file:
#             for line in file:
#                 few_shot_nodes.append(TextNode(text=line.strip()))

#         result_strs = []
#         for n in few_shot_nodes:
#             raw_dict = json.loads(n.get_content())
#             query = raw_dict["query"]
#             response_dict = raw_dict["response"]
#             result_str = f"Query: {query}\nResponse: {response_dict}"
#             result_strs.append(result_str)
#         return "\n\n".join(result_strs)

#     def guarding_rails_fn(self, **kwargs):
#         guard_rail_str = """You're given a list of moderation categories as below:
#         - hate, violence, harassment: Avoid generating or supporting any content that expresses or promotes hate, identity-based bias, harassment, threats, or glorification of violence.
#         """
#         return guard_rail_str

#     def apply_prompts(self, book_name, query_engine):
#         query_engine.update_prompts(
#             {"response_synthesizer:condense_plus_context": self.qa_prompt_tmpl}
#         )
#         return query_engine

#     def get_user_prompt(self, type):
#         return self.prompts
    
#     def get_system_prompt(self, type):
#         return self.prompts
    
#     def get_chat_prompt(self, book_name):
#         context_prompt_str = (
#             f"""[INST]
#             You are RagVerse, a Retrieval-Augmented Generation assistant trained on specialized document knowledge.
#             You should answer questions only using the context provided. Strictly rely provided information. Do not refer external sources.
#             Do not fabricate information, and politely state if no relevant answer is found.

#             Follow the instructions below strictly:
#             {self.qa_prompt_tmpl_str}
#             [/INST]"""
#         )
#         return context_prompt_str

#     def get_qa_prompt_template(self):
#         return self.qa_prompt_tmpl
