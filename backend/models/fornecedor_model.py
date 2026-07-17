from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from core.database import Base

class Fornecedor(Base):
    __tablename__ = "fornecedores"

    id_fornecedor = Column(Integer, primary_key=True, index=True )
    nome = Column(String(100), nullable=False, unique=True)
    telefone = Column(String(20), nullable=False)
    cnpj = Column(String(18), nullable=False, unique=True)

    fornecedor_produtos = relationship("FornecedorProduto", back_populates="fornecedor", cascade="all, delete-orphan")
