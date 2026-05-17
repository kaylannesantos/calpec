from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import timedelta
from app.db.database import get_db
from app.models.remicao import Remicao
from app.models.execucao import Execucao
from app.schemas.remicao import RemicaoCreate, RemicaoResponse
from app.utils.calculos_lep import calcular_execucao

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

    # 2. Salvar a remição
    remicao = Remicao(
        execucao_id=dados.execucao_id,
        tipo=dados.tipo,
        quantidade=dados.quantidade,
        dias_remidos=dias,
        data_referencia=dados.data_referencia,
        observacao=dados.observacao,
    )
    db.add(remicao)
    db.flush()

    # 3. Somar todas as remições da execução para ter o total atualizado
    from app.models.remicao import Remicao as RemicaoModel
    total_remido = db.query(RemicaoModel).filter(
        RemicaoModel.execucao_id == dados.execucao_id
    ).with_entities(RemicaoModel.dias_remidos).all()
    total_dias_remidos = sum(r.dias_remidos for r in total_remido)

    # 4. Recalcular execução completa com novo total de remição
    resultado = calcular_execucao(
        pena_anos=execucao.pena_anos,
        pena_meses=execucao.pena_meses,
        pena_dias=execucao.pena_dias,
        natureza_crime=execucao.natureza_crime.value,
        reincidente=execucao.reincidente,
        data_inicio=execucao.data_inicio_pena,
        detracao_inicio=execucao.detracao_inicio,
        detracao_fim=execucao.detracao_fim,
        dias_trabalhados=0,
        horas_estudo=0,
        obras_lidas=0,
    )

    # Calcular nova data de término considerando total de remições
    nova_pena_efetiva = resultado["pena_base_dias"] - total_dias_remidos
    nova_data_termino = execucao.data_inicio_pena + timedelta(days=nova_pena_efetiva)

    # 5. Atualizar execução no banco
    execucao.dias_remidos = total_dias_remidos
    execucao.data_termino = nova_data_termino
    execucao.data_progressao = resultado["data_progressao"]
    execucao.regime_progressao = resultado["regime_progressao"]
    execucao.pena_total_dias = resultado["pena_base_dias"]

    db.commit()
    db.refresh(remicao)
    return remicao


@router.get("/execucao/{execucao_id}", response_model=List[RemicaoResponse])
def listar_remicoes(execucao_id: int, db: Session = Depends(get_db)):
    return db.query(Remicao).filter(
        Remicao.execucao_id == execucao_id
    ).order_by(Remicao.data_referencia.desc()).all()
