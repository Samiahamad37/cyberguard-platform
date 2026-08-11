from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    email: EmailStr
    role: Literal["admin", "analyst", "viewer"]
    twoFactorEnabled: bool
    createdAt: datetime

    @classmethod
    def from_orm_user(cls, user) -> "UserOut":
        return cls(
            id=user.id,
            name=user.name,
            email=user.email,
            role=user.role,
            twoFactorEnabled=user.two_factor_enabled,
            createdAt=user.created_at,
        )


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class MessageResponse(BaseModel):
    message: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class TwoFactorRequest(BaseModel):
    code: str = Field(min_length=6, max_length=6)


class TwoFactorResponse(BaseModel):
    success: bool
    message: str
