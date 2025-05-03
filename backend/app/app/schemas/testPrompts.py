from typing_extensions import Annotated
from pydantic import BaseModel, ConfigDict, Field
from odmantic import ObjectId
from datetime import datetime


# Shared properties
class TestPromptBase(BaseModel):
    question: str = Field()
    answer: str = Field()
    language: str = Field()
    book_name: str = Field()
    order: int = Field()
    show: int = Field(default=1)
    # created: int = Field(default_factory=lambda: int(datetime.now().timestamp()))



# Properties to receive via API on creation
class TestPromptCreate(TestPromptBase):
    pass
    # id: str = Field(...)


# Properties to receive via API on update
class TestPromptUpdate(TestPromptBase):
    pass


# Base class for DB (includes ID)
class TestPromptInDBBase(TestPromptBase):
    id: ObjectId | None = None
    model_config = ConfigDict(from_attributes=True)


# For API response
class TestPrompts(TestPromptInDBBase):
    pass


# For internal DB usage
class TestPromptInDB(TestPromptInDBBase):
    pass
