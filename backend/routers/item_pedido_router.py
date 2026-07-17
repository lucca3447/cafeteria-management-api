from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.auth_dependencies import require_roles
from core.database import get_db
from schemas.item_pedido_schema import (
    ItemPedidoCreate,
    ItemPedidoResponse,
    ItemPedidoUpdate
)
from services.item_pedido_service import ItemPedidoService


router = APIRouter(
    prefix="/itens-pedido",
    tags=["ItensPedido"]
)


@router.post("/", response_model=ItemPedidoResponse, status_code=201)
def criar_item_pedido(
    item_pedido: ItemPedidoCreate,
    db: Session = Depends(get_db),
    _: object = Depends(require_roles("admin", "gerente", "funcionario"))
):
    service = ItemPedidoService(db)
    return service.criar(item_pedido)


@router.get("/", response_model=list[ItemPedidoResponse])
def listar_itens_pedido(
    db: Session = Depends(get_db),
    _: object = Depends(require_roles("admin", "gerente", "funcionario"))
):
    service = ItemPedidoService(db)
    return service.listar()


@router.get("/{id_item_pedido}", response_model=ItemPedidoResponse)
def buscar_item_pedido(
    id_item_pedido: int,
    db: Session = Depends(get_db),
    _: object = Depends(require_roles("admin", "gerente", "funcionario"))
):
    service = ItemPedidoService(db)
    return service.buscar_por_id(id_item_pedido)


@router.put("/{id_item_pedido}", response_model=ItemPedidoResponse)
def atualizar_item_pedido(
    id_item_pedido: int,
    item_pedido: ItemPedidoUpdate,
    db: Session = Depends(get_db),
    _: object = Depends(require_roles("admin", "gerente", "funcionario"))
):
    service = ItemPedidoService(db)
    return service.atualizar(id_item_pedido, item_pedido)


@router.delete("/{id_item_pedido}")
def deletar_item_pedido(
    id_item_pedido: int,
    db: Session = Depends(get_db),
    _: object = Depends(require_roles("admin", "gerente", "funcionario"))
):
    service = ItemPedidoService(db)
    return service.deletar(id_item_pedido)
