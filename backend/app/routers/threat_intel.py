from fastapi import APIRouter, Depends

from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.security import ThreatIntelResponse
from app.services import threat_intel as threat_intel_service

router = APIRouter(prefix="/threat-intel", tags=["threat-intel"])


@router.get("", response_model=ThreatIntelResponse)
def get_threat_intel(_: User = Depends(get_current_user)) -> ThreatIntelResponse:
    return threat_intel_service.get_threat_intelligence()
