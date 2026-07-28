# FastCantina — Backend API 

API REST para o sistema de gestão **FastCantina**, construída com **FastAPI**, **SQLAlchemy** e **PostgreSQL**.

---

##  Arquitetura

O projeto segue uma arquitetura limpa em camadas:

```
Router → Service → Repository → Database
```

| Camada | Responsabilidade |
|---|---|
| **Router** | Recebe as requisições HTTP, valida entrada via Pydantic e delega ao Service |
| **Service** | Contém as regras de negócio, validações de domínio e orquestra repositórios |
| **Repository** | Acesso direto ao banco de dados via SQLAlchemy ORM |
| **Core** | Configuração, conexão com banco, segurança JWT, rate limiting e dependências de auth |

---

##  Tecnologias

| Tecnologia | Uso |
|---|---|
| [FastAPI](https://fastapi.tiangolo.com/) | Framework web assíncrono de alta performance |
| [SQLAlchemy](https://www.sqlalchemy.org/) | ORM para modelagem e consultas ao banco |
| [PostgreSQL](https://www.postgresql.org/) | Banco de dados relacional (via Supabase em produção) |
| [Pydantic](https://docs.pydantic.dev/) | Validação e serialização de dados (schemas) |
| [python-jose](https://github.com/mpdavis/python-jose) | Geração e validação de tokens JWT |
| [passlib + bcrypt](https://passlib.readthedocs.io/) | Hash seguro de senhas |
| [SlowAPI](https://github.com/laurentS/slowapi) | Rate limiting por IP |
| [bleach](https://github.com/mozilla/bleach) | Sanitização de HTML/XSS na entrada de dados |
| [pandas](https://pandas.pydata.org/) | Análise de vendas e previsão de demanda |
| [Docker](https://www.docker.com/) | Containerização para deploy na Render |

---

## 📁 Estrutura do Projeto

```
backend/
├── core/
│   ├── config.py               # Configurações via variáveis de ambiente (Pydantic Settings)
│   ├── database.py             # Engine e SessionLocal do SQLAlchemy
│   ├── security.py             # Criação e decodificação de tokens JWT
│   ├── auth_dependencies.py    # get_current_user e require_roles (RBAC)
│   └── rate_limit.py           # Configuração do SlowAPI
├── models/                     # entidades SQLAlchemy
│   ├── cantina_model.py
│   ├── categoria_model.py
│   ├── estoque_model.py
│   ├── fornecedor_model.py
│   ├── fornecedor_produto_model.py
│   ├── funcionario_model.py
│   ├── item_pedido_model.py
│   ├── pedido_model.py
│   ├── produto_model.py
│   ├── refresh_token_model.py
│   └── usuario_model.py
├── schemas/                    #  contratos Pydantic (entrada/saída)
├── repositories/               #  repositórios (acesso a dados)
├── services/                   #  serviços (regras de negócio)
├── routers/                    #  routers (endpoints HTTP)
├── main.py                     # Ponto de entrada da aplicação
├── Dockerfile                  # Imagem Docker para produção
├── Procfile                    # Definição de processo para a Render
├── requirements.txt            # Dependências Python
├── .env.example                # Modelo de variáveis de ambiente
└── .dockerignore               # Arquivos ignorados no build Docker
```

---

##  Endpoints

### Autenticação (`/auth`)
| Método | Rota | Descrição | Acesso |
|---|---|---|---|
| `POST` | `/auth/token` | Login via OAuth2 (Swagger) | Público |
| `POST` | `/auth/login` | Login (retorna cookies HttpOnly) | Público |
| `POST` | `/auth/refresh` | Renovar access_token via refresh_token | Autenticado |
| `GET` | `/auth/me` | Dados do usuário logado | Autenticado |
| `POST` | `/auth/logout` | Encerrar sessão (revoga refresh_token) | Autenticado |

### Cantinas (`/cantinas`)
| Método | Rota | Descrição | Acesso |
|---|---|---|---|
| `POST` | `/cantinas/registrar` | Registrar nova cantina + admin | Público |

### Recursos CRUD
Todos seguem o padrão REST (`GET /`, `GET /{id}`, `POST /`, `PUT /{id}`, `DELETE /{id}`):

| Prefixo | Recurso | Perfis Permitidos |
|---|---|---|
| `/usuarios` | Usuários do sistema | `admin` |
| `/categorias` | Categorias de produtos | `admin`, `gerente` |
| `/produtos` | Produtos da cantina | `admin`, `gerente` (leitura: `funcionario`) |
| `/funcionarios` | Funcionários | `admin`, `gerente` |
| `/fornecedores` | Fornecedores | `admin`, `gerente` |
| `/estoque` | Controle de estoque | `admin`, `gerente` |
| `/pedidos` | Pedidos / Notas fiscais | `admin`, `gerente`, `funcionario` |
| `/itens-pedido` | Itens de cada pedido | `admin`, `gerente`, `funcionario` |
| `/fornecedor-produto` | Vínculo fornecedor ↔ produto | `admin`, `gerente` |

### Previsão de Demanda (`/previsao`)
| Método | Rota | Descrição | Acesso |
|---|---|---|---|
| `GET` | `/previsao/demanda` | Previsão com média móvel + alertas de estoque | `admin`, `gerente` |

### Utilitários
| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/` | Health check básico |
| `GET` | `/ping` | Keep-alive para cron-job.org (evita hibernação na Render) |

---

## 🔐 Autenticação e Autorização

### Fluxo de Autenticação
```
1. POST /cantinas/registrar  →  Cria cantina + primeiro admin
2. POST /auth/login          →  Retorna cookies HttpOnly (access + refresh token)
3. GET  /auth/me             →  Verifica sessão (cookie enviado automaticamente)
4. POST /auth/refresh        →  Renova access_token quando expira
5. POST /auth/logout         →  Revoga refresh_token e limpa cookies
```

### Perfis (RBAC)
| Perfil | Permissões |
|---|---|
| `admin` | Acesso total a todos os recursos |
| `gerente` | Gestão operacional (catálogo, estoque, pedidos, funcionários) |
| `funcionario` | Criação de pedidos/itens e leitura de catálogo |

### Segurança Implementada
-  Senhas armazenadas com hash `bcrypt`
-  Tokens JWT com `access_token` (curta duração) e `refresh_token` (7 dias)
-  Cookies `HttpOnly` + `Secure` + `SameSite=Lax`
-  Rate limiting por IP (SlowAPI)
-  Sanitização de entrada com `bleach` (anti-XSS)
-  Validação de e-mail com `email-validator`
-  `SECRET_KEY` com mínimo de 32 caracteres
-  Isolamento de dados por cantina (multi-tenant)

---

## 🚀 Como Rodar

### Localmente
```bash
# Crie o .env a partir do exemplo
cp .env.example .env
# Edite com suas credenciais

# Instale as dependências
python -m pip install -r requirements.txt

# Inicie o servidor
python -m uvicorn main:app --reload
```
> Swagger disponível em: `http://localhost:8000/docs`

### Com Docker
```bash
docker build -t fastcantina-api .
docker run -p 8000:8000 --env-file .env fastcantina-api
```

---

## 🔧 Variáveis de Ambiente

Crie o arquivo `.env` na raiz do backend (use `.env.example` como base):

| Variável | Descrição | Exemplo |
|---|---|---|
| `DATABASE_URL` | URL de conexão PostgreSQL | `postgresql://postgres:senha@...supabase.com:6543/postgres` |
| `SECRET_KEY` | Chave secreta JWT (mín. 32 chars) | `python -c "import secrets; print(secrets.token_urlsafe(64))"` |
| `CORS_ORIGINS` | Origens permitidas (vírgula) | `http://localhost:5173,https://fastcantina.me` |
| `ENVIRONMENT` | Ambiente de execução | `development` ou `production` |

> ⚠️ Em `production`, os cookies são marcados como `Secure` (exigem HTTPS).

---


## 🗄 Banco de Dados

As tabelas são criadas automaticamente na inicialização da aplicação:

```python
Base.metadata.create_all(bind=engine)
```

