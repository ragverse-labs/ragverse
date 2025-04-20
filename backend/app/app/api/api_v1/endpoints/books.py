import json
from typing import Any, List
from fastapi import APIRouter,  Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from motor.core import AgnosticDatabase
from app import crud, schemas
from app.api import deps
from app.models.book import Book
from app.engine.model_data import ModelData

router = APIRouter()
model_data = ModelData()

def parse_json_string(json_string: str):
    try:
        return json.loads(json_string)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON format")

@router.post("/", response_model=schemas.Book)
async def add_book(
    *,
    db: AgnosticDatabase = Depends(deps.get_db),
    book: Book
) -> Any:
    """
    Create new book without the need to be logged in.
    """
    # user = await crud.book.create(db, book=book)
    # if user:
    #     raise HTTPException(
    #         status_code=400,
    #         detail="This username is not available.",
    #     )
    # Create user auth
    book_in = schemas.BookCreate()
    book = await crud.book.create(db, obj_in=book_in)
    return book

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
    
    # try:
    #     filter_json = parse_json_string(filter)
    #     range_list = parse_json_string(range)
    #     sort_list = parse_json_string(sort)
    # except ValueError as e:
    #     raise HTTPException(status_code=400, detail=str(e))

    # # Convert range and sort into usable format for your database query
    # limit = 15
    # offset = range_list[0]
    # order_by = f"{sort_list[0]} {sort_list[1]}"

    try:
        # results = list(collection.find({"status":"published"}, {'_id': 0}))
        # print("all books ... ")
        results = model_data.get_books()
        # print("all books")
        # print(db)
        # print(results)
        total = 10
        # len(results)
        # content_range = f"items {offset}-{offset+limit-1}/{total}"

        # res = JSONResponse(content=results, headers={"X-Total-Count": str(total), "Content-Range": content_range})
        # Create and return a JSONResponse object with custom headers
        # print(res)
        return results
    
    except Exception as error:
        print(error)
        raise HTTPException(status_code=404, detail="Books not found")

