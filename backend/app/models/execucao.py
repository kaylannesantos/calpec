from sqlalchemy import Column, Integer, String, Date, Boolean, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.db.database import Base


class NaturezaCrime(str, enum.Enum):
    comum = "comum"
    violento = "violento"
    hediondo = "hediondo"
    hediondo_morte = "hediondo_morte"
    feminicidio = "feminicidio"
    milicia = "milicia"
    org_criminosa = "org_criminosa"


class Execucao(Base):
    __tablename__ = "execucoes"

    id = Column(Integer, primary_key=True, index=True)
    apenado_id = Column(Integer, ForeignKey("apenados.id"), nullable=False)
    criado_por = Column(Integer, ForeignKey("users.id"), nullable=True)

    pena_anos = Column(Integer, default=0)
    pena_meses = Column(Integer, default=0)
    pena_dias = Column(Integer, default=0)
    natureza_crime = Column(Enum(NaturezaCrime), nullable=False)
    reincidente = Column(Boolean, default=False)
    data_inicio_pena = Column(Date, nullable=False)

    detracao_inicio = Column(Date, nullable=True)
    detracao_fim = Column(Date, nullable=True)
    unificacao_inicio = Column(Date, nullable=True)
    unificacao_fim = Column(Date, nullable=True)

    dias_trabalhados = Column(Integer, default=0)
    horas_estudo = Column(Integer, default=0)
    obras_lidas = Column(Integer, default=0)

    pena_total_dias = Column(Integer, nullable=True)
    dias_remidos = Column(Integer, nullable=True)
    data_termino = Column(Date, nullable=True)
    data_progressao = Column(Date, nullable=True)
    regime_inicial = Column(String, nullable=True)
    regime_progressao = Column(String, nullable=True)

    criado_em = Column(DateTime(timezone=True), server_default=func.now())

    apenado = relationship("Apenado", back_populates="execucoes")
    remicoes = relationship("Remicao", back_populates="execucao", order_by="Remicao.data_referencia")
