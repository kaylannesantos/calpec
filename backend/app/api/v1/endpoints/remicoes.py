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


@router.post("/", response_model=RemicaoResponse, status_code=201)
def registrar_remicao(dados: RemicaoCreate, db: Session = Depends(get_db)):
    execucao = db.query(Execucao).filter(Execucao.id == dados.execucao_id).first()
    if not execucao:
        raise HTTPException(status_code=404, detail="Execução não encontrada")

    # 1. Calcular dias remidos desta remição
    dias = calcular_dias_remidos(dados.tipo, dados.quantidade)

    # 2. Somar remições ANTERIORES (antes de salvar a nova)
    total_anterior = db.query(func.sum(Remicao.dias_remidos)).filter(
        Remicao.execucao_id == dados.execucao_id
    ).scalar() or 0

    total_dias_remidos = total_anterior + dias

    # 3. Salvar a remição
    remicao = Remicao(
        execucao_id=dados.execucao_id,
        tipo=dados.tipo,
        quantidade=dados.quantidade,
        dias_remidos=dias,
        data_referencia=dados.data_referencia,
        observacao=dados.observacao,
    )
    db.add(remicao)

    # 4. Recalcular pena base (com detração)
    pena_total = pena_para_dias(execucao.pena_anos, execucao.pena_meses, execucao.pena_dias)
    dias_detracao = calcular_detracao(execucao.detracao_inicio, execucao.detracao_fim)
    pena_base = pena_total - dias_detracao

    # 5. Pena efetiva após remições
    pena_efetiva = pena_base - total_dias_remidos

    # 6. Recalcular data de progressão (lapso sobre pena_base menos dias remidos)
    percentual = calcular_percentual_progressao(
        execucao.natureza_crime.value,
        execucao.reincidente
    )
    lapso = int(pena_base * percentual)
    dias_para_progressao = lapso - total_dias_remidos
    nova_data_progressao = execucao.data_inicio_pena + timedelta(days=dias_para_progressao)

    # 7. Recalcular data de término
    nova_data_termino = execucao.data_inicio_pena + timedelta(days=pena_efetiva)

    # 8. Regime de progressão
    regime_progressao = determinar_regime_progressao(execucao.regime_inicial or 'Fechado')

    # 9. Atualizar execução
    execucao.dias_remidos = total_dias_remidos
    execucao.data_termino = nova_data_termino
    execucao.data_progressao = nova_data_progressao
    execucao.regime_progressao = regime_progressao
    execucao.pena_total_dias = pena_base

    print(f"[REMICAO] execucao_id={dados.execucao_id} | total_remido={total_dias_remidos} | lapso={lapso} | dias_progressao={dias_para_progressao} | nova_progressao={nova_data_progressao}")

    db.commit()
    db.refresh(remicao)
    return remicao


@router.get("/execucao/{execucao_id}", response_model=List[RemicaoResponse])
def listar_remicoes(execucao_id: int, db: Session = Depends(get_db)):
    return db.query(Remicao).filter(
        Remicao.execucao_id == execucao_id
    ).order_by(Remicao.data_referencia.desc()).all()
