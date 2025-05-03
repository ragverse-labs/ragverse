import json
from typing import Any, List
from fastapi import APIRouter,  Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from motor.core import AgnosticDatabase
from odmantic import ObjectId
from app import crud, db, models, schemas
from app.api import deps
from app.models.testPrompts import TestPrompts
    
router = APIRouter()


def parse_json_string(json_string: str):
    try:
        return json.loads(json_string)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON format")


@router.post("/add", response_model=schemas.TestPrompts)
async def add_test_prompt(
    *,
    db: AgnosticDatabase = Depends(deps.get_db),
    prompt_in: schemas.TestPromptCreate 
) -> Any:
    """
    Create new book without the need to be logged in.
    """
    prompt = await crud.testPrompts.create(db, obj_in=prompt_in)
    return prompt

@router.put("/{id}", response_model=schemas.TestPrompts)
async def update_prompt(
    *,
    db: AgnosticDatabase = Depends(deps.get_db),
    id: str,
    prompt_in: schemas.TestPromptUpdate
) -> Any:
    """
    Update an existing book without requiring login.
    """
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid ObjectId")

    existing = await crud.testPrompts.get(db=db, id=ObjectId(id))
    if not existing:
        raise HTTPException(status_code=404, detail="Test Prompt not found")

    updated = await crud.testPrompts.update(db=db, db_obj=existing, obj_in=prompt_in)
    return updated



@router.get("/all", response_model=List[schemas.TestPrompts])
async def read_test_prompts(
    *,
    db: AgnosticDatabase = Depends(deps.get_db),
    page: int = 0,
    filter: str = Query("{}"), range: str = Query("[0,9]"), sort: str = Query('["id","ASC"]')
) -> Any:
    """
    Retrieve all Prompts.
    """
    try:
        print("before....")
        results = await deps.get_all_test_prompts()
        print(results)
        # crud.testPrompts.get_multi(db=db)
        total = 10
        return results
    
    except Exception as error:
        print(error)
        raise HTTPException(status_code=404, detail="Test Prompt not found")
    

@router.get("/{id}", response_model=schemas.TestPrompts)
async def get_test_prompt(
    id: str,
    db: AgnosticDatabase = Depends(deps.get_db)
) -> Any:
    """
    Retrieve a single prompt by ID.
    """
    try:
        if not ObjectId.is_valid(id):
            raise HTTPException(status_code=400, detail="Invalid ObjectId format")

        result = await crud.testPrompts.get(db=db, id=ObjectId(id))

        if result is None:
            raise HTTPException(status_code=404, detail="Test Prompt not found")

        return result

    except Exception as error:
        print(error)
        raise HTTPException(status_code=500, detail="Internal server error")