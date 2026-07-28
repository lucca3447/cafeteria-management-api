from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from core.database import get_db
from core.security import decodificar_token
from repositories.usuario_repository import UsuarioRepository

# Mantemos o OAuth2 scheme como opcional para não quebrar o Swagger UI
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token", auto_error=False)


def get_current_user(
    request: Request,
    token_header: str | None = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    # 1. Prioridade: cookie HttpOnly
    token = request.cookies.get("access_token")

    # 2. Fallback: header Authorization (Swagger / Postman)
    if not token:
        token = token_header

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token nao fornecido",
        )

    payload = decodificar_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalido",
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalido",
        )

    usuario = UsuarioRepository(db).buscar_por_id(int(user_id))
    if not usuario or not usuario.ativo:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario nao autorizado",
        )

    return usuario


def require_roles(*roles: str):
    def role_dependency(usuario=Depends(get_current_user)):
        perfil_usuario = "funcionario" if usuario.perfil == "atendente" else usuario.perfil
        if perfil_usuario not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Sem permissao para este recurso",
            )
        return usuario

    return role_dependency
