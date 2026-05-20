from sqlalchemy import Column, Integer, ForeignKey, DateTime, func, Numeric, String
from sqlalchemy.orm import relationship
from core.database import Base


class Pedido(Base):
    __tablename__ = "pedidos"

    id_nota_fiscal = Column(Integer, primary_key=True)
    id_funcionario = Column(Integer, ForeignKey("funcionarios.id_funcionario"), nullable=False)
    data_hora = Column(DateTime, server_default=func.now(), nullable=False)
    valor_total = Column(Numeric(10,2), nullable=False)
    status = Column(String(20), default="pendente", nullable=False)

    funcionario = relationship("Funcionario", back_populates="pedidos")
    itens = relationship("ItemPedido", back_populates="pedido")
