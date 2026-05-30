from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import date
from app.db.database import get_db
from app.models.execucao import Execucao
from app.models.remicao import Remicao
from app.schemas.execucao import ExecucaoCreate, ExecucaoResponse, ResultadoCalculo
from app.utils.calculos_lep import (
    calcular_execucao, calcular_percentual_progressao,
    determinar_regime_progressao, pena_para_dias, calcular_detracao
)
from datetime import timedelta

router = APIRouter()

ORDEM_REGIMES = ['Fechado', 'Semiaberto', 'Aberto', 'Livramento Condicional', 'Pena Extinta']


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


@router.post("/{execucao_id}/progredir", response_model=ExecucaoResponse)
def registrar_progressao(execucao_id: int, db: Session = Depends(get_db)):
    execucao = db.query(Execucao).filter(Execucao.id == execucao_id).first()
    if not execucao:
        raise HTTPException(status_code=404, detail="Execução não encontrada")

    # Verificar se a data de progressão já passou
    if execucao.data_progressao and execucao.data_progressao > date.today():
        raise HTTPException(status_code=400, detail="Data de progressão ainda não chegou")

    # Determinar próximo regime
    regime_atual = execucao.regime_inicial or 'Fechado'
    if regime_atual not in ORDEM_REGIMES:
        regime_atual = 'Fechado'

    idx_atual = ORDEM_REGIMES.index(regime_atual)
    if idx_atual >= len(ORDEM_REGIMES) - 1:
        raise HTTPException(status_code=400, detail="Pena já extinta")

    novo_regime = ORDEM_REGIMES[idx_atual + 1]
    proximo_regime = ORDEM_REGIMES[idx_atual + 2] if idx_atual + 2 < len(ORDEM_REGIMES) else 'Pena Extinta'

    # Recalcular próxima data de progressão a partir da data atual
    total_remido = db.query(func.sum(Remicao.dias_remidos)).filter(
        Remicao.execucao_id == execucao_id
    ).scalar() or 0

    pena_total = pena_para_dias(execucao.pena_anos, execucao.pena_meses, execucao.pena_dias)
    dias_detracao = calcular_detracao(execucao.detracao_inicio, execucao.detracao_fim)
    pena_base = pena_total - dias_detracao
    pena_efetiva = pena_base - total_remido

    percentual = calcular_percentual_progressao(
        execucao.natureza_crime.value, execucao.reincidente
    )
    lapso_progressao = int(pena_efetiva * percentual)
    nova_data_progressao = date.today() + timedelta(days=lapso_progressao)

    # Atualizar regime
    execucao.regime_inicial = novo_regime
    execucao.regime_progressao = proximo_regime
    execucao.data_progressao = nova_data_progressao

    db.commit()
    db.refresh(execucao)
    return execucao
