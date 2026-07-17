from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.auth_dependencies import require_roles
from core.database import get_db
from schemas.categoria_schema import (
    CategoriaCreate,
    CategoriaUpdate,
    CategoriaResponse
)
from services.categoria_service import CategoriaService


router = APIRouter(
    prefix="/categorias",
    tags=["Categorias"]
)


@router.post("/", response_model=CategoriaResponse, status_code=201)
def criar_categoria(
    categoria: CategoriaCreate,
    db: Session = Depends(get_db),
    _: object = Depends(require_roles("admin", "gerente"))
):
    service = CategoriaService(db)
    return service.criar(categoria)


@router.get("/", response_model=list[CategoriaResponse])
def listar_categorias(
    db: Session = Depends(get_db),
    _: object = Depends(require_roles("admin", "gerente", "funcionario"))
):
    service = CategoriaService(db)
    return service.listar()


@router.get("/{id_categoria}", response_model=CategoriaResponse)
def buscar_categoria(
    id_categoria: int,
    db: Session = Depends(get_db),
    _: object = Depends(require_roles("admin", "gerente", "funcionario"))
):
    service = CategoriaService(db)
    return service.buscar_por_id(id_categoria)


@router.put("/{id_categoria}", response_model=CategoriaResponse)
def atualizar_categoria(
    id_categoria: int,
    categoria: CategoriaUpdate,
    db: Session = Depends(get_db),
    _: object = Depends(require_roles("admin", "gerente"))
):
    service = CategoriaService(db)
    return service.atualizar(id_categoria, categoria)


@router.delete("/{id_categoria}")
def deletar_categoria(
    id_categoria: int,
    db: Session = Depends(get_db),
    _: object = Depends(require_roles("admin", "gerente"))
):
    service = CategoriaService(db)
    return service.deletar(id_categoria)
