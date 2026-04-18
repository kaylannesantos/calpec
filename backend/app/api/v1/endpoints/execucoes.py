from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.execucao import Execucao
from app.schemas.execucao import ExecucaoCreate, ExecucaoResponse, ResultadoCalculo
from app.utils.calculos_lep import calcular_execucao
from typing import List

router = APIRouter()


@router.post("/calcular", response_model=ResultadoCalculo)
def calcular(dados: ExecucaoCreate):
    resultado = calcular_execucao(
        pena_anos=dados.pena_anos,
        pena_meses=dados.pena_meses,
        pena_dias=dados.pena_dias,
        natureza_crime=dados.natureza_crime.value,
        reincidente=dados.reincidente,
        data_inicio=dados.data_inicio_pena,
        detracao_inicio=dados.detracao_inicio,
        detracao_fim=dados.detracao_fim,
        dias_trabalhados=dados.dias_trabalhados,
        horas_estudo=dados.horas_estudo,
        obras_lidas=dados.obras_lidas,
    )
    return resultado


@router.post("/", response_model=ExecucaoResponse, status_code=201)
def registrar_execucao(dados: ExecucaoCreate, db: Session = Depends(get_db)):
    resultado = calcular_execucao(
        pena_anos=dados.pena_anos,
        pena_meses=dados.pena_meses,
        pena_dias=dados.pena_dias,
        natureza_crime=dados.natureza_crime.value,
        reincidente=dados.reincidente,
        data_inicio=dados.data_inicio_pena,
        detracao_inicio=dados.detracao_inicio,
        detracao_fim=dados.detracao_fim,
        dias_trabalhados=dados.dias_trabalhados,
        horas_estudo=dados.horas_estudo,
        obras_lidas=dados.obras_lidas,
    )
    execucao = Execucao(
        **dados.model_dump(),
        pena_total_dias=resultado["pena_total_dias"],
        dias_remidos=resultado["dias_remidos"],
        data_termino=resultado["data_termino"],
        data_progressao=resultado["data_progressao"],
        regime_progressao=resultado["regime_progressao"],
    )
    db.add(execucao)
    db.commit()
    db.refresh(execucao)
    return execucao


@router.get("/", response_model=List[ExecucaoResponse])
def listar_execucoes(db: Session = Depends(get_db)):
    return db.query(Execucao).all()
