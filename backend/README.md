# Cafeteria-management-api

API REST para gerenciamento de cafeteria, construída com FastAPI, SQLAlchemy e MySQL.

Arquitetura em camadas:
`Router -> Service -> Repository`

## Tecnologias
- Python
- FastAPI
- SQLAlchemy
- MySQL (XAMPP)
- Pydantic
- JWT (`python-jose`)
- Hash de senha (`passlib` + `bcrypt`)

## Estrutura do Projeto
```txt
deliciasdacidade2/
|-- core/           # Configuracao, banco, seguranca e autorizacao
|-- models/         # Entidades SQLAlchemy
|-- schemas/        # Contratos de entrada/saida (Pydantic)
|-- repositories/   # Acesso a dados
|-- services/       # Regras de negocio
|-- routers/        # Endpoints HTTP
|-- main.py         # Entrada da aplicacao
|-- requirements.txt
|-- .env
```

## Variáveis de Ambiente
Crie/ajuste o arquivo `.env` na raiz:

```env
DATABASE_URL=mysql+pymysql://root:@localhost:3306/cafeteriabd
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

Documentação interativa:
- Swagger: http://127.0.0.1:8000/docs

## Banco de Dados
As tabelas são criadas automaticamente na inicialização:

```python
Base.metadata.create_all(bind=engine)
```

## Endpoints (prefixos)
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

## Autenticação e Autorização
A API usa JWT com `access_token` e `refresh_token`.

Fluxo recomendado:
1. **Criação da Cantina (Primeiro Acesso)**
Para iniciar o sistema (como num SaaS), registre a primeira cantina.
`POST /cantinas/registrar`
Esse endpoint cria a cantina e o primeiro usuário com perfil de administrador.

2. **Login**
`POST /auth/login` (retorna o `access_token` e `refresh_token` contendo o id_cantina).

3. **Gerenciamento**
Com o Token JWT do admin, é possível criar os demais usuários usando `POST /usuarios/`.

Para o botão `Authorize` do Swagger:
1. Use o endpoint OAuth2 `POST /auth/token`

Perfis (RBAC):
- `admin`: acesso total
- `gerente`: gestão operacional
- `funcionario`: pedidos/itens e leitura de catálogo

## Integração com Frontend
- CORS já configurado para Vite:
  - `http://localhost:5173`
  - `http://127.0.0.1:5173`
- Enviar token no header:
  - `Authorization: Bearer <access_token>`

## Segurança
- Trocar `SECRET_KEY` por ambiente
- Senhas são armazenadas com hash (`bcrypt`)
- Rotas protegidas por token e perfil

