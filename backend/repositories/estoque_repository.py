from sqlalchemy.orm import Session

from models.estoque_model import Estoque
from schemas.estoque_schema import EstoqueCreate, EstoqueUpdate


class EstoqueRepository:
    def __init__(self, db: Session):
        self.db = db

    def listar(self):
        return self.db.query(Estoque).all()

    def buscar_por_id(self, id_estoque: int):
        return self.db.query(Estoque).filter(
            Estoque.id_estoque == id_estoque
        ).first()

    def buscar_por_produto(self, id_produto: int):
        return self.db.query(Estoque).filter(
            Estoque.id_produto == id_produto
        ).first()

    def criar(self, estoque: EstoqueCreate):
        novo_estoque = Estoque(
            quantidade_estoque=estoque.quantidade_estoque,
            id_produto=estoque.id_produto
        )

        self.db.add(novo_estoque)
        self.db.commit()
        self.db.refresh(novo_estoque)

        return novo_estoque

    def atualizar(self, estoque_existente: Estoque, estoque: EstoqueUpdate):
        estoque_existente.quantidade_estoque = estoque.quantidade_estoque
        estoque_existente.id_produto = estoque.id_produto

        self.db.commit()
        self.db.refresh(estoque_existente)

        return estoque_existente

    def deletar(self, estoque: Estoque):
        self.db.delete(estoque)
        self.db.commit()
