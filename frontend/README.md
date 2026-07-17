# FastCantina ☕

**FastCantina** é um painel de gestão inteligente voltado para cantinas e cafeterias, oferecendo controle completo de vendas, estoque, produtos e um monitor de preparo em tempo real para a cozinha. 

A interface moderna e amigável garante que as operações do dia a dia sejam registradas de forma rápida, evitando filas e otimizando a comunicação entre o balcão de vendas e o local de preparo.

##  Funcionalidades Principais

- **Dashboard Interativo:** Gráficos de faturamento, ticket médio e resumo de vendas do dia em tempo real.
- **Gestão de Pedidos:** Tela unificada para criação rápida de novos pedidos, vinculando funcionários e produtos. Baixa automática para produtos prontos.
- **Monitor de Preparo (Cozinha):** Acompanhamento em tempo real dos pedidos que exigem preparo. Atualização automática a cada 10 segundos. Alertas visuais para pedidos atrasados.
- **Controle de Produtos e Categorias:** Cadastro de produtos informando quais exigem preparo na cozinha.
- **Gestão de Estoque:** Painel para monitorar as quantidades disponíveis dos itens vendidos.
- **Administração de Funcionários e Fornecedores:** Telas de cadastro voltadas para o controle de permissões (Acesso Admin / Gerente) e gestão de fornecedores.
- **Segurança e Perfis de Acesso:** Login seguro com JWT e proteção de rotas, permitindo que apenas administradores acessem configurações financeiras ou de funcionários.

## 💻 Tecnologias Utilizadas

Este projeto frontend foi desenvolvido visando performance e facilidade de manutenção:

- **[React 19](https://react.dev/)** - Biblioteca principal de interfaces.
- **[Vite](https://vitejs.dev/)** - Bundler ultrarrápido para desenvolvimento.
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Framework utilitário de CSS com uso das  diretivas `@theme` para a identidade visual
- **[React Router Dom](https://reactrouter.com/)** - Gerenciamento e proteção das rotas da aplicação (`/dashboard`, `/cozinha`, etc).
- **[Axios](https://axios-http.com/)** - Cliente HTTP para comunicação com a API Backend e renovação automática de tokens (refresh token).
- **[Recharts](https://recharts.org/)** - Renderização de gráficos responsivos no Dashboard.
- **[Lucide React](https://lucide.dev/)** - Ícones limpos e modernos utilizados em todo o painel.


## ⚙️ Como Executar o Projeto Localmente

### 1. Pré-requisitos
- Node.js.
- Instância do Backend  rodando (API).

### 2. Configurando o Ambiente
Clone o repositório, navegue até a pasta do projeto e instale as dependências:

```bash
cd cafeteriafrontend
npm install
```

### 3. Variáveis de Ambiente
Crie um arquivo `.env` na raiz do frontend e defina a URL da sua API:
```env
VITE_API_URL=http://127.0.0.1:8000
```

### 4. Rodando em Desenvolvimento
Inicie o servidor de desenvolvimento do Vite:
```bash
npm run dev
```

Abra [http://localhost:5173](http://localhost:5173) no seu navegador. O HMR (Hot Module Replacement) atualizará o código em tempo real.

---
