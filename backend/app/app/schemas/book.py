from typing_extensions import Annotated
from pydantic import BaseModel, ConfigDict, Field, SecretStr
from odmantic import ObjectId
from datetime import datetime


# Shared properties for Book
class BookBase(BaseModel):
    identifier: str = Field()
    name: str = Field(...)
    category: str = Field()
    author: str = Field()
    description: str = Field()
    ranking: int = Field(default=1)
    reviewed_by: str = Field(default="")
    status: str = Field(default="")
    created: int = Field(default_factory=lambda: int(datetime.now().timestamp()))
    owned_by: str = Field()


# Properties to receive via API on creation
class BookCreate(BookBase):
    id: str = Field(...)


# Properties to receive via API on update
class BookUpdate(BookBase):
    pass  # Inherits all fields from BookBase


class BookInDBBase(BookBase):
    id: ObjectId | None = None
    model_config = ConfigDict(from_attributes=True)


# Additional properties to return via API
class Book(BookInDBBase):
    pass  # Inherits all fields from BookInDBBase, no additional fields or methods needed


# Additional properties stored in DB
class BookInDB(BookInDBBase):
    pass  # Inherits all fields from BookInDBBase, no additional fields or methods needed
