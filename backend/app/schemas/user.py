from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class UserCreate(BaseModel):
    nome: str
    email: EmailStr
    cpf: Optional[str] = None
    numero_oab: Optional[str] = None
    telefone: Optional[str] = None
    password: str


class UserResponse(BaseModel):
    id: int
    nome: str
    email: str
    cpf: Optional[str] = None
    numero_oab: Optional[str] = None
    is_active: bool
    criado_em: datetime

    model_config = {"from_attributes": True}


class LoginRequest(BaseModel):
    login: str  # email ou CPF
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
