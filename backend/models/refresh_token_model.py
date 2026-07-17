from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from core.database import Base


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id_refresh_token = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    token_jti = Column(String(120), nullable=False, unique=True, index=True)
    expira_em = Column(DateTime, nullable=False)
    revogado = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    usuario = relationship("Usuario", back_populates="refresh_tokens")
