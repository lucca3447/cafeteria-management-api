from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from repositories.fornecedor_produto_repository import FornecedorProdutoRepository
from repositories.fornecedor_repository import FornecedorRepository
from repositories.produto_repository import ProdutoRepository
from schemas.fornecedor_produto_schema import FornecedorProdutoCreate


class FornecedorProdutoService:
    def __init__(self, db: Session):
        self.repository = FornecedorProdutoRepository(db)
        self.fornecedor_repository = FornecedorRepository(db)
        self.produto_repository = ProdutoRepository(db)

    def listar(self):
        return self.repository.listar()

    def buscar_por_ids(self, id_fornecedor: int, id_produto: int):
        relacao = self.repository.buscar_por_ids(id_fornecedor, id_produto)
        if not relacao:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Relacao fornecedor-produto nao encontrada"
            )

        return relacao

    def criar(self, fornecedor_produto: FornecedorProdutoCreate):
        fornecedor = self.fornecedor_repository.buscar_por_id(
            fornecedor_produto.id_fornecedor
        )
        if not fornecedor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Fornecedor nao encontrado"
            )

        produto = self.produto_repository.buscar_por_id(fornecedor_produto.id_produto)
        if not produto:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Produto nao encontrado"
            )

        relacao_existente = self.repository.buscar_por_ids(
            fornecedor_produto.id_fornecedor,
            fornecedor_produto.id_produto
        )
        if relacao_existente:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Relacao fornecedor-produto ja existe"
            )

        return self.repository.criar(fornecedor_produto)

    def deletar(self, id_fornecedor: int, id_produto: int):
        relacao = self.repository.buscar_por_ids(id_fornecedor, id_produto)
        if not relacao:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Relacao fornecedor-produto nao encontrada"
            )

        self.repository.deletar(relacao)
        return {"mensagem": "Relacao fornecedor-produto deletada com sucesso"}
