from __future__ import annotations
from typing import TYPE_CHECKING, Any, Optional
from datetime import datetime
from pydantic import EmailStr
from odmantic import ObjectId, Field

from app.db.base_class import Base

if TYPE_CHECKING:
    from . import Token  # noqa: F401

class Language(Base):
    id: ObjectId = Field(default_factory=ObjectId, primary_field=True)
    identifier: str = Field()
    name: str = Field()
    status: str = Field()
    created: int = Field(default_factory=lambda: int(datetime.now().timestamp()))
    owned_by: str = Field()