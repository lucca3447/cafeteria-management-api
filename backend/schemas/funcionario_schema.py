from pydantic import BaseModel, Field

class FuncionarioCreate(BaseModel):
    nome: str= Field(min_length=2, max_length=100)
    cargo: str= Field(min_length=2, max_length=50)
    


class FuncionarioUpdate(BaseModel):
    nome: str= Field(min_length=2, max_length=100)
    cargo: str= Field(min_length=2, max_length=50)
    
    

class FuncionarioResponse(BaseModel):
    id_funcionario: int
    nome: str
    cargo: str

    class Config:
        from_attributes = True
