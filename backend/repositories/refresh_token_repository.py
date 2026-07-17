from datetime import datetime

from sqlalchemy.orm import Session

from models.refresh_token_model import RefreshToken


class RefreshTokenRepository:
    def __init__(self, db: Session):
        self.db = db

    def criar(self, id_usuario: int, token_jti: str, expira_em: datetime):
        token = RefreshToken(
            id_usuario=id_usuario,
            token_jti=token_jti,
            expira_em=expira_em,
            revogado=False,
        )
        self.db.add(token)
        self.db.commit()
        self.db.refresh(token)
        return token

    def buscar_por_jti(self, token_jti: str):
        return self.db.query(RefreshToken).filter(RefreshToken.token_jti == token_jti).first()

    def revogar(self, token: RefreshToken):
        token.revogado = True
        self.db.commit()

    def revogar_todos_por_usuario(self, id_usuario: int):
        tokens = self.db.query(RefreshToken).filter(
            RefreshToken.id_usuario == id_usuario,
            RefreshToken.revogado.is_(False),
        ).all()

        for token in tokens:
            token.revogado = True

        self.db.commit()
