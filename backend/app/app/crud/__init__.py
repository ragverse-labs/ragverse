
from .crud_user import user
from .crud_token import token


# For a new basic set of CRUD operations you could just do

from .base import CRUDBase
from app.models.book import Book
from app.schemas.book import BookCreate, BookUpdate
from app.models.language import Language
from app.schemas.language import LanguageCreate, LanguageUpdate
from app.models.prompt import Prompt
from app.schemas.prompt import PromptCreate, PromptUpdate
from app.models.testPrompts import TestPrompts
from app.schemas.testPrompts import  TestPromptCreate, TestPromptUpdate

book = CRUDBase[Book, BookCreate, BookUpdate](Book)
language = CRUDBase[Language, LanguageCreate, LanguageUpdate](Language)
prompt = CRUDBase[Prompt, PromptCreate, PromptUpdate](Prompt)
testPrompts = CRUDBase[TestPrompts, TestPromptCreate, TestPromptUpdate](TestPrompts)