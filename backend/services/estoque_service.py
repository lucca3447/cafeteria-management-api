from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from repositories.estoque_repository import EstoqueRepository
from repositories.produto_repository import ProdutoRepository
from schemas.estoque_schema import EstoqueCreate, EstoqueUpdate


class EstoqueService:
    def __init__(self, db: Session):
        self.repository = EstoqueRepository(db)
        self.produto_repository = ProdutoRepository(db)

    def listar(self):
        return self.repository.listar()

    def buscar_por_id(self, id_estoque: int):
        estoque = self.repository.buscar_por_id(id_estoque)
        if not estoque:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Estoque nao encontrado"
            )

        return estoque

    def criar(self, estoque: EstoqueCreate):
        produto = self.produto_repository.buscar_por_id(estoque.id_produto)
        if not produto:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Produto nao encontrado"
            )

        estoque_existente = self.repository.buscar_por_produto(estoque.id_produto)
        if estoque_existente:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Este produto ja possui registro de estoque"
            )

        return self.repository.criar(estoque)

    def atualizar(self, id_estoque: int, estoque: EstoqueUpdate):
        estoque_existente = self.repository.buscar_por_id(id_estoque)
        if not estoque_existente:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Estoque nao encontrado"
            )

        produto = self.produto_repository.buscar_por_id(estoque.id_produto)
        if not produto:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Produto nao encontrado"
            )

        estoque_do_produto = self.repository.buscar_por_produto(estoque.id_produto)
        if estoque_do_produto and estoque_do_produto.id_estoque != id_estoque:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Este produto ja possui registro de estoque"
            )

        return self.repository.atualizar(estoque_existente, estoque)

    def deletar(self, id_estoque: int):
        estoque = self.repository.buscar_por_id(id_estoque)
        if not estoque:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Estoque nao encontrado"
            )

        self.repository.deletar(estoque)
        return {"mensagem": "Estoque deletado com sucesso"}
