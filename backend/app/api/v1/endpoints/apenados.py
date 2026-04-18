from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.apenado import Apenado
from app.schemas.apenado import ApenadoCreate, ApenadoResponse
from typing import List

router = APIRouter()


@router.post("/", response_model=ApenadoResponse, status_code=201)
def criar_apenado(dados: ApenadoCreate, db: Session = Depends(get_db)):
    existente = db.query(Apenado).filter(Apenado.numero_execucao == dados.numero_execucao).first()
    if existente:
        raise HTTPException(status_code=400, detail="Número de execução já cadastrado")
    apenado = Apenado(**dados.model_dump())
    db.add(apenado)
    db.commit()
    db.refresh(apenado)
    return apenado


@router.get("/", response_model=List[ApenadoResponse])
def listar_apenados(db: Session = Depends(get_db)):
    return db.query(Apenado).all()


@router.get("/{id}", response_model=ApenadoResponse)
def buscar_apenado(id: int, db: Session = Depends(get_db)):
    apenado = db.query(Apenado).filter(Apenado.id == id).first()
    if not apenado:
        raise HTTPException(status_code=404, detail="Apenado não encontrado")
    return apenado
