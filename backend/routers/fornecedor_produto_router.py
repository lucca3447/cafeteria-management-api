from core.auth_dependencies import get_current_user
from models.usuario_model import Usuario
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.auth_dependencies import require_roles
from core.database import get_db
from schemas.fornecedor_produto_schema import (
    FornecedorProdutoCreate,
    FornecedorProdutoResponse
)
from services.fornecedor_produto_service import FornecedorProdutoService


router = APIRouter(
    prefix="/fornecedor-produto",
    tags=["FornecedorProduto"]
)


@router.post("/", response_model=FornecedorProdutoResponse, status_code=201)
def criar_relacao_fornecedor_produto(
    fornecedor_produto: FornecedorProdutoCreate,
    db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user),
    _: object = Depends(require_roles("admin", "gerente"))
):
    service = FornecedorProdutoService(db, current_user.id_cantina)
    return service.criar(fornecedor_produto)


@router.get("/", response_model=list[FornecedorProdutoResponse])
def listar_relacoes(
    db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user),
    _: object = Depends(require_roles("admin", "gerente"))
):
    service = FornecedorProdutoService(db, current_user.id_cantina)
    return service.listar()


@router.get("/{id_fornecedor}/{id_produto}", response_model=FornecedorProdutoResponse)
def buscar_relacao(
    id_fornecedor: int,
    id_produto: int,
    db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user),
    _: object = Depends(require_roles("admin", "gerente"))
):
    service = FornecedorProdutoService(db, current_user.id_cantina)
    return service.buscar_por_ids(id_fornecedor, id_produto)


@router.delete("/{id_fornecedor}/{id_produto}")
def deletar_relacao(
    id_fornecedor: int,
    id_produto: int,
    db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user),
    _: object = Depends(require_roles("admin", "gerente"))
):
    service = FornecedorProdutoService(db, current_user.id_cantina)
    return service.deletar(id_fornecedor, id_produto)
