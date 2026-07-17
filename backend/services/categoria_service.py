from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from schemas.categoria_schema import CategoriaCreate, CategoriaUpdate
from repositories.categoria_repository import CategoriaRepository


class CategoriaService:
    def __init__(self, db: Session):
        self.repository = CategoriaRepository(db)

    def listar(self):
        return self.repository.listar()

    def buscar_por_id(self, id_categoria: int):
        categoria = self.repository.buscar_por_id(id_categoria)

        if not categoria:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Categoria não encontrada"
            )

        return categoria

    def criar(self, categoria: CategoriaCreate):
        categoria_existente = self.repository.buscar_por_descricao(
            categoria.descricao
        )

        if categoria_existente:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Já existe uma categoria com essa descrição"
            )

        return self.repository.criar(categoria)

    def atualizar(self, id_categoria: int, categoria: CategoriaUpdate):
        categoria_existente = self.repository.buscar_por_id(id_categoria)

        if not categoria_existente:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Categoria não encontrada"
            )

        categoria_com_mesma_descricao = self.repository.buscar_por_descricao(
            categoria.descricao
        )

        if (
            categoria_com_mesma_descricao
            and categoria_com_mesma_descricao.id_categoria != id_categoria
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Já existe outra categoria com essa descrição"
            )

        return self.repository.atualizar(categoria_existente, categoria)

    def deletar(self, id_categoria: int):
        categoria = self.repository.buscar_por_id(id_categoria)

        if not categoria:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Categoria não encontrada"
            )

        self.repository.deletar(categoria)

        return {"mensagem": "Categoria deletada com sucesso"}