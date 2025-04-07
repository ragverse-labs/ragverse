from typing import List
from typing_extensions import Annotated
from pydantic import BaseModel, ConfigDict, Field, SecretStr
from odmantic import ObjectId
from datetime import datetime

class FewShotExample(BaseModel):
    query: str = Field()  # User's question or query (Non-Optional)
    response: str = Field()  # System's response to the query (Non-Optional)

# Shared properties for Book
class PromptBase(BaseModel):
    identifier: str = Field()
    name: str = Field()  # Non-Optional
    type: str = Field(default=None)  # Type of the prompt (Optional)
    system_prompt: str = Field(default=None)  # Base system prompt (Optional)
    system_prompt_sfx: str = Field(default=None)  # Base system prompt suffix (Optional)
    user_prompt: str = Field(default=None)  # User's prefix prompt (Optional)
    user_prompt_prx: str = Field(default=None)  # User's suffix prompt (Optional)
    system_few_shots: List[FewShotExample] = Field(default_factory=list) 


    # Properties to receive via API on creation
class PromptCreate(PromptBase):
    id: str = Field(...)


# Properties to receive via API on update
class PromptUpdate(PromptBase):
    pass  # Inherits all fields from BookBase


class PromptInDBBase(PromptBase):
    id: ObjectId | None = None
    model_config = ConfigDict(from_attributes=True)


# Additional properties to return via API
class Prompt(PromptInDBBase):
    pass  # Inherits all fields from BookInDBBase, no additional fields or methods needed


# Additional properties stored in DB
class PromptInDB(PromptInDBBase):
    pass  # Inherits all fields from BookInDBBase, no additional fields or methods needed