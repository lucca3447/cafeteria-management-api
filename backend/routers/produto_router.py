from core.auth_dependencies import get_current_user
from models.usuario_model import Usuario
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from core.auth_dependencies import require_roles
from core.database import get_db
from schemas.produto_schema import ( ProdutoCreate, ProdutoUpdate, ProdutoResponse)
from services.produto_service import ProdutoService

router = APIRouter(prefix="/produtos", tags=["Produtos"])

@router.post("/", response_model=ProdutoResponse, status_code=201)
def criar_produto(
    produto: ProdutoCreate,
    db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user),
    _: object = Depends(require_roles("admin", "gerente"))
):
    service = ProdutoService(db, current_user.id_cantina)
    return service.criar(produto)

@router.get("/", response_model= list[ProdutoResponse])
def listar_produtos(
    db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user),
    _: object = Depends(require_roles("admin", "gerente", "funcionario"))
):
    service = ProdutoService(db, current_user.id_cantina)
    return service.listar()

@router.get("/{id_produto}", response_model=ProdutoResponse)
def buscar_produto(
    id_produto: int,
    db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user),
    _: object = Depends(require_roles("admin", "gerente", "funcionario"))
):
    service = ProdutoService(db, current_user.id_cantina)
    return service.buscar_por_id(id_produto)

@router.put("/{id_produto}", response_model=ProdutoResponse)
def atualizar_produto(
    id_produto: int,
    produto: ProdutoUpdate,
    db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user),
    _: object = Depends(require_roles("admin", "gerente"))
):
    service = ProdutoService(db, current_user.id_cantina)
    return service.atualizar(id_produto, produto)

@router.delete("/{id_produto}")
def deletar_produto(
    id_produto: int,
    db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user),
    _: object = Depends(require_roles("admin", "gerente"))
):
    service = ProdutoService(db, current_user.id_cantina)
    return service.deletar(id_produto)
