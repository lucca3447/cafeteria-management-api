from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from models.estoque_model import Estoque
from models.item_pedido_model import ItemPedido
from models.pedido_model import Pedido
from models.produto_model import Produto
from repositories.funcionario_repository import FuncionarioRepository
from repositories.pedido_repository import PedidoRepository
from schemas.pedido_schema import PedidoCreate, PedidoUpdate, PedidoStatusUpdate, PedidoCompletoCreate


class PedidoService:
    def __init__(self, db: Session, id_cantina: int):
        self.db = db
        self.id_cantina = id_cantina
        self.repository = PedidoRepository(db, id_cantina)
        self.funcionario_repository = FuncionarioRepository(db, id_cantina)

    def listar(self):
        return self.repository.listar()

    def buscar_por_id(self, id_nota_fiscal: int):
        pedido = self.repository.buscar_por_id(id_nota_fiscal)
        if not pedido:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pedido nao encontrado"
            )

        return pedido

    def criar(self, pedido: PedidoCreate):
        funcionario = self.funcionario_repository.buscar_por_id(pedido.id_funcionario)
        if not funcionario:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Funcionario nao encontrado"
            )

        return self.repository.criar(pedido)

    def atualizar(self, id_nota_fiscal: int, pedido: PedidoUpdate):
        pedido_existente = self.repository.buscar_por_id(id_nota_fiscal)
        if not pedido_existente:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pedido nao encontrado"
            )

        funcionario = self.funcionario_repository.buscar_por_id(pedido.id_funcionario)
        if not funcionario:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Funcionario nao encontrado"
            )

        return self.repository.atualizar(pedido_existente, pedido)

    def atualizar_status(self, id_nota_fiscal: int, pedido_status: PedidoStatusUpdate):
        pedido_existente = self.repository.buscar_por_id(id_nota_fiscal)
        if not pedido_existente:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pedido nao encontrado"
            )

        status_validos = ["pendente", "pronto", "entregue"]
        if pedido_status.status not in status_validos:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Status invalido"
            )

        return self.repository.atualizar_status(pedido_existente, pedido_status)

    def deletar(self, id_nota_fiscal: int):
        pedido = self.repository.buscar_por_id(id_nota_fiscal)
        if not pedido:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pedido nao encontrado"
            )

        self.repository.deletar(pedido)
        return {"mensagem": "Pedido deletado com sucesso"}

    def criar_completo(self, payload: PedidoCompletoCreate):
        # 1. Valida funcionário
        funcionario = self.funcionario_repository.buscar_por_id(payload.id_funcionario)
        if not funcionario:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Funcionario nao encontrado"
            )

        # 2. Valida todos os produtos e estoques antes de alterar qualquer coisa
        itens_validados = []
        for item in payload.itens:
            produto = (
                self.db.query(Produto)
                .filter(Produto.id_produto == item.id_produto, Produto.id_cantina == self.id_cantina)
                .first()
            )
            if not produto:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Produto ID {item.id_produto} nao encontrado"
                )

            estoque = (
                self.db.query(Estoque)
                .filter(Estoque.id_produto == item.id_produto)
                .first()
            )
            if not estoque or estoque.quantidade_estoque < item.quantidade:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Estoque insuficiente para '{produto.nome}'"
                )

            subtotal = Decimal(str(produto.preco)) * item.quantidade
            itens_validados.append({
                "produto": produto,
                "estoque": estoque,
                "quantidade": item.quantidade,
                "subtotal": subtotal,
                "exige_preparo": produto.exige_preparo,
            })

        # 3. Tudo validado — executa a transação
        try:
            valor_total = sum(iv["subtotal"] for iv in itens_validados)
            precisa_preparo = any(iv["exige_preparo"] for iv in itens_validados)

            novo_pedido = Pedido(
                id_funcionario=payload.id_funcionario,
                valor_total=valor_total,
                status="pendente" if precisa_preparo else "pronto",
                id_cantina=self.id_cantina,
            )
            self.db.add(novo_pedido)
            self.db.flush()  # Gera o id_nota_fiscal sem commitar

            for iv in itens_validados:
                novo_item = ItemPedido(
                    quantidade=iv["quantidade"],
                    subtotal=iv["subtotal"],
                    id_produto=iv["produto"].id_produto,
                    id_nota_fiscal=novo_pedido.id_nota_fiscal,
                )
                self.db.add(novo_item)
                iv["estoque"].quantidade_estoque -= iv["quantidade"]

            self.db.commit()
            self.db.refresh(novo_pedido)
            return novo_pedido

        except Exception:
            self.db.rollback()
            raise
