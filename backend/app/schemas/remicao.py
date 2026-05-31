from pydantic import BaseModel, model_validator
from datetime import date, datetime
from typing import Optional


class RemicaoCreate(BaseModel):
    execucao_id: int
    tipo: str
    quantidade: int
    data_referencia: Optional[date] = None
    data_inicio: Optional[date] = None
    data_fim: Optional[date] = None
    observacao: Optional[str] = None

    @model_validator(mode='after')
    def validar_datas(self):
        if self.data_inicio and self.data_fim:
            if self.data_fim < self.data_inicio:
                raise ValueError('Data de fim deve ser posterior à data de início')
        if not self.data_referencia and not self.data_inicio:
            raise ValueError('Informe ao menos a data de início ou data de referência')
        return self


class RemicaoResponse(BaseModel):
    id: int
    execucao_id: int
    tipo: str
    quantidade: int
    dias_remidos: int
    data_referencia: Optional[date] = None
    data_inicio: Optional[date] = None
    data_fim: Optional[date] = None
    observacao: Optional[str] = None
    criado_em: datetime

    model_config = {"from_attributes": True}
