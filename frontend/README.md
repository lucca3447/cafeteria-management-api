# FastCantina — Frontend 🖥️

Painel de gestão web do **FastCantina**, construído com **React 19**, **Vite** e **Tailwind CSS v4**.

Interface moderna e responsiva para gerenciar vendas, estoque, pedidos e acompanhar o preparo da cozinha em tempo real.

---

##  Funcionalidades

| Página | Descrição |
|---|---|
| **Login** | Autenticação segura via cookies HttpOnly com renovação automática de token |
| **Registro** | Cadastro de nova cantina + primeiro administrador (fluxo SaaS) |
| **Dashboard** | Gráficos de faturamento, ticket médio, total de pedidos e resumo do dia |
| **Pedidos (PDV)** | Criação rápida de pedidos vinculando funcionário e produtos com cálculo automático |
| **Cozinha (Monitor)** | Fila de preparo em tempo real com atualização automática a cada 10s e alerta visual de atraso |
| **Produtos** | CRUD de produtos com categoria e flag "exige preparo" |
| **Categorias** | CRUD de categorias de produtos |
| **Estoque** | Monitoramento e atualização das quantidades disponíveis |
| **Funcionários** | Cadastro de funcionários da cantina |
| **Fornecedores** | Cadastro de fornecedores |
| **Fornecedor ↔ Produto** | Vínculo entre fornecedores e seus produtos |
| **Usuários** | Gerenciamento de contas com perfis RBAC |
| **Não Autorizado** | Página de feedback para acessos restritos |

---

## 🛠 Tecnologias

| Tecnologia | Versão | Uso |
|---|---|---|
| [React](https://react.dev/) | 19 | Biblioteca principal de interfaces |
| [Vite](https://vitejs.dev/) | 8 | Bundler |
| [Tailwind CSS](https://tailwindcss.com/) | v4 | Framework utilitário de CSS com diretivas `@theme` |
| [React Router](https://reactrouter.com/) | 7 | Roteamento e proteção de rotas SPA |
| [Axios](https://axios-http.com/) | 1.16 | Cliente HTTP com interceptor de refresh token |
| [Recharts](https://recharts.org/) | 3.8 | Gráficos responsivos no Dashboard |
| [Lucide React](https://lucide.dev/) | 1.16 | Ícones  |

---

## 📁 Estrutura do Projeto

```
frontend/
├── public/                         # Arquivos estáticos
├── src/
│   ├── components/
│   │   └── AppLayout.jsx           # Layout principal (sidebar + navbar)
│   ├── context/
│   │   └── AuthContext.jsx          # Estado global de autenticação
│   ├── pages/
│   │   ├── LoginPage.jsx            # Tela de login
│   │   ├── RegisterPage.jsx         # Registro de cantina + admin
│   │   ├── DashboardPage.jsx        # Dashboard com gráficos
│   │   ├── PedidosPage.jsx          # PDV / Gestão de pedidos
│   │   ├── CozinhaPage.jsx          # Monitor de preparo (tempo real)
│   │   ├── ProdutosPage.jsx         # CRUD de produtos
│   │   ├── CategoriasPage.jsx       # CRUD de categorias
│   │   ├── EstoquePage.jsx          # Gestão de estoque
│   │   ├── FuncionariosPage.jsx     # CRUD de funcionários
│   │   ├── FornecedoresPage.jsx     # CRUD de fornecedores
│   │   ├── FornecedorProdutoPage.jsx# Vínculo fornecedor ↔ produto
│   │   ├── UsuariosPage.jsx         # Gestão de usuários
│   │   └── NaoAutorizadoPage.jsx    # Página de acesso negado
│   ├── routes/
│   │   └── ProtectedRoute.jsx       # Guarda de rotas por perfil (RBAC)
│   ├── services/
│   │   └── api.js                   # Axios configurado com refresh token
│   ├── App.jsx                      # Roteamento principal
│   ├── index.css                    # Estilos globais + Tailwind
│   └── main.jsx                     # Ponto de entrada React
├── vercel.json                      # Configuração de deploy (Vercel)
├── package.json                     # Dependências e scripts
└── index.html                       # HTML raiz
```

---

## 🔐 Autenticação

O frontend utiliza **cookies HttpOnly** para autenticação.

### Fluxo
```
1. Usuário faz login → Backend retorna cookies HttpOnly (access + refresh token)
2. Axios envia cookies automaticamente (withCredentials: true)
3. Se o access_token expirar (401), o interceptor renova via POST /auth/refresh
4. Se o refresh_token também expirar, o usuário é redirecionado ao login
```

### Controle de Acesso (RBAC)
O componente `ProtectedRoute` restringe o acesso às páginas com base no perfil do usuário:

| Perfil | Páginas Acessíveis |
|---|---|
| `admin` | Todas |
| `gerente` | Dashboard, Pedidos, Cozinha, Catálogo, Estoque, Funcionários, Fornecedores |
| `funcionario` | Dashboard, Pedidos, Cozinha, consulta de Produtos |

---

##  Como Rodar Localmente

### Pré-requisitos
- **Node.js 18+**
- Backend da API rodando (ver [README do Backend](../backend/README.md))

### Instalação
```bash
# Instale as dependências
npm install

# Crie o .env com a URL da API
echo VITE_API_URL=http://localhost:8000 > .env

# Inicie o servidor de desenvolvimento
npm run dev
```

> O frontend estará disponível em `http://localhost:5173` com Hot Module Replacement (HMR).

---

## 🔧 Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|---|---|---|
| `VITE_API_URL` | URL base da API Backend | `http://localhost:8000`|

> Se `VITE_API_URL` não for definida, o frontend usa automaticamente `http://{hostname_atual}:8000` como fallback.

---

## ☁️ Deploy (Vercel)

O arquivo `vercel.json` configura o rewrite de todas as rotas para `index.html` (necessário para SPA com React Router):

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 📦 Scripts Disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento com HMR |
| `npm run build` | Gera o bundle de produção em `/dist` |
| `npm run preview` | Pré-visualiza o build de produção localmente |
| `npm run lint` | Executa o ESLint para verificação de código |
