from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from repositories.categoria_repository import CategoriaRepository
from repositories.produto_repository import ProdutoRepository
from schemas.produto_schema import ProdutoCreate, ProdutoUpdate


class ProdutoService:
    def __init__(self, db: Session):
        self.repository = ProdutoRepository(db)
        self.categoria_repository = CategoriaRepository(db)

    def listar(self):
        return self.repository.listar()

    def buscar_por_id(self, id_produto: int):
        produto = self.repository.buscar_por_id(id_produto)

        if not produto:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Produto nao encontrado"
            )

        return produto

    def criar(self, produto: ProdutoCreate):
        produto_existente = self.repository.buscar_por_nome(produto.nome)
        if produto_existente:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ja existe um produto com este nome"
            )

        categoria = self.categoria_repository.buscar_por_id(produto.id_categoria)
        if not categoria:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Categoria nao encontrada"
            )

        return self.repository.criar(produto)

    def atualizar(self, id_produto: int, produto: ProdutoUpdate):
        produto_existente = self.repository.buscar_por_id(id_produto)
        if not produto_existente:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Produto nao encontrado"
            )

        produto_com_mesmo_nome = self.repository.buscar_por_nome(produto.nome)
        if (
            produto_com_mesmo_nome
            and produto_com_mesmo_nome.id_produto != id_produto
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ja existe outro produto com este nome"
            )

        categoria = self.categoria_repository.buscar_por_id(produto.id_categoria)
        if not categoria:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Categoria nao encontrada"
            )

        return self.repository.atualizar(produto_existente, produto)

    def deletar(self, id_produto: int):
        produto = self.repository.buscar_por_id(id_produto)
        if not produto:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Produto nao encontrado"
            )

        self.repository.deletar(produto)
        return {"mensagem": "Produto deletado com sucesso"}
