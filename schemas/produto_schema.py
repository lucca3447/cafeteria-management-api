from pydantic import BaseModel, Field
from decimal import Decimal

class ProdutoCreate(BaseModel):
    nome: str = Field(..., min_length=2, max_length=100)
    preco: Decimal = Field(...,gt=0)
    id_categoria: int
    exige_preparo: bool = False


class ProdutoUpdate(BaseModel):
    nome: str = Field(..., min_length=2, max_length=100)
    preco: Decimal = Field(..., gt=0)
    id_categoria: int
    exige_preparo: bool = False

class ProdutoResponse(BaseModel):
    id_produto: int
    nome: str
    preco: Decimal
    id_categoria: int
    exige_preparo: bool

    class Config:
        from_attributes = True