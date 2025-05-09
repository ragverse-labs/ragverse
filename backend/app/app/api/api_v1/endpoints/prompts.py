import json
from typing import Any, List
from fastapi import APIRouter,  Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from motor.core import AgnosticDatabase
from odmantic import ObjectId
import redis
from app import crud, db, models, schemas
from app.api import deps
from app.models.prompt import Prompt
    
router = APIRouter()
redis_client = redis.Redis(host="ragv_redis-1", port=6379, decode_responses=True)

def parse_json_string(json_string: str):
    try:
        return json.loads(json_string)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON format")

@router.post("/add", response_model=schemas.Prompt)
async def add_prompt(
    *,
    db: AgnosticDatabase = Depends(deps.get_db),
    prompt_in: schemas.PromptCreate 
) -> Any:
    """
    Create new book without the need to be logged in.
    """
    prompt = await crud.prompt.create(db, obj_in=prompt_in)

    all_prompts = await crud.prompt.get_multi(db)
    redis_client.set(
        "ragv_prompts",
        json.dumps([b.model_dump(mode="json") for b in all_prompts])
    )
    return prompt

@router.put("/{id}", response_model=schemas.Prompt)
async def update_prompt(
    *,
    db: AgnosticDatabase = Depends(deps.get_db),
    id: str,
    prompt_in: schemas.PromptUpdate
) -> Any:
    """
    Update an existing book without requiring login.
    """
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid ObjectId")

    existing = await crud.prompt.get(db=db, id=ObjectId(id))
    if not existing:
        raise HTTPException(status_code=404, detail="Book not found")

    updated = await crud.prompt.update(db=db, db_obj=existing, obj_in=prompt_in)

    all_prompts = await crud.prompt.get_multi(db)
    redis_client.set(
        "ragv_prompts",
        json.dumps([b.model_dump(mode="json") for b in all_prompts])
    )

    return updated

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
    

@router.get("/{id}", response_model=schemas.Prompt)
async def get_prompt(
    id: str,
    db: AgnosticDatabase = Depends(deps.get_db)
) -> Any:
    """
    Retrieve a single prompt by ID.
    """
    try:
        if not ObjectId.is_valid(id):
            raise HTTPException(status_code=400, detail="Invalid ObjectId format")

        result = await crud.prompt.get(db=db, id=ObjectId(id))

        if result is None:
            raise HTTPException(status_code=404, detail="Prompt not found")

        return result

    except Exception as error:
        print(error)
        raise HTTPException(status_code=500, detail="Internal server error")