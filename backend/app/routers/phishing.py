from fastapi import APIRouter, Depends

from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.security import (
    PhishingAnalysisResult,
    PhishingEmailRequest,
    PhishingUrlRequest,
)
from app.services import phishing as phishing_service

router = APIRouter(prefix="/phishing", tags=["phishing"])


@router.post("/analyze", response_model=PhishingAnalysisResult)
def analyze_email(
    body: PhishingEmailRequest,
    _: User = Depends(get_current_user),
) -> PhishingAnalysisResult:
    return phishing_service.analyze_email(body.content)


@router.post("/analyze-url", response_model=PhishingAnalysisResult)
def analyze_url(
    body: PhishingUrlRequest,
    _: User = Depends(get_current_user),
) -> PhishingAnalysisResult:
    return phishing_service.analyze_url(body.url)
