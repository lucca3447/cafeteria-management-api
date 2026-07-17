# Cafeteria Management System ☕

Este repositório contém o código completo (Backend e Frontend) para o sistema de gestão inteligente voltado para cantinas e cafeterias **FastCantina**, oferecendo controle completo de vendas, estoque, produtos e um monitor de preparo em tempo real para a cozinha.

## Estrutura do Projeto (Monorepo)

O projeto está dividido em duas partes principais:

- **[`/backend`](./backend/)**: A API REST que gerencia as regras de negócio, acesso ao banco de dados e autenticação. Desenvolvida utilizando Python, FastAPI, SQLAlchemy e MySQL.
- **[`/frontend`](./frontend/)**: O painel de gestão web e interface de Ponto de Venda (PDV). Desenvolvido em React 19, Vite, Tailwind CSS v4 e React Router.

##  Como iniciar o projeto

Para executar o projeto completo localmente, você deve rodar o Backend e o Frontend simultaneamente em terminais separados.

### 1. Inicializando a API (Backend)

1. Entre na pasta do backend:
   ```bash
   cd backend
   ```
2. Crie ou ajuste o arquivo `.env` (use `.env.example` como base) para apontar para o seu banco de dados MySQL local. Exemplo:
   ```env
   DATABASE_URL=mysql+pymysql://root:@localhost:3306/cafeteriabd
   SECRET_KEY=troque_por_uma_chave_forte
   ```
3. Instale as dependências Python:
   ```bash
   python -m pip install -r requirements.txt
   ```
4. Inicie o servidor:
   ```bash
   python -m uvicorn main:app --reload
   ```
   A API estará rodando em `http://127.0.0.1:8000`. Você pode acessar a documentação interativa em `http://127.0.0.1:8000/docs`.

_Para mais detalhes técnicos da API (autenticação, endpoints, regras de segurança), consulte o [README do Backend](./backend/README.md)._

### 2. Inicializando a Interface (Frontend)

1. Em um novo terminal, abra a pasta do frontend:
   ```bash
   cd frontend
   ```
2. Crie um arquivo `.env` contendo a URL da API que acabou de inicializar:
   ```env
   VITE_API_URL=http://127.0.0.1:8000
   ```
3. Instale as dependências Node:
   ```bash
   npm install
   ```
4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
   O frontend abrirá automaticamente no navegador no endereço `http://localhost:5173`.

_Para mais detalhes sobre as bibliotecas utilizadas ou funcionalidades visuais, consulte o [README do Frontend](./frontend/README.md)._

## Principais Funcionalidades

- **Dashboard Interativo**: Gráficos e resumo financeiro em tempo real.
- **Ponto de Venda / Pedidos**: Tela unificada para criação rápida de pedidos com cálculo e desconto automático de estoque.
- **Monitor de Preparo (Cozinha)**: Fila ao vivo que atualiza automaticamente e destaca itens atrasados em preparo.
- **Controle de Catálogo e Estoque**: Gestão contínua de quantidade de itens.
- **Controle de Acesso (RBAC)**: Perfis dinâmicos (`admin`, `gerente`, `funcionario`) protegidos por autenticação JWT para restrição inteligente de acessos na API e nas Telas.
