from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from core.auth_dependencies import get_current_user
from models.usuario_model import Usuario

from core.auth_dependencies import require_roles
from core.database import get_db
from schemas.usuario_schema import UsuarioCreate, UsuarioResponse, UsuarioUpdate
from services.usuario_service import UsuarioService


router = APIRouter(prefix="/usuarios", tags=["Usuarios"])


@router.post("/", response_model=UsuarioResponse, status_code=201)
def criar_usuario(
    usuario: UsuarioCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
    _: object = Depends(require_roles("admin")),
):
    service = UsuarioService(db, current_user.id_cantina)
    return service.criar(usuario)


@router.get("/", response_model=list[UsuarioResponse])
def listar_usuarios(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
    _: object = Depends(require_roles("admin", "gerente")),
):
    service = UsuarioService(db, current_user.id_cantina)
    return service.listar()


@router.get("/{id_usuario}", response_model=UsuarioResponse)
def buscar_usuario(
    id_usuario: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
    _: object = Depends(require_roles("admin", "gerente")),
):
    service = UsuarioService(db, current_user.id_cantina)
    return service.buscar_por_id(id_usuario)


@router.put("/{id_usuario}", response_model=UsuarioResponse)
def atualizar_usuario(
    id_usuario: int,
    usuario: UsuarioUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
    _: object = Depends(require_roles("admin")),
):
    service = UsuarioService(db, current_user.id_cantina)
    return service.atualizar(id_usuario, usuario)


@router.delete("/{id_usuario}")
def deletar_usuario(
    id_usuario: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
    _: object = Depends(require_roles("admin")),
):
    service = UsuarioService(db, current_user.id_cantina)
    return service.deletar(id_usuario)
