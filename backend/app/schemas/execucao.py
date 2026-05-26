from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional
from app.models.execucao import NaturezaCrime


class ExecucaoCreate(BaseModel):
    apenado_id: int
    pena_anos: int = 0
    pena_meses: int = 0
    pena_dias: int = 0
    natureza_crime: NaturezaCrime
    reincidente: bool = False
    data_inicio_pena: date
    detracao_inicio: Optional[date] = None
    detracao_fim: Optional[date] = None
    unificacao_inicio: Optional[date] = None
    unificacao_fim: Optional[date] = None
    dias_trabalhados: int = 0
    horas_estudo: int = 0
    obras_lidas: int = 0


class ExecucaoResponse(BaseModel):
    id: int
    apenado_id: int
    pena_anos: int
    pena_meses: int
    pena_dias: int
    natureza_crime: NaturezaCrime
    reincidente: bool
    data_inicio_pena: date
    pena_total_dias: Optional[int]
    dias_remidos: Optional[int]
    data_termino: Optional[date]
    data_progressao: Optional[date]
    regime_inicial: Optional[str]
    regime_progressao: Optional[str]
    criado_em: datetime

    model_config = {"from_attributes": True}


class ResultadoCalculo(BaseModel):
    pena_total_dias: int
    dias_detracao: int
    pena_base_dias: int
    dias_remidos: int
    pena_efetiva_dias: int
    regime_inicial: str
    percentual_progressao: float
    dias_para_progressao: int
    data_progressao: date
    regime_progressao: str
    data_termino: date
    pena_extenso: dict
    progressao_extenso: dict
