from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from repositories.funcionario_repository import FuncionarioRepository
from schemas.funcionario_schema import FuncionarioCreate, FuncionarioUpdate


class FuncionarioService:
    def __init__(self, db: Session, id_cantina: int):
        self.repository = FuncionarioRepository(db, id_cantina)

    def listar(self):
        return self.repository.listar()

    def buscar_por_id(self, id_funcionario: int):
        funcionario = self.repository.buscar_por_id(id_funcionario)
        if not funcionario:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Funcionario nao encontrado"
            )

        return funcionario

    def criar(self, funcionario: FuncionarioCreate):
        funcionario_existente = self.repository.buscar_por_nome(funcionario.nome)
        if funcionario_existente:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ja existe um funcionario com este nome"
            )

        return self.repository.criar(funcionario)

    def atualizar(self, id_funcionario: int, funcionario: FuncionarioUpdate):
        funcionario_existente = self.repository.buscar_por_id(id_funcionario)
        if not funcionario_existente:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Funcionario nao encontrado"
            )

        funcionario_com_mesmo_nome = self.repository.buscar_por_nome(funcionario.nome)
        if (
            funcionario_com_mesmo_nome
            and funcionario_com_mesmo_nome.id_funcionario != id_funcionario
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ja existe outro funcionario com este nome"
            )

        return self.repository.atualizar(funcionario_existente, funcionario)

    def deletar(self, id_funcionario: int):
        funcionario = self.repository.buscar_por_id(id_funcionario)
        if not funcionario:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Funcionario nao encontrado"
            )

        self.repository.deletar(funcionario)
        return {"mensagem": "Funcionario deletado com sucesso"}
