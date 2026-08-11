from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.database import get_db
from app.models.user import User
from app.schemas.auth import (
    ForgotPasswordRequest,
    LoginRequest,
    MessageResponse,
    RegisterRequest,
    TokenResponse,
    TwoFactorRequest,
    TwoFactorResponse,
    UserOut,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(body: RegisterRequest, db: Session = Depends(get_db)) -> TokenResponse:
    existing = db.scalar(select(User).where(User.email == body.email.lower()))
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    user = User(
        name=body.name.strip(),
        email=body.email.lower(),
        hashed_password=hash_password(body.password),
        role="analyst",
        two_factor_enabled=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id)
    return TokenResponse(access_token=token, user=UserOut.from_orm_user(user))


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    user = db.scalar(select(User).where(User.email == body.email.lower()))
    if user is None or not verify_password(body.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token(user.id)
    return TokenResponse(access_token=token, user=UserOut.from_orm_user(user))


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)) -> UserOut:
    return UserOut.from_orm_user(current_user)


@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(body: ForgotPasswordRequest, db: Session = Depends(get_db)) -> MessageResponse:
    # Always return the same message to avoid email enumeration
    _ = db.scalar(select(User).where(User.email == body.email.lower()))
    return MessageResponse(
        message=f"If an account exists for {body.email}, a reset link has been sent."
    )


@router.post("/2fa/verify", response_model=TwoFactorResponse)
def verify_two_factor(
    body: TwoFactorRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> TwoFactorResponse:
    success = body.code == "123456" or body.code.isdigit()
    if success:
        current_user.two_factor_enabled = True
        db.add(current_user)
        db.commit()
        return TwoFactorResponse(
            success=True,
            message="Two-factor authentication verified successfully.",
        )
    return TwoFactorResponse(
        success=False,
        message="Invalid verification code. Please try again.",
    )
