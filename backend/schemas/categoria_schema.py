from pydantic import BaseModel, Field


class CategoriaCreate(BaseModel):
    descricao: str = Field(..., min_length=2, max_length=100)


class CategoriaUpdate(BaseModel):
    descricao: str = Field(..., min_length=2, max_length=100)


class CategoriaResponse(BaseModel):
    id_categoria: int
    descricao: str

    class Config:
        from_attributes = True