from fastapi import APIRouter, Depends

from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.security import ChatMessage, ChatRequest
from app.services import assistant as assistant_service

router = APIRouter(prefix="/assistant", tags=["assistant"])


@router.post("/chat", response_model=ChatMessage)
def chat(
    body: ChatRequest,
    _: User = Depends(get_current_user),
) -> ChatMessage:
    return assistant_service.reply(body.content, body.history)
