from __future__ import annotations
from typing import List, Optional
from odmantic import Model, Field, ObjectId
from app.db.base_class import Base

class FewShotExample(Model):
    query: str = Field()  # User's question or query (Non-Optional)
    response: str = Field()  # System's response to the query (Non-Optional)


class Prompt(Base):
    id: ObjectId = Field(default_factory=ObjectId, primary_field=True)  # Non-Optional
    identifier: str = Field()
    name: str = Field()  # Non-Optional
    type: Optional[str] = Field(default=None)  # Type of the prompt (Optional)
    system_prompt: Optional[str] = Field(default=None)  # Base system prompt (Optional)
    system_prompt_sfx: Optional[str] = Field(default=None)  # Base system prompt suffix (Optional)
    user_prompt: Optional[str] = Field(default=None)  # User's prefix prompt (Optional)
    user_prompt_prx: Optional[str] = Field(default=None)  # User's suffix prompt (Optional)
    system_few_shots: Optional[List[FewShotExample]] = Field(default_factory=list) 
