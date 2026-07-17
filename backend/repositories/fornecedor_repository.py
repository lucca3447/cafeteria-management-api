from sqlalchemy.orm import Session

from models.fornecedor_model import Fornecedor
from schemas.fornecedor_schema import FornecedorCreate, FornecedorUpdate


class FornecedorRepository:
    def __init__(self, db: Session):
        self.db = db

    def listar(self):
        return self.db.query(Fornecedor).all()

    def buscar_por_id(self, id_fornecedor: int):
        return self.db.query(Fornecedor).filter(
            Fornecedor.id_fornecedor == id_fornecedor
        ).first()

    def buscar_por_nome(self, nome: str):
        return self.db.query(Fornecedor).filter(
            Fornecedor.nome == nome
        ).first()

    def buscar_por_cnpj(self, cnpj: str):
        return self.db.query(Fornecedor).filter(
            Fornecedor.cnpj == cnpj
        ).first()

    def criar(self, fornecedor: FornecedorCreate):
        novo_fornecedor = Fornecedor(
            nome=fornecedor.nome,
            telefone=fornecedor.telefone,
            cnpj=fornecedor.cnpj
        )

        self.db.add(novo_fornecedor)
        self.db.commit()
        self.db.refresh(novo_fornecedor)

        return novo_fornecedor

    def atualizar(self, fornecedor_existente: Fornecedor, fornecedor: FornecedorUpdate):
        fornecedor_existente.nome = fornecedor.nome
        fornecedor_existente.telefone = fornecedor.telefone
        fornecedor_existente.cnpj = fornecedor.cnpj

        self.db.commit()
        self.db.refresh(fornecedor_existente)

        return fornecedor_existente

    def deletar(self, fornecedor: Fornecedor):
        self.db.delete(fornecedor)
        self.db.commit()
