from sqlalchemy import Column, Integer, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from core.database import Base


class ItemPedido(Base):
    __tablename__ = "item_pedido"

    id_item_pedido = Column(Integer, primary_key=True, autoincrement=True, index=True)
    quantidade = Column(Integer,nullable=False)
    subtotal = Column(Numeric(10,2), nullable=False)
    id_produto = Column(Integer, ForeignKey("produtos.id_produto"), nullable=False)
    id_nota_fiscal = Column(Integer, ForeignKey("pedidos.id_nota_fiscal"), nullable=False)

    pedido = relationship("Pedido", back_populates="itens")
    produto = relationship("Produto", back_populates="itens_pedido")
