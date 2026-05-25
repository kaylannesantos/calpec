from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel, EmailStr
from app.db.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, LoginRequest, TokenResponse
from app.core.security import hash_password, verify_password, create_access_token

router = APIRouter()


@router.post("/registrar", response_model=UserResponse, status_code=201)
def registrar(dados: UserCreate, db: Session = Depends(get_db)):
    existente = db.query(User).filter(User.email == dados.email).first()
    if existente:
        raise HTTPException(status_code=400, detail="E-mail já cadastrado")
    user = User(
        nome=dados.nome,
        email=dados.email,
        cpf=dados.cpf,
        numero_oab=dados.numero_oab,
        telefone=dados.telefone,
        hashed_password=hash_password(dados.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=TokenResponse)
def login(dados: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        (User.email == dados.login) | (User.cpf == dados.login)
    ).first()
    if not user or not verify_password(dados.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "user": user}


@router.get("/perfil/{user_id}", response_model=UserResponse)
def buscar_perfil(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return user


class PerfilUpdate(BaseModel):
    nome: Optional[str] = None
    telefone: Optional[str] = None
    senha_atual: Optional[str] = None
    nova_senha: Optional[str] = None


@router.put("/perfil/{user_id}", response_model=UserResponse)
def atualizar_perfil(user_id: int, dados: PerfilUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    if dados.nome:
        user.nome = dados.nome
    if dados.telefone:
        user.telefone = dados.telefone

    if dados.nova_senha:
        if not dados.senha_atual:
            raise HTTPException(status_code=400, detail="Informe a senha atual para alterá-la")
        if not verify_password(dados.senha_atual, user.hashed_password):
            raise HTTPException(status_code=400, detail="Senha atual incorreta")
        user.hashed_password = hash_password(dados.nova_senha)

    db.commit()
    db.refresh(user)
    return user
