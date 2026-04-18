from sqlalchemy import Column, Integer, String, Date, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class Apenado(Base):
    __tablename__ = "apenados"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    numero_execucao = Column(String, unique=True, index=True, nullable=False)
    data_nascimento = Column(Date, nullable=False)
    criado_por = Column(Integer, ForeignKey("users.id"), nullable=True)
    criado_em = Column(DateTime(timezone=True), server_default=func.now())

    execucoes = relationship("Execucao", back_populates="apenado")
