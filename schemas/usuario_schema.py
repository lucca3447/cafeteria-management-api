from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class UsuarioCreate(BaseModel):
    nome: str = Field(min_length=2, max_length=100)
    login: str = Field(min_length=3, max_length=50)
    senha: str = Field(min_length=8, max_length=100)
    perfil: Literal["admin", "gerente", "atendente"] = "atendente"
    ativo: bool = True


class UsuarioUpdate(BaseModel):
    nome: str | None = Field(default=None, min_length=2, max_length=100)
    login: str | None = Field(default=None, min_length=3, max_length=50)
    senha: str | None = Field(default=None, min_length=8, max_length=100)
    perfil: Literal["admin", "gerente", "atendente"] | None = None
    ativo: bool | None = None


class UsuarioResponse(BaseModel):
    id_usuario: int
    nome: str
    login: str
    perfil: str
    ativo: bool
    created_at: datetime

    class Config:
        from_attributes = True
