import json
from typing import Any, List
from fastapi import APIRouter,  Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from motor.core import AgnosticDatabase
from odmantic import ObjectId
import redis
from app import crud, schemas
from app.api import deps
from app.models.book import Book
from app.engine.model_data import ModelData

router = APIRouter()
model_data = ModelData()

redis_client = redis.Redis(host="ragv_redis-1", port=6379, decode_responses=True)

def parse_json_string(json_string: str):
    try:
        return json.loads(json_string)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON format")

@router.post("/add", response_model=schemas.Book)
async def add_book(
    *,
    db: AgnosticDatabase = Depends(deps.get_db),
    book_in: schemas.BookCreate 
) -> Any:
    """
    Create new book without the need to be logged in.
    """
    # book_in = schemas.BookCreate()
    book = await crud.book.create(db, obj_in=book_in)
    all_books = await crud.book.get_multi(db)
    redis_client.set(
        "ragv_books",
        json.dumps([b.model_dump(mode="json") for b in all_books])
    )
    # redis_client.set("ragv_books", json.dumps([b.model_dump(mode="json") for b in self.books]))
    return book

@router.put("/{id}", response_model=schemas.Book)
async def update_book(
    *,
    db: AgnosticDatabase = Depends(deps.get_db),
    id: str,
    book_in: schemas.BookUpdate
) -> Any:
    """
    Update an existing book without requiring login.
    """
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid ObjectId")

    existing = await crud.book.get(db=db, id=ObjectId(id))
    if not existing:
        raise HTTPException(status_code=404, detail="Book not found")

    updated = await crud.book.update(db=db, db_obj=existing, obj_in=book_in)

    all_books = await crud.book.get_multi(db)
    redis_client.set(
        "ragv_books",
        json.dumps([b.model_dump(mode="json") for b in all_books])
    )
    return updated


@router.get("/all", response_model=List[schemas.Book])
async def read_all_books(
    *,
    db: AgnosticDatabase = Depends(deps.get_db),
    page: int = 0,
    filter: str = Query("{}"), range: str = Query("[0,9]"), sort: str = Query('["id","ASC"]')
) -> Any:
    """
    Retrieve all books.
    """
    try:
     
        results = model_data.get_books()
     
        total = 10
      
        return results
    
    except Exception as error:
        print(error)
        raise HTTPException(status_code=404, detail="Books not found")

@router.get("/{id}", response_model=schemas.Book)
async def get_book(
    id: str,
    db: AgnosticDatabase = Depends(deps.get_db)
) -> Any:
    """
    Retrieve a single prompt by ID.
    """
    try:
        if not ObjectId.is_valid(id):
            raise HTTPException(status_code=400, detail="Invalid ObjectId format")

        result = await crud.book.get(db=db, id=ObjectId(id))

        if result is None:
            raise HTTPException(status_code=404, detail="Book not found")

        return result

    except Exception as error:
        print(error)
        raise HTTPException(status_code=500, detail="Internal server error")