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

