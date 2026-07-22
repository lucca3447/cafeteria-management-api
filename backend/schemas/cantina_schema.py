from datetime import datetime
from pydantic import BaseModel, Field
from schemas.usuario_schema import UsuarioCreate, UsuarioResponse

class CantinaCreate(BaseModel):
    nome_fantasia: str = Field(min_length=2, max_length=100)
    cnpj: str = Field(min_length=14, max_length=18)
    admin: UsuarioCreate

class CantinaResponse(BaseModel):
    id_cantina: int
    nome_fantasia: str
    cnpj: str
    data_cadastro: datetime

    class Config:
        from_attributes = True

class CantinaRegistroResponse(BaseModel):
    cantina: CantinaResponse
    admin: UsuarioResponse
    mensagem: str
