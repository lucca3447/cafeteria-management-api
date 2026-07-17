from datetime import datetime, timedelta
from decimal import Decimal

import pandas as pd
from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from models.item_pedido_model import ItemPedido
from models.pedido_model import Pedido
from models.produto_model import Produto
from models.estoque_model import Estoque



DIAS_SEMANA = {
    0: "Segunda-feira",
    1: "Terça-feira",
    2: "Quarta-feira",
    3: "Quinta-feira",
    4: "Sexta-feira",
    5: "Sábado",
    6: "Domingo",
}


class PrevisaoService:
   

    def __init__(self, db: Session):
        self.db = db

    def _buscar_historico_vendas(self, dias: int = 28):
        """
        ETAPA 1 - COLETA DE DADOS:
        Busca todos os itens vendidos nos ultimos 'dias' dias.
        Fazemos um JOIN entre item_pedido e pedidos para pegar a data_hora.
        Retorna uma lista de tuplas: (id_produto, quantidade, data_hora)
        """
        data_inicio = datetime.now() - timedelta(days=dias)

        resultados = (
            self.db.query(
                ItemPedido.id_produto,
                ItemPedido.quantidade,
                Pedido.data_hora,
            )
            .join(Pedido, ItemPedido.id_nota_fiscal == Pedido.id_nota_fiscal)
            .filter(Pedido.data_hora >= data_inicio)
            .all()
        )

        return resultados

    def _calcular_media_por_dia_semana(self, historico):
        """
        ETAPA 2 - PROCESSAMENTO 
        Transforma o historico em um DataFrame do pandas e calcula
        a media de vendas por produto para cada dia da semana

        """
        if not historico:
            return pd.DataFrame(columns=["id_produto", "dia_semana", "media_quantidade"])

        # Cria o DataFrame a partir dos dados brutos do banco
        df = pd.DataFrame(historico, columns=["id_produto", "quantidade", "data_hora"])

        # Extrai o dia da semana (0=Segunda, 6=Domingo) a partir da data
        df["dia_semana"] = df["data_hora"].dt.dayofweek

        # Agrupa por produto e dia da semana, e calcula a media de vendas
        previsao = (
            df.groupby(["id_produto", "dia_semana"])["quantidade"]
            .mean()
            .reset_index()
            .rename(columns={"quantidade": "media_quantidade"})
        )

        # Arredonda para cima (melhor sobrar do que faltar)
        previsao["media_quantidade"] = previsao["media_quantidade"].apply(
            lambda x: int(x) + (1 if x % 1 > 0 else 0)
        )

        return previsao

    def _buscar_estoque_atual(self):
        """
        Busca a quantidade em estoque de cada produto.
        Retorna um dicionario: {id_produto: quantidade_estoque}
        """
        estoques = self.db.query(Estoque.id_produto, Estoque.quantidade_estoque).all()
        return {e.id_produto: e.quantidade_estoque for e in estoques}

    def _buscar_nomes_produtos(self):
        """
        Busca os nomes de todos os produtos.
        Retorna um dicionario: {id_produto: nome}
        """
        produtos = self.db.query(Produto.id_produto, Produto.nome).all()
        return {p.id_produto: p.nome for p in produtos}

    def gerar_alertas(self, dias_historico: int = 28):
        """
        ETAPA 3 - INFERENCIA:
        Junta tudo: pega a previsao para AMANHA, compara com
        o estoque atual e gera os alertas.
        """
        # 1. Coleta os dados historicos
        historico = self._buscar_historico_vendas(dias=dias_historico)

        # 2. Processa e calcula as medias
        previsao_df = self._calcular_media_por_dia_semana(historico)

        if previsao_df.empty:
            return {
                "dia_previsto": DIAS_SEMANA[
                    (datetime.now() + timedelta(days=1)).weekday()
                ],
                "alertas": [],
                "mensagem": "Sem historico de vendas suficiente para gerar previsoes.",
            }

        # 3. Descobre qual dia da semana sera AMANHA
        amanha = datetime.now() + timedelta(days=1)
        dia_semana_amanha = amanha.weekday()

        # 4. Filtra a previsao apenas para o dia de amanha
        previsao_amanha = previsao_df[
            previsao_df["dia_semana"] == dia_semana_amanha
        ]

        # 5. Busca o estoque atual e os nomes dos produtos
        estoque_atual = self._buscar_estoque_atual()
        nomes_produtos = self._buscar_nomes_produtos()

        # 6. Compara previsao vs estoque e gera alertas
        alertas = []
        for _, linha in previsao_amanha.iterrows():
            id_produto = int(linha["id_produto"])
            demanda_prevista = int(linha["media_quantidade"])
            estoque = estoque_atual.get(id_produto, 0)

            if estoque < demanda_prevista:
                alertas.append({
                    "id_produto": id_produto,
                    "nome_produto": nomes_produtos.get(id_produto, f"Produto {id_produto}"),
                    "demanda_prevista": demanda_prevista,
                    "estoque_atual": estoque,
                    "deficit": demanda_prevista - estoque,
                    "nivel": "critico" if estoque == 0 else "alerta",
                })

        # Ordena: criticos primeiro
        alertas.sort(key=lambda a: (0 if a["nivel"] == "critico" else 1, -a["deficit"]))

        return {
            "dia_previsto": DIAS_SEMANA[dia_semana_amanha],
            "data_prevista": amanha.strftime("%d/%m/%Y"),
            "total_alertas": len(alertas),
            "alertas": alertas,
        }
