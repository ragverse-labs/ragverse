import json
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Query
from motor.core import AgnosticDatabase
from app import  schemas
from app.api import deps
from app.engine.model_data import ModelData

router = APIRouter()
model_data = ModelData()

def parse_json_string(json_string: str):
    try:
        return json.loads(json_string)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON format")

@router.get("/languages", response_model=List[schemas.Language])
async def get_languages(
    *,
    db: AgnosticDatabase = Depends(deps.get_db),
    page: int = 0,
    filter: str = Query("{}"), range: str = Query("[0,9]"), sort: str = Query('["id","ASC"]')
) -> Any:
    try:
        results = model_data.get_languages()
        total = 10
        return results
    
    except Exception as error:
        print(error)
        raise HTTPException(status_code=404, detail="Language not found")
    

#  