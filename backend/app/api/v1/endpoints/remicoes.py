from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import timedelta
from app.db.database import get_db
from app.models.remicao import Remicao
from app.models.execucao import Execucao
from app.schemas.remicao import RemicaoCreate, RemicaoResponse
from app.utils.calculos_lep import (
    calcular_percentual_progressao,
    determinar_regime_progressao,
    pena_para_dias,
    calcular_detracao,
)

router = APIRouter()


def calcular_dias_remidos(tipo: str, quantidade: int) -> int:
    if tipo == "trabalho":
        return quantidade // 3
    elif tipo == "estudo":
        return quantidade // 12
    elif tipo == "leitura":
        return quantidade * 4
    return 0


def calcular_remicao_inicial(execucao: Execucao) -> int:
    """Calcula os dias remidos da remição inicial da execução."""
    dias = 0
    dias += (execucao.dias_trabalhados or 0) // 3
    dias += (execucao.horas_estudo or 0) // 12
    dias += (execucao.obras_lidas or 0) * 4
    return dias


@router.post("/", response_model=RemicaoResponse, status_code=201)
def registrar_remicao(dados: RemicaoCreate, db: Session = Depends(get_db)):
    execucao = db.query(Execucao).filter(Execucao.id == dados.execucao_id).first()
    if not execucao:
        raise HTTPException(status_code=404, detail="Execução não encontrada")

    dias = calcular_dias_remidos(dados.tipo, dados.quantidade)

    # Soma remições da tabela + remição inicial da execução
    total_tabela = db.query(func.sum(Remicao.dias_remidos)).filter(
        Remicao.execucao_id == dados.execucao_id
    ).scalar() or 0

    remicao_inicial = calcular_remicao_inicial(execucao)
    total_dias_remidos = total_tabela + dias + remicao_inicial

    remicao = Remicao(
        execucao_id=dados.execucao_id,
        tipo=dados.tipo,
        quantidade=dados.quantidade,
        dias_remidos=dias,
        data_referencia=dados.data_referencia,
        data_inicio=dados.data_inicio,
        data_fim=dados.data_fim,
        observacao=dados.observacao,
    )
    db.add(remicao)

    pena_total = pena_para_dias(execucao.pena_anos, execucao.pena_meses, execucao.pena_dias)
    dias_detracao = calcular_detracao(execucao.detracao_inicio, execucao.detracao_fim)
    pena_base = pena_total - dias_detracao
    pena_efetiva = pena_base - total_dias_remidos

    percentual = calcular_percentual_progressao(
        execucao.natureza_crime.value, execucao.reincidente
    )
    lapso = int(pena_base * percentual)
    dias_para_progressao = lapso - total_dias_remidos
    nova_data_progressao = execucao.data_inicio_pena + timedelta(days=dias_para_progressao)
    nova_data_termino = execucao.data_inicio_pena + timedelta(days=pena_efetiva)
    regime_progressao = determinar_regime_progressao(execucao.regime_inicial or 'Fechado')

    execucao.dias_remidos = total_dias_remidos
    execucao.data_termino = nova_data_termino
    execucao.data_progressao = nova_data_progressao
    execucao.regime_progressao = regime_progressao
    execucao.pena_total_dias = pena_base

    db.commit()
    db.refresh(remicao)
    return remicao


@router.get("/execucao/{execucao_id}", response_model=List[RemicaoResponse])
def listar_remicoes(execucao_id: int, db: Session = Depends(get_db)):
    return db.query(Remicao).filter(
        Remicao.execucao_id == execucao_id
    ).order_by(Remicao.data_referencia.desc(), Remicao.data_inicio.desc()).all()
