from fastapi import APIRouter

from app.api.api_v1.endpoints import (
    login,
    users,
    proxy,
    chat,
    books,
    languages,
    prompts,
    testPrompts
)



api_router = APIRouter()
api_router.include_router(login.router, prefix="/login", tags=["login"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(proxy.router, prefix="/proxy", tags=["proxy"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(books.router, prefix="/books", tags=["books"])
api_router.include_router(prompts.router, prefix="/prompts", tags=["prompts"])
api_router.include_router(languages.router, prefix="/languages", tags=["languages"])
api_router.include_router(testPrompts.router, prefix="/testPrompts", tags=["testPrompts"])