from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.remicao import Remicao
from app.models.execucao import Execucao
from app.schemas.remicao import RemicaoCreate, RemicaoResponse

router = APIRouter()


def calcular_dias_remidos(tipo: str, quantidade: int) -> int:
    if tipo == "trabalho":
        return quantidade // 3
    elif tipo == "estudo":
        return quantidade // 12
    elif tipo == "leitura":
        return quantidade * 4
    return 0


@router.post("/", response_model=RemicaoResponse, status_code=201)
def registrar_remicao(dados: RemicaoCreate, db: Session = Depends(get_db)):
    execucao = db.query(Execucao).filter(Execucao.id == dados.execucao_id).first()
    if not execucao:
        raise HTTPException(status_code=404, detail="Execução não encontrada")

    dias = calcular_dias_remidos(dados.tipo, dados.quantidade)

    remicao = Remicao(
        execucao_id=dados.execucao_id,
        tipo=dados.tipo,
        quantidade=dados.quantidade,
        dias_remidos=dias,
        data_referencia=dados.data_referencia,
        observacao=dados.observacao,
    )
    db.add(remicao)

    # Atualiza total de dias remidos na execução
    execucao.dias_remidos = (execucao.dias_remidos or 0) + dias
    db.commit()
    db.refresh(remicao)
    return remicao


@router.get("/execucao/{execucao_id}", response_model=List[RemicaoResponse])
def listar_remicoes(execucao_id: int, db: Session = Depends(get_db)):
    return db.query(Remicao).filter(Remicao.execucao_id == execucao_id).order_by(Remicao.data_referencia.desc()).all()
