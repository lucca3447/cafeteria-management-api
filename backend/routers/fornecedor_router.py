from core.auth_dependencies import get_current_user
from models.usuario_model import Usuario
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.auth_dependencies import require_roles
from core.database import get_db
from schemas.fornecedor_schema import (
    FornecedorCreate,
    FornecedorResponse,
    FornecedorUpdate
)
from services.fornecedor_service import FornecedorService


router = APIRouter(
    prefix="/fornecedores",
    tags=["Fornecedores"]
)


@router.post("/", response_model=FornecedorResponse, status_code=201)
def criar_fornecedor(
    fornecedor: FornecedorCreate,
    db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user),
    _: object = Depends(require_roles("admin", "gerente"))
):
    service = FornecedorService(db, current_user.id_cantina)
    return service.criar(fornecedor)


@router.get("/", response_model=list[FornecedorResponse])
def listar_fornecedores(
    db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user),
    _: object = Depends(require_roles("admin", "gerente"))
):
    service = FornecedorService(db, current_user.id_cantina)
    return service.listar()


@router.get("/{id_fornecedor}", response_model=FornecedorResponse)
def buscar_fornecedor(
    id_fornecedor: int,
    db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user),
    _: object = Depends(require_roles("admin", "gerente"))
):
    service = FornecedorService(db, current_user.id_cantina)
    return service.buscar_por_id(id_fornecedor)


@router.put("/{id_fornecedor}", response_model=FornecedorResponse)
def atualizar_fornecedor(
    id_fornecedor: int,
    fornecedor: FornecedorUpdate,
    db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user),
    _: object = Depends(require_roles("admin", "gerente"))
):
    service = FornecedorService(db, current_user.id_cantina)
    return service.atualizar(id_fornecedor, fornecedor)


@router.delete("/{id_fornecedor}")
def deletar_fornecedor(
    id_fornecedor: int,
    db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user),
    _: object = Depends(require_roles("admin", "gerente"))
):
    service = FornecedorService(db, current_user.id_cantina)
    return service.deletar(id_fornecedor)
