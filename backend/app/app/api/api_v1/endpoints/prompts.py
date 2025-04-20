import json
from typing import Any, List
from fastapi import APIRouter,  Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from motor.core import AgnosticDatabase
from app import crud, db, models, schemas
from app.api import deps
from app.models.prompt import Prompt
    
router = APIRouter()


def parse_json_string(json_string: str):
    try:
        return json.loads(json_string)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON format")

@router.post("/", response_model=schemas.Prompt)
async def update_prompt(
    *,
    db: AgnosticDatabase = Depends(deps.get_db),
    prompt: Prompt
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
    book_in = schemas.Pro()
    book = await crud.book.create(db, obj_in=book_in)
    return book

@router.get("/all", response_model=List[schemas.Prompt])
async def read_all_prompts(
    *,
    db: AgnosticDatabase = Depends(deps.get_db),
    page: int = 0,
    filter: str = Query("{}"), range: str = Query("[0,9]"), sort: str = Query('["id","ASC"]')
) -> Any:
    """
    Retrieve all Prompts.
    """
    try:
        results = await crud.prompt.get_multi(db=db, page=page)
        total = 10
        return results
    
    except Exception as error:
        print(error)
        raise HTTPException(status_code=404, detail="Books not found")