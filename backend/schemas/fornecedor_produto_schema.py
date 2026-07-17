from pydantic import BaseModel, Field
from decimal import Decimal


class FornecedorProdutoCreate(BaseModel):
    id_fornecedor: int
    id_produto: int


    
class FornecedorProdutoResponse(BaseModel):
    id_fornecedor: int
    id_produto: int

    class Config:
        from_attributes = True