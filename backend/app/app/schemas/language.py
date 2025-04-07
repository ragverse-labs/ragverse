from typing_extensions import Annotated
from pydantic import BaseModel, ConfigDict, Field
from odmantic import ObjectId
from datetime import datetime


# Shared properties for Language
class LanguageBase(BaseModel):
    identifier: str = Field()
    name: str = Field()
    status: str = Field(default="")
    created: int = Field(default_factory=lambda: int(datetime.now().timestamp()))
    owned_by: str = Field()


# Properties to receive via API on creation
class LanguageCreate(LanguageBase):
    id: str = Field()


# Properties to receive via API on update
class LanguageUpdate(LanguageBase):
    pass  # Inherits all fields from LanguageBase


class LanguageInDBBase(LanguageBase):
    id: ObjectId | None = None
    model_config = ConfigDict(from_attributes=True)


# Additional properties to return via API
class Language(LanguageInDBBase):
    pass  # Inherits all fields from LanguageInDBBase, no additional fields or methods needed


# Additional properties stored in DB
class LanguageInDB(LanguageInDBBase):
    pass  # Inherits all fields from LanguageInDBBase, no additional fields or methods needed
