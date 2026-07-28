# FastCantina ☕ — Sistema de Gestão para Cantinas

<div align="center">

![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

**Sistema SaaS multi-tenant de gestão inteligente para cantinas e cafeterias.**
Controle completo de vendas, estoque, produtos, fornecedores e monitor de preparo em tempo real para a cozinha.

[Demo ao Vivo](https://fastcantina.me) · [API Docs](https://api.fastcantina.me/docs)

</div>

---

##  Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Arquitetura](#-arquitetura)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Como Rodar Localmente](#-como-rodar-localmente)
- [Deploy em Produção](#-deploy-em-produção)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)

---

## Sobre o Projeto

O **FastCantina** é uma plataforma SaaS que permite que múltiplas cantinas se registrem e gerenciem suas operações de forma isolada. Cada cantina tem seus próprios produtos, funcionários, fornecedores e pedidos — tudo protegido por autenticação JWT e controle de acesso por perfil (RBAC).

---

##  Funcionalidades

| Módulo | Descrição |
|---|---|
| **Dashboard Interativo** | Gráficos de faturamento, ticket médio e resumo financeiro em tempo real |
| **Ponto de Venda (PDV)** | Criação rápida de pedidos com cálculo automático e desconto de estoque |
| **Monitor de Preparo** | Fila da cozinha em tempo real com atualização automática (10s) e alerta de atraso |
| **Catálogo & Estoque** | Gestão de produtos, categorias e quantidades disponíveis |
| **Funcionários & Fornecedores** | Cadastro com vínculos entre fornecedores e produtos |
| **Previsão de Demanda (IA)** | Análise de vendas com médias móveis via `pandas`, alertando produtos com risco de falta |
| **Controle de Acesso (RBAC)** | Perfis `admin`, `gerente` e `funcionário` com restrição inteligente de rotas |


---

## Arquitetura

```mermaid
flowchart LR
	U[Usuários]
	F[Frontend<br/>React + Vite<br/><br/>fastcantina.me]
	B[Backend API<br/>FastAPI + Docker<br/><br/>api.fastcantina.me]
	D[(PostgreSQL<br/>)]

	U <-->|HTTPS| F
	F -->|HTTPS / REST| B
	B -->|SQLAlchemy| D
```

**Backend — Arquitetura em Camadas:**
```
Router → Service → Repository → Database
```

---

##  Estrutura do Projeto

```
cafeteria-management-api/          # Monorepo
├── backend/                       # API REST (Python / FastAPI)
│   ├── core/                      # Config, DB, segurança, rate limiting
│   ├── models/                    # entidades SQLAlchemy
│   ├── schemas/                   # contratos Pydantic (entrada/saída)
│   ├── repositories/              # repositórios (acesso a dados)
│   ├── services/                  # serviços (regras de negócio)
│   ├── routers/                   # routers (endpoints HTTP)
│   ├── Dockerfile                 # Imagem Docker para produção
│   ├── main.py                    # Entrada da aplicação
│   └── requirements.txt           # Dependências Python
├── frontend/                      # Painel Web (React 19 / Vite)
│   ├── src/
│   │   ├── components/            # Layout principal
│   │   ├── context/               # AuthContext (estado global de auth)
│   │   ├── pages/                 # páginas (Login, Dashboard, PDV...)
│   │   ├── routes/                # ProtectedRoute (guarda de rotas RBAC)
│   │   ├── services/              # Axios com interceptor de refresh token
│   │   └── App.jsx                # Roteamento principal
│   ├── vercel.json                # Configuração de deploy 
│   └── package.json               # Dependências Node.js
└── README.md                      # ← Você está aqui
```

---

## Como Rodar Localmente

### Pré-requisitos
- **Python 3.11+**
- **Node.js 18+**
- **PostgreSQL** 

### 1. Backend (API)

```bash
cd backend

# Crie o .env a partir do exemplo
cp .env.example .env
# Edite o .env com suas credenciais do banco de dados

# Instale as dependências
python -m pip install -r requirements.txt

# Inicie o servidor
python -m uvicorn main:app --reload
```

> API disponível em `http://localhost:8000` · Swagger em `http://localhost:8000/docs`

### 2. Frontend (React)

```bash
cd frontend

# Crie o .env
echo VITE_API_URL=http://localhost:8000 > .env

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

> Frontend disponível em `http://localhost:5173`

---

##  Deploy em Produção

| Componente | Plataforma | Configuração |
|---|---|---|
| **Backend** | [Render](https://render.com) (Docker) | Detecta o `Dockerfile` automaticamente |
| **Frontend** | [Vercel](https://vercel.com) | Framework: Vite · Build: `npm run build` · Output: `dist` |
| **Banco de Dados** | [Supabase](https://supabase.com) | PostgreSQL gerenciado (usar Connection Pooling, porta `6543`) |
| **Keep-Alive** | [cron-job.org](https://cron-job.org) | Ping em `GET /ping` a cada 5 min para evitar hibernação da Render |

---

## 🔐 Variáveis de Ambiente

### Backend (`backend/.env`)

| Variável | Descrição | Exemplo |
|---|---|---|
| `DATABASE_URL` | URL de conexão PostgreSQL | `postgresql://postgres:senha@...supabase.com:6543/postgres` |
| `SECRET_KEY` | Chave secreta para JWT (mínimo 32 caracteres) | `python -c "import secrets; print(secrets.token_urlsafe(64))"` |
| `CORS_ORIGINS` | Origens permitidas (separadas por vírgula) | `http://localhost:5173,https://fastcantina.me` |
| `ENVIRONMENT` | `development` ou `production` | `development` |

### Frontend (`frontend/.env`)

| Variável | Descrição | Exemplo |
|---|---|---|
| `VITE_API_URL` | URL base da API Backend | `https://api.fastcantina.me` |

---

<div align="center">

Muito café ☕

</div>
