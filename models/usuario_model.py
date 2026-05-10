from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Integer, String
from sqlalchemy.orm import relationship

from core.database import Base


class Usuario(Base):
    __tablename__ = "usuarios"

    id_usuario = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    login = Column(String(50), nullable=False, unique=True, index=True)
    senha_hash = Column(String(255), nullable=False)
    perfil = Column(String(30), nullable=False, default="atendente")
    ativo = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    refresh_tokens = relationship("RefreshToken", back_populates="usuario")
