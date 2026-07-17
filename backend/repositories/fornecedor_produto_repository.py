from sqlalchemy.orm import Session

from models.fornecedor_produto_model import FornecedorProduto
from schemas.fornecedor_produto_schema import FornecedorProdutoCreate


class FornecedorProdutoRepository:
    def __init__(self, db: Session):
        self.db = db

    def listar(self):
        return self.db.query(FornecedorProduto).all()

    def buscar_por_ids(self, id_fornecedor: int, id_produto: int):
        return self.db.query(FornecedorProduto).filter(
            FornecedorProduto.id_fornecedor == id_fornecedor,
            FornecedorProduto.id_produto == id_produto
        ).first()

    def buscar_por_fornecedor(self, id_fornecedor: int):
        return self.db.query(FornecedorProduto).filter(
            FornecedorProduto.id_fornecedor == id_fornecedor
        ).all()

    def buscar_por_produto(self, id_produto: int):
        return self.db.query(FornecedorProduto).filter(
            FornecedorProduto.id_produto == id_produto
        ).all()

    def criar(self, fornecedor_produto: FornecedorProdutoCreate):
        novo_fornecedor_produto = FornecedorProduto(
            id_fornecedor=fornecedor_produto.id_fornecedor,
            id_produto=fornecedor_produto.id_produto
        )

        self.db.add(novo_fornecedor_produto)
        self.db.commit()
        self.db.refresh(novo_fornecedor_produto)

        return novo_fornecedor_produto

    def deletar(self, fornecedor_produto: FornecedorProduto):
        self.db.delete(fornecedor_produto)
        self.db.commit()
