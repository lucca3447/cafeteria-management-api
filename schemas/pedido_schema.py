from pydantic import BaseModel, Field
from decimal import Decimal
from datetime import datetime

class PedidoCreate(BaseModel):
    id_funcionario: int
    valor_total: Decimal= Field(..., ge=0)
    status: str = "pendente"


class PedidoUpdate(BaseModel):
    id_funcionario: int
    valor_total: Decimal= Field(..., ge=0)
    status: str = "pendente"

class PedidoStatusUpdate(BaseModel):
    status: str

class PedidoResponse(BaseModel):
    id_nota_fiscal: int
    id_funcionario: int
    valor_total: Decimal 
    data_hora: datetime
    status: str

    class Config:
        from_attributes = True