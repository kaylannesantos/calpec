from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional


class RemicaoCreate(BaseModel):
    execucao_id: int
    tipo: str  # trabalho | estudo | leitura
    quantidade: int
    data_referencia: date
    observacao: Optional[str] = None


class RemicaoResponse(BaseModel):
    id: int
    execucao_id: int
    tipo: str
    quantidade: int
    dias_remidos: int
    data_referencia: date
    observacao: Optional[str]
    criado_em: datetime

    model_config = {"from_attributes": True}
