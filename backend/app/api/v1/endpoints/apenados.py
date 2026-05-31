from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.apenado import Apenado
from app.schemas.apenado import ApenadoCreate, ApenadoResponse

router = APIRouter()


@router.post("/", response_model=ApenadoResponse, status_code=201)
def registrar_apenado(dados: ApenadoCreate, db: Session = Depends(get_db)):
    existente = db.query(Apenado).filter(
        Apenado.numero_execucao == dados.numero_execucao
    ).first()
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


@router.get("/{apenado_id}", response_model=ApenadoResponse)
def buscar_apenado(apenado_id: int, db: Session = Depends(get_db)):
    apenado = db.query(Apenado).filter(Apenado.id == apenado_id).first()
    if not apenado:
        raise HTTPException(status_code=404, detail="Apenado não encontrado")
    return apenado


@router.put("/{apenado_id}", response_model=ApenadoResponse)
def atualizar_apenado(apenado_id: int, dados: ApenadoCreate, db: Session = Depends(get_db)):
    apenado = db.query(Apenado).filter(Apenado.id == apenado_id).first()
    if not apenado:
        raise HTTPException(status_code=404, detail="Apenado não encontrado")

    # Verificar se o número de execução já existe em outro apenado
    existente = db.query(Apenado).filter(
        Apenado.numero_execucao == dados.numero_execucao,
        Apenado.id != apenado_id
    ).first()
    if existente:
        raise HTTPException(status_code=400, detail="Número de execução já cadastrado para outro apenado")

    apenado.nome = dados.nome
    apenado.numero_execucao = dados.numero_execucao
    apenado.data_nascimento = dados.data_nascimento

    db.commit()
    db.refresh(apenado)
    return apenado
