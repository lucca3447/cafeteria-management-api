from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.auth_dependencies import get_current_user
from core.database import get_db
from schemas.auth_schema import (
    BootstrapAdminRequest,
    LoginRequest,
    LogoutResponse,
    RefreshTokenRequest,
    TokenResponse,
)
from schemas.usuario_schema import UsuarioResponse
from services.auth_service import AuthService


router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/bootstrap-admin", response_model=UsuarioResponse, status_code=201)
def bootstrap_admin(payload: BootstrapAdminRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    return service.bootstrap_admin(payload.nome, payload.login, payload.senha)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    return service.login(payload.login, payload.senha)


@router.post("/refresh", response_model=TokenResponse)
def refresh(payload: RefreshTokenRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    return service.refresh(payload.refresh_token)


@router.post("/logout", response_model=LogoutResponse)
def logout(payload: RefreshTokenRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    return service.logout(payload.refresh_token)


@router.get("/me", response_model=UsuarioResponse)
def me(usuario=Depends(get_current_user)):
    return usuario
