from pydantic import BaseModel, Field
from decimal import Decimal


class ItemPedidoCreate(BaseModel):
    quantidade: int = Field(..., gt=0)
    subtotal: Decimal = Field(..., ge=0)
    id_produto: int
    id_nota_fiscal: int



class  ItemPedidoUpdate(BaseModel):
    id_produto: int
    id_nota_fiscal: int
    quantidade: int = Field(..., gt=0)
    subtotal: Decimal = Field(..., ge=0)
    

class ItemPedidoResponse(BaseModel):
    id_item_pedido: int
    quantidade: int 
    subtotal: Decimal 
    id_produto: int
    id_nota_fiscal: int

    class Config:
        from_attributes = True