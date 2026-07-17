from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from core.database import Base


class FornecedorProduto(Base):
    __tablename__ = "fornecedor_produto"

    id_fornecedor = Column(Integer, ForeignKey("fornecedores.id_fornecedor"),primary_key=True)
    id_produto = Column(Integer, ForeignKey("produtos.id_produto"), primary_key=True)

    fornecedor = relationship("Fornecedor",back_populates="fornecedor_produtos")

    produto = relationship("Produto",back_populates="fornecedor_produtos")