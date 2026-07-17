from sqlalchemy.orm import Session
from models.categoria_model import Categoria
from schemas.categoria_schema import CategoriaCreate, CategoriaUpdate


class CategoriaRepository:
    def __init__(self, db: Session):
        self.db = db

    def listar(self):
        return self.db.query(Categoria).all()

    def buscar_por_id(self, id_categoria: int):
        return self.db.query(Categoria).filter(
            Categoria.id_categoria == id_categoria
        ).first()

    def buscar_por_descricao(self, descricao: str):
        return self.db.query(Categoria).filter(
            Categoria.descricao == descricao
        ).first()

    def criar(self, categoria: CategoriaCreate):
        nova_categoria = Categoria(
            descricao=categoria.descricao
        )

        self.db.add(nova_categoria)
        self.db.commit()
        self.db.refresh(nova_categoria)

        return nova_categoria

    def atualizar(self, categoria_existente: Categoria, categoria: CategoriaUpdate):
        categoria_existente.descricao = categoria.descricao

        self.db.commit()
        self.db.refresh(categoria_existente)

        return categoria_existente

    def deletar(self, categoria: Categoria):
        self.db.delete(categoria)
        self.db.commit()