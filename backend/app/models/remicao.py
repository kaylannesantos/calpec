from sqlalchemy import Column, Integer, String, Date, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class Remicao(Base):
    __tablename__ = "remicoes"

    id = Column(Integer, primary_key=True, index=True)
    execucao_id = Column(Integer, ForeignKey("execucoes.id"), nullable=False)
    tipo = Column(String, nullable=False)
    quantidade = Column(Integer, nullable=False)
    dias_remidos = Column(Integer, nullable=False)
    data_referencia = Column(Date, nullable=True)
    data_inicio = Column(Date, nullable=True)
    data_fim = Column(Date, nullable=True)
    observacao = Column(String, nullable=True)
    criado_em = Column(DateTime(timezone=True), server_default=func.now())

    execucao = relationship("Execucao", back_populates="remicoes")
