from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.execucao import Execucao
from app.schemas.execucao import ExecucaoCreate, ExecucaoResponse, ResultadoCalculo
from app.utils.calculos_lep import calcular_execucao

router = APIRouter()


@router.post("/calcular", response_model=ResultadoCalculo)
def calcular(dados: ExecucaoCreate):
    resultado = calcular_execucao(
        pena_anos=dados.pena_anos, pena_meses=dados.pena_meses, pena_dias=dados.pena_dias,
        natureza_crime=dados.natureza_crime.value, reincidente=dados.reincidente,
        data_inicio=dados.data_inicio_pena, detracao_inicio=dados.detracao_inicio,
        detracao_fim=dados.detracao_fim, dias_trabalhados=dados.dias_trabalhados,
        horas_estudo=dados.horas_estudo, obras_lidas=dados.obras_lidas,
    )
    return resultado


@router.post("/", response_model=ExecucaoResponse, status_code=201)
def registrar_execucao(dados: ExecucaoCreate, db: Session = Depends(get_db)):
    resultado = calcular_execucao(
        pena_anos=dados.pena_anos, pena_meses=dados.pena_meses, pena_dias=dados.pena_dias,
        natureza_crime=dados.natureza_crime.value, reincidente=dados.reincidente,
        data_inicio=dados.data_inicio_pena, detracao_inicio=dados.detracao_inicio,
        detracao_fim=dados.detracao_fim, dias_trabalhados=dados.dias_trabalhados,
        horas_estudo=dados.horas_estudo, obras_lidas=dados.obras_lidas,
    )
    execucao = Execucao(
        **dados.model_dump(),
        pena_total_dias=resultado["pena_total_dias"],
        dias_remidos=resultado["dias_remidos"],
        data_termino=resultado["data_termino"],
        data_progressao=resultado["data_progressao"],
        regime_inicial=resultado["regime_inicial"],
        regime_progressao=resultado["regime_progressao"],
    )
    db.add(execucao)
    db.commit()
    db.refresh(execucao)
    return execucao


@router.get("/", response_model=List[ExecucaoResponse])
def listar_execucoes(db: Session = Depends(get_db)):
    return db.query(Execucao).all()


@router.get("/{execucao_id}", response_model=ExecucaoResponse)
def buscar_execucao(execucao_id: int, db: Session = Depends(get_db)):
    execucao = db.query(Execucao).filter(Execucao.id == execucao_id).first()
    if not execucao:
        raise HTTPException(status_code=404, detail="Execução não encontrada")
    return execucao


@router.put("/{execucao_id}", response_model=ExecucaoResponse)
def atualizar_execucao(execucao_id: int, dados: ExecucaoCreate, db: Session = Depends(get_db)):
    execucao = db.query(Execucao).filter(Execucao.id == execucao_id).first()
    if not execucao:
        raise HTTPException(status_code=404, detail="Execução não encontrada")

    resultado = calcular_execucao(
        pena_anos=dados.pena_anos, pena_meses=dados.pena_meses, pena_dias=dados.pena_dias,
        natureza_crime=dados.natureza_crime.value, reincidente=dados.reincidente,
        data_inicio=dados.data_inicio_pena, detracao_inicio=dados.detracao_inicio,
        detracao_fim=dados.detracao_fim, dias_trabalhados=dados.dias_trabalhados,
        horas_estudo=dados.horas_estudo, obras_lidas=dados.obras_lidas,
    )

    for field, value in dados.model_dump().items():
        setattr(execucao, field, value)

    execucao.pena_total_dias = resultado["pena_total_dias"]
    execucao.dias_remidos = resultado["dias_remidos"]
    execucao.data_termino = resultado["data_termino"]
    execucao.data_progressao = resultado["data_progressao"]
    execucao.regime_inicial = resultado["regime_inicial"]
    execucao.regime_progressao = resultado["regime_progressao"]

    db.commit()
    db.refresh(execucao)
    return execucao
