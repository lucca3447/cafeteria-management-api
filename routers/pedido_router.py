from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.auth_dependencies import require_roles
from core.database import get_db
from schemas.pedido_schema import PedidoCreate, PedidoResponse, PedidoUpdate, PedidoStatusUpdate
from services.pedido_service import PedidoService


router = APIRouter(
    prefix="/pedidos",
    tags=["Pedidos"]
)


@router.post("/", response_model=PedidoResponse, status_code=201)
def criar_pedido(
    pedido: PedidoCreate,
    db: Session = Depends(get_db),
    _: object = Depends(require_roles("admin", "gerente", "funcionario"))
):
    service = PedidoService(db)
    return service.criar(pedido)


@router.get("/", response_model=list[PedidoResponse])
def listar_pedidos(
    db: Session = Depends(get_db),
    _: object = Depends(require_roles("admin", "gerente", "funcionario"))
):
    service = PedidoService(db)
    return service.listar()


@router.get("/{id_nota_fiscal}", response_model=PedidoResponse)
def buscar_pedido(
    id_nota_fiscal: int,
    db: Session = Depends(get_db),
    _: object = Depends(require_roles("admin", "gerente", "funcionario"))
):
    service = PedidoService(db)
    return service.buscar_por_id(id_nota_fiscal)


@router.put("/{id_nota_fiscal}", response_model=PedidoResponse)
def atualizar_pedido(
    id_nota_fiscal: int,
    pedido: PedidoUpdate,
    db: Session = Depends(get_db),
    _: object = Depends(require_roles("admin", "gerente", "funcionario"))
):
    service = PedidoService(db)
    return service.atualizar(id_nota_fiscal, pedido)


@router.patch("/{id_nota_fiscal}/status", response_model=PedidoResponse)
def atualizar_status_pedido(
    id_nota_fiscal: int,
    pedido_status: PedidoStatusUpdate,
    db: Session = Depends(get_db),
    _: object = Depends(require_roles("admin", "gerente", "funcionario"))
):
    service = PedidoService(db)
    return service.atualizar_status(id_nota_fiscal, pedido_status)


@router.delete("/{id_nota_fiscal}")
def deletar_pedido(
    id_nota_fiscal: int,
    db: Session = Depends(get_db),
    _: object = Depends(require_roles("admin", "gerente", "funcionario"))
):
    service = PedidoService(db)
    return service.deletar(id_nota_fiscal)
