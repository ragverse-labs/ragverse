from __future__ import annotations
from typing import TYPE_CHECKING
from datetime import datetime
from odmantic import ObjectId, Field
from app.db.base_class import Base

if TYPE_CHECKING:
    from . import TestPrompts  # noqa: F401

class TestPrompts(Base):
    id: ObjectId = Field(default_factory=ObjectId, primary_field=True)
    question: str = Field()
    answer: str = Field()
    language: str = Field()
    book_name: str = Field()
    order: int = Field()
    show: int = Field()
    # created: int = Field(default_factory=lambda: int(datetime.now().timestamp()))

    # class Config:
    #     collection = "testPrompts"  
