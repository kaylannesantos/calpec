from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
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
