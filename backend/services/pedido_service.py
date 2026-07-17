from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from repositories.funcionario_repository import FuncionarioRepository
from repositories.pedido_repository import PedidoRepository
from schemas.pedido_schema import PedidoCreate, PedidoUpdate, PedidoStatusUpdate


class PedidoService:
    def __init__(self, db: Session):
        self.repository = PedidoRepository(db)
        self.funcionario_repository = FuncionarioRepository(db)

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
