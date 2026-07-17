from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from core.database import Base

class Estoque(Base):
    __tablename__ = "estoque"

    id_estoque = Column(Integer, primary_key=True, autoincrement=True, index=True)
    quantidade_estoque = Column(Integer, nullable=False)
    id_produto = Column(Integer, ForeignKey("produtos.id_produto"), nullable=False, unique=True )

    produto = relationship("Produto", back_populates="estoque")