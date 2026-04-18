from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional


class ApenadoCreate(BaseModel):
    nome: str
    numero_execucao: str
    data_nascimento: date


class ApenadoResponse(BaseModel):
    id: int
    nome: str
    numero_execucao: str
    data_nascimento: date
    criado_em: datetime

    model_config = {"from_attributes": True}
