from sqlalchemy.orm import Session

from models.usuario_model import Usuario
from schemas.usuario_schema import UsuarioCreate, UsuarioUpdate


class UsuarioRepository:
    def __init__(self, db: Session, id_cantina: int):
        self.db = db
        self.id_cantina = id_cantina

    def listar(self):
        return self.db.query(Usuario).filter(Usuario.id_cantina == self.id_cantina).all()

    def buscar_por_id(self, id_usuario: int):
        return self.db.query(Usuario).filter(Usuario.id_usuario == id_usuario, Usuario.id_cantina == self.id_cantina).first()

    def buscar_por_login(self, login: str):
        return self.db.query(Usuario).filter(Usuario.login == login, Usuario.id_cantina == self.id_cantina).first()

    def criar(self, usuario: UsuarioCreate, senha_hash: str, id_cantina: int):
        novo_usuario = Usuario(
            nome=usuario.nome,
            login=usuario.login,
            senha_hash=senha_hash,
            perfil=usuario.perfil,
            ativo=usuario.ativo,
            id_cantina=id_cantina,
        )
        self.db.add(novo_usuario)
        self.db.commit()
        self.db.refresh(novo_usuario)
        return novo_usuario

    def atualizar(self, usuario_db: Usuario, usuario: UsuarioUpdate, senha_hash: str | None = None):
        if usuario.nome is not None:
            usuario_db.nome = usuario.nome
        if usuario.login is not None:
            usuario_db.login = usuario.login
        if usuario.perfil is not None:
            usuario_db.perfil = usuario.perfil
        if usuario.ativo is not None:
            usuario_db.ativo = usuario.ativo
        if senha_hash:
            usuario_db.senha_hash = senha_hash

        self.db.commit()
        self.db.refresh(usuario_db)
        return usuario_db

    def deletar(self, usuario: Usuario):
        self.db.delete(usuario)
        self.db.commit()

    def existe_admin(self) -> bool:
        return self.db.query(Usuario).filter(Usuario.perfil == "admin", Usuario.id_cantina == self.id_cantina).first() is not None
