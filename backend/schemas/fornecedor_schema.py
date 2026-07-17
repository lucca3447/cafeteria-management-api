from pydantic import BaseModel, Field

class FornecedorCreate(BaseModel):
    nome: str= Field(min_length=2, max_length=100)
    telefone: str= Field(min_length=2, max_length=20)
    cnpj: str= Field(min_length=18, max_length=18)
    


class FornecedorUpdate(BaseModel):
    nome: str= Field(min_length=2, max_length=100)
    telefone: str= Field(min_length=2, max_length=20)
    cnpj: str= Field(min_length=18, max_length=18)


class FornecedorResponse(BaseModel):
    id_fornecedor: int
    nome: str
    telefone: str
    cnpj: str

    class Config:
        from_attributes = True