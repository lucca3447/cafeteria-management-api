from datetime import datetime
from pydantic import BaseModel, Field, field_validator
import bleach
from schemas.usuario_schema import UsuarioCreate, UsuarioResponse

class CantinaCreate(BaseModel):
    nome_fantasia: str = Field(min_length=2, max_length=100)
    cnpj: str = Field(min_length=14, max_length=18, pattern=r"^\d{14}$|^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$")
    admin: UsuarioCreate

    @field_validator("nome_fantasia")
    def sanitizar_nome_fantasia(cls, v: str) -> str:
        return bleach.clean(v, tags=[], attributes={})

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
