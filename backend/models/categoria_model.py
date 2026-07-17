from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from core.database import Base


class Categoria(Base):
    __tablename__ = "categorias"

    id_categoria = Column(Integer, primary_key=True, index=True)
    descricao = Column(String(100), nullable=False, unique=True)
    produtos = relationship("Produto", back_populates="categoria")