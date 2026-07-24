from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, EmailStr, field_validator
import bleach


class UsuarioCreate(BaseModel):
    nome: str = Field(min_length=2, max_length=100)
    login: EmailStr = Field(max_length=50)
    senha: str = Field(min_length=8, max_length=100)
    perfil: Literal["admin", "gerente", "funcionario"] = "funcionario"
    ativo: bool = True

    @field_validator("nome")
    def sanitizar_nome(cls, v: str) -> str:
        return bleach.clean(v, tags=[], attributes={})


class UsuarioUpdate(BaseModel):
    nome: str | None = Field(default=None, min_length=2, max_length=100)
    login: EmailStr | None = Field(default=None, max_length=50)
    senha: str | None = Field(default=None, min_length=8, max_length=100)
    perfil: Literal["admin", "gerente", "funcionario"] | None = None
    ativo: bool | None = None

    @field_validator("nome")
    def sanitizar_nome_update(cls, v: str | None) -> str | None:
        if v is not None:
            return bleach.clean(v, tags=[], attributes={})
        return v


class UsuarioResponse(BaseModel):
    id_usuario: int
    nome: str
    login: str
    perfil: str
    ativo: bool
    created_at: datetime

    class Config:
        from_attributes = True
