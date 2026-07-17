from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from repositories.fornecedor_repository import FornecedorRepository
from schemas.fornecedor_schema import FornecedorCreate, FornecedorUpdate


class FornecedorService:
    def __init__(self, db: Session):
        self.repository = FornecedorRepository(db)

    def listar(self):
        return self.repository.listar()

    def buscar_por_id(self, id_fornecedor: int):
        fornecedor = self.repository.buscar_por_id(id_fornecedor)
        if not fornecedor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Fornecedor nao encontrado"
            )

        return fornecedor

    def criar(self, fornecedor: FornecedorCreate):
        fornecedor_existente = self.repository.buscar_por_cnpj(fornecedor.cnpj)
        if fornecedor_existente:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ja existe um fornecedor com este CNPJ"
            )

        return self.repository.criar(fornecedor)

    def atualizar(self, id_fornecedor: int, fornecedor: FornecedorUpdate):
        fornecedor_existente = self.repository.buscar_por_id(id_fornecedor)
        if not fornecedor_existente:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Fornecedor nao encontrado"
            )

        fornecedor_com_mesmo_cnpj = self.repository.buscar_por_cnpj(fornecedor.cnpj)
        if (
            fornecedor_com_mesmo_cnpj
            and fornecedor_com_mesmo_cnpj.id_fornecedor != id_fornecedor
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ja existe outro fornecedor com este CNPJ"
            )

        return self.repository.atualizar(fornecedor_existente, fornecedor)

    def deletar(self, id_fornecedor: int):
        fornecedor = self.repository.buscar_por_id(id_fornecedor)
        if not fornecedor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Fornecedor nao encontrado"
            )

        self.repository.deletar(fornecedor)
        return {"mensagem": "Fornecedor deletado com sucesso"}
