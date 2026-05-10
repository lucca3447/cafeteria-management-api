from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from core.security import gerar_hash_senha
from repositories.usuario_repository import UsuarioRepository
from schemas.usuario_schema import UsuarioCreate, UsuarioUpdate


class UsuarioService:
    def __init__(self, db: Session):
        self.repository = UsuarioRepository(db)

    def listar(self):
        return self.repository.listar()

    def buscar_por_id(self, id_usuario: int):
        usuario = self.repository.buscar_por_id(id_usuario)
        if not usuario:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario nao encontrado",
            )
        return usuario

    def criar(self, usuario: UsuarioCreate):
        usuario_existente = self.repository.buscar_por_login(usuario.login)
        if usuario_existente:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ja existe um usuario com este login",
            )

        senha_hash = gerar_hash_senha(usuario.senha)
        return self.repository.criar(usuario, senha_hash)

    def atualizar(self, id_usuario: int, usuario: UsuarioUpdate):
        usuario_db = self.repository.buscar_por_id(id_usuario)
        if not usuario_db:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario nao encontrado",
            )

        if usuario.login:
            usuario_mesmo_login = self.repository.buscar_por_login(usuario.login)
            if usuario_mesmo_login and usuario_mesmo_login.id_usuario != id_usuario:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Ja existe outro usuario com este login",
                )

        senha_hash = gerar_hash_senha(usuario.senha) if usuario.senha else None
        return self.repository.atualizar(usuario_db, usuario, senha_hash)

    def deletar(self, id_usuario: int):
        usuario = self.repository.buscar_por_id(id_usuario)
        if not usuario:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario nao encontrado",
            )

        self.repository.deletar(usuario)
        return {"mensagem": "Usuario deletado com sucesso"}
