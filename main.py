from fastapi import FastAPI


from core.config import settings
from core.database import Base, engine

from models.categoria_model import Categoria
from models.estoque_model import Estoque
from models.fornecedor_model import Fornecedor
from models.fornecedor_produto_model import FornecedorProduto
from models.funcionario_model import Funcionario
from models.item_pedido_model import ItemPedido
from models.pedido_model import Pedido
from models.produto_model import Produto
from models.refresh_token_model import RefreshToken
from models.usuario_model import Usuario

from routers.auth_router import router as auth_router
from routers.categoria_router import router as categoria_router
from routers.estoque_router import router as estoque_router
from routers.fornecedor_produto_router import router as fornecedor_produto_router
from routers.fornecedor_router import router as fornecedor_router
from routers.funcionario_router import router as funcionario_router
from routers.item_pedido_router import router as item_pedido_router
from routers.pedido_router import router as pedido_router
from routers.produto_router import router as produto_router
from routers.usuario_router import router as usuario_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="API para cantina", description="API para controle de cantina escolar", version="1.0")

app.include_router(auth_router)
app.include_router(usuario_router)
app.include_router(categoria_router)
app.include_router(produto_router)
app.include_router(funcionario_router)
app.include_router(fornecedor_router)
app.include_router(estoque_router)
app.include_router(pedido_router)
app.include_router(item_pedido_router)
app.include_router(fornecedor_produto_router)


@app.get("/")
def home():
    return {
        "mensagem": "API da cantina funcionandokkkk"
    }
