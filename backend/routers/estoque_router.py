from core.auth_dependencies import get_current_user
from models.usuario_model import Usuario
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.auth_dependencies import require_roles
from core.database import get_db
from schemas.estoque_schema import EstoqueCreate, EstoqueResponse, EstoqueUpdate
from services.estoque_service import EstoqueService


router = APIRouter(
    prefix="/estoque",
    tags=["Estoque"]
)


@router.post("/", response_model=EstoqueResponse, status_code=201)
def criar_estoque(
    estoque: EstoqueCreate,
    db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user),
    _: object = Depends(require_roles("admin", "gerente"))
):
    service = EstoqueService(db, current_user.id_cantina)
    return service.criar(estoque)


@router.get("/", response_model=list[EstoqueResponse])
def listar_estoque(
    db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user),
    _: object = Depends(require_roles("admin", "gerente"))
):
    service = EstoqueService(db, current_user.id_cantina)
    return service.listar()


@router.get("/{id_estoque}", response_model=EstoqueResponse)
def buscar_estoque(
    id_estoque: int,
    db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user),
    _: object = Depends(require_roles("admin", "gerente"))
):
    service = EstoqueService(db, current_user.id_cantina)
    return service.buscar_por_id(id_estoque)


@router.put("/{id_estoque}", response_model=EstoqueResponse)
def atualizar_estoque(
    id_estoque: int,
    estoque: EstoqueUpdate,
    db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user),
    _: object = Depends(require_roles("admin", "gerente"))
):
    service = EstoqueService(db, current_user.id_cantina)
    return service.atualizar(id_estoque, estoque)


@router.delete("/{id_estoque}")
def deletar_estoque(
    id_estoque: int,
    db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user),
    _: object = Depends(require_roles("admin", "gerente"))
):
    service = EstoqueService(db, current_user.id_cantina)
    return service.deletar(id_estoque)
