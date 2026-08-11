from fastapi import APIRouter, Depends

from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.security import WebsiteScanRequest, WebsiteScanResult
from app.services import website as website_service

router = APIRouter(prefix="/website", tags=["website"])


@router.post("/scan", response_model=WebsiteScanResult)
def scan_website(
    body: WebsiteScanRequest,
    _: User = Depends(get_current_user),
) -> WebsiteScanResult:
    return website_service.scan_website(body.url)
