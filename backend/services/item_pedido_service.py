from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from models.item_pedido_model import ItemPedido
from repositories.estoque_repository import EstoqueRepository
from repositories.item_pedido_repository import ItemPedidoRepository
from repositories.pedido_repository import PedidoRepository
from repositories.produto_repository import ProdutoRepository
from schemas.item_pedido_schema import ItemPedidoCreate, ItemPedidoUpdate


class ItemPedidoService:
    def __init__(self, db: Session, id_cantina: int):
        self.db = db
        self.repository = ItemPedidoRepository(db, id_cantina)
        self.produto_repository = ProdutoRepository(db, id_cantina)
        self.pedido_repository = PedidoRepository(db, id_cantina)
        self.estoque_repository = EstoqueRepository(db, id_cantina)

    def listar(self):
        return self.repository.listar()

    def buscar_por_id(self, id_item_pedido: int):
        item = self.repository.buscar_por_id(id_item_pedido)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Item de pedido nao encontrado"
            )

        return item

    def _buscar_estoque_ou_404(self, id_produto: int):
        estoque = self.estoque_repository.buscar_por_produto(id_produto)
        if not estoque:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Estoque do produto nao encontrado"
            )
        return estoque

    def _validar_saldo(self, quantidade_disponivel: int, quantidade_necessaria: int):
        if quantidade_disponivel < quantidade_necessaria:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Estoque insuficiente para este item"
            )

    def _recalcular_total_pedido(self, id_nota_fiscal: int):
        pedido = self.pedido_repository.buscar_por_id(id_nota_fiscal)
        if not pedido:
            return

        itens = self.repository.buscar_por_pedido(id_nota_fiscal)
        total = sum((Decimal(item.subtotal) for item in itens), Decimal("0"))
        pedido.valor_total = total

    def criar(self, item_pedido: ItemPedidoCreate):
        produto = self.produto_repository.buscar_por_id(item_pedido.id_produto)
        if not produto:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Produto nao encontrado"
            )

        pedido = self.pedido_repository.buscar_por_id(item_pedido.id_nota_fiscal)
        if not pedido:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pedido nao encontrado"
            )

        estoque = self._buscar_estoque_ou_404(item_pedido.id_produto)
        self._validar_saldo(estoque.quantidade_estoque, item_pedido.quantidade)

        try:
            estoque.quantidade_estoque -= item_pedido.quantidade

            novo_item = ItemPedido(
                quantidade=item_pedido.quantidade,
                subtotal=item_pedido.subtotal,
                id_produto=item_pedido.id_produto,
                id_nota_fiscal=item_pedido.id_nota_fiscal,
            )
            self.db.add(novo_item)

            self.db.flush()
            self._recalcular_total_pedido(item_pedido.id_nota_fiscal)
            self.db.commit()
            self.db.refresh(novo_item)

            return novo_item
        except Exception:
            self.db.rollback()
            raise

    def atualizar(self, id_item_pedido: int, item_pedido: ItemPedidoUpdate):
        item_existente = self.repository.buscar_por_id(id_item_pedido)
        if not item_existente:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Item de pedido nao encontrado"
            )

        produto_novo = self.produto_repository.buscar_por_id(item_pedido.id_produto)
        if not produto_novo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Produto nao encontrado"
            )

        pedido_novo = self.pedido_repository.buscar_por_id(item_pedido.id_nota_fiscal)
        if not pedido_novo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pedido nao encontrado"
            )

        id_produto_antigo = item_existente.id_produto
        quantidade_antiga = item_existente.quantidade
        id_pedido_antigo = item_existente.id_nota_fiscal

        estoque_antigo = self._buscar_estoque_ou_404(id_produto_antigo)
        estoque_novo = self._buscar_estoque_ou_404(item_pedido.id_produto)

        try:
            if id_produto_antigo == item_pedido.id_produto:
                delta = item_pedido.quantidade - quantidade_antiga
                if delta > 0:
                    self._validar_saldo(estoque_novo.quantidade_estoque, delta)
                    estoque_novo.quantidade_estoque -= delta
                elif delta < 0:
                    estoque_novo.quantidade_estoque += abs(delta)
            else:
                estoque_antigo.quantidade_estoque += quantidade_antiga
                self._validar_saldo(estoque_novo.quantidade_estoque, item_pedido.quantidade)
                estoque_novo.quantidade_estoque -= item_pedido.quantidade

            item_existente.quantidade = item_pedido.quantidade
            item_existente.subtotal = item_pedido.subtotal
            item_existente.id_produto = item_pedido.id_produto
            item_existente.id_nota_fiscal = item_pedido.id_nota_fiscal

            self.db.flush()
            self._recalcular_total_pedido(id_pedido_antigo)
            if id_pedido_antigo != item_pedido.id_nota_fiscal:
                self._recalcular_total_pedido(item_pedido.id_nota_fiscal)

            self.db.commit()
            self.db.refresh(item_existente)

            return item_existente
        except Exception:
            self.db.rollback()
            raise

    def deletar(self, id_item_pedido: int):
        item = self.repository.buscar_por_id(id_item_pedido)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Item de pedido nao encontrado"
            )

        estoque = self._buscar_estoque_ou_404(item.id_produto)

        try:
            estoque.quantidade_estoque += item.quantidade
            id_pedido = item.id_nota_fiscal

            self.db.delete(item)
            self.db.flush()
            self._recalcular_total_pedido(id_pedido)

            self.db.commit()
            return {"mensagem": "Item de pedido deletado com sucesso"}
        except Exception:
            self.db.rollback()
            raise
