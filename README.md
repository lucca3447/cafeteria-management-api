# Cafeteria management API

API REST para gerenciamento de cafeteria, construida com FastAPI, SQLAlchemy e MySQL.

Arquitetura em camadas:
`Router -> Service -> Repository`

## Tecnologias
- Python
- FastAPI
- SQLAlchemy
- MySQL (XAMPP)
- Pydantic
- python-jose (JWT)
- passlib + bcrypt (hash de senha)

## Estrutura do Projeto
```txt
deliciasdacidade2/
|-- core/           # Configuracao, banco e seguranca
|-- models/         # Entidades SQLAlchemy
|-- schemas/        # Validacao e contratos de entrada/saida
|-- repositories/   # Acesso a dados
|-- services/       # Regras de negocio
|-- routers/        # Endpoints HTTP
|-- main.py         # Entrada da aplicacao
|-- requirements.txt
|-- .env
```

## Variaveis de Ambiente
Crie/ajuste o arquivo `.env` na raiz do projeto:

```env
DATABASE_URL=url_da_sua_database
SECRET_KEY=troque_por_uma_chave_forte
```

Gerar `SECRET_KEY` forte:

```bash
python -c "import secrets; print(secrets.token_urlsafe(64))"
```

## Como Rodar
Dentro da pasta do projeto:

```bash
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload
```

Documentacao interativa:
- Swagger: http://127.0.0.1:8000/docs

## Banco de Dados
As tabelas sao criadas automaticamente na inicializacao via:

```python
Base.metadata.create_all(bind=engine)
```

## Endpoints Principais
- `/auth`
- `/usuarios`
- `/categorias`
- `/produtos`
- `/funcionarios`
- `/fornecedores`
- `/estoque`
- `/pedidos`
- `/itens-pedido`
- `/fornecedor-produto`

## Autenticacao e Autorizacao
A API usa JWT com access token e refresh token.

Fluxo principal:
1. `POST /auth/bootstrap-admin` (uso unico, apenas se ainda nao existir admin)
2. `POST /auth/login`
3. `GET /auth/me`
4. `POST /auth/refresh`
5. `POST /auth/logout`

Regras de perfil (RBAC simplificado):
- `admin`: acesso total
- `gerente`: leitura geral e escrita operacional
- `funcionario`: pedidos/itens e leitura de catalogo

Observacao: apos existir um admin, o endpoint `bootstrap-admin` retorna `403` por seguranca.

## Requisitos de Seguranca
- Trocar `SECRET_KEY` por ambiente
- Senhas sao armazenadas com hash (passlib + bcrypt)


