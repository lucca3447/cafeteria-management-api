from pydantic import BaseModel, Field


class EstoqueCreate(BaseModel):
    id_produto: int
    quantidade_estoque: int = Field(..., ge=0)
    
    


class EstoqueUpdate(BaseModel):
    quantidade_estoque: int = Field(..., ge=0)
    id_produto: int
    
    


class EstoqueResponse(BaseModel):
    id_estoque: int
    quantidade_estoque: int
    id_produto: int

    class Config:
        from_attributes = True