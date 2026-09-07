# Sabor da Vila: Sistema de Gestão para Restaurante

Sistema full-stack para a gestão de um restaurante (café da manhã, almoço e pizzas): cardápio, estoque, pedidos com acompanhamento em tempo real, tela de cozinha, financeiro, histórico e auditoria. Construído como projeto de estudo e portfólio, e em uso real.

**Frontend** React + TypeScript. **Backend** ASP.NET Core (C#) + PostgreSQL. **Deploy** Vercel + Railway.

> 🔗 **App no ar:** https://sabor-da-vila-bice.vercel.app *(sistema em produção, acesso mediante login; credenciais de demonstração sob consulta)*

![Tela de login](docs/screenshots/login.png)

## Sobre o projeto

Nasceu como um painel em React + Firebase e evoluiu para uma arquitetura full-stack com **backend próprio em .NET**. A camada de serviços do frontend foi migrada do Firestore para uma **API REST** em ASP.NET Core, sobre PostgreSQL, mantendo o app em produção durante toda a transição e virando a chave (cutover) só no fim. O objetivo foi aprender backend na stack mais pedida pelo mercado local (.NET/C#) resolvendo problemas reais de um restaurante.

## Destaques de engenharia

O que torna este projeto mais do que um CRUD:

- **Transação atômica pedido para venda.** Quando um pedido chega em "Entregue", a venda (com seus itens) é gerada no mesmo *transaction* do UPDATE de status, no servidor. Isso eliminou por construção um bug de escrita dupla da primeira versão, em que o cliente registrava a venda por conta própria.
- **Tempo real com SignalR.** Um `OrdersHub` emite `OrdersChanged` após cada mutação e o cliente re-busca os dados (padrão *signal + refetch*, com o REST como fonte da verdade). Atualização instantânea entre telas (por exemplo, um pedido novo aparece na cozinha na hora), sem *polling* ocioso.
- **Arquitetura em camadas, uma pasta por domínio.** Cada domínio (`Menu`, `Orders`, `Inventory`...) segue modelo (`record` imutável), repositório (Dapper, SQL na mão), serviço (regras + auditoria) e endpoints (Minimal API). Erros são tratados por um `IExceptionHandler` global que devolve *ProblemDetails* com o status certo (400/401/404/409).
- **Autenticação JWT e autorização por papel.** Senhas com BCrypt, tokens JWT com *claim* de `role` e *policies* (por exemplo, Financeiro e Usuários são só para admin). O login usa a mesma mensagem para e-mail inexistente e senha errada (anti-enumeração de usuários).
- **Estado atual vs. eventos.** Tabelas de eventos (`sales`, `expenses`, `audit_log`) são *append-only*: são o histórico e alimentam os relatórios. Entidades de estado (`menu_items`) usam *soft-delete* por serem referenciadas por pedidos antigos; `inventory_items`, que não é referenciado, usa *hard-delete*.
- **Upload de fotos em volume persistente.** Endpoints dedicados (`POST`/`DELETE /api/menu/{id}/photo`) validam tipo e tamanho, gravam em disco (volume do Railway em produção) e servem como *static files*, desacoplados do payload de texto do cardápio.
- **Deploy real e migração de dados.** Backend *dockerizado* no Railway (com Postgres na rede privada) e frontend na Vercel. Os dados da versão Firebase foram migrados por *scripts* que leem o Firestore e fazem POST na própria API com token de admin, reaproveitando validação e auditoria.

## Funcionalidades

### Cardápio e Estoque
Cadastro, edição e remoção de itens do cardápio (por categoria, com **foto**) e controle de estoque com custo de reposição.

![Cardápio](docs/screenshots/cardapio.png)

### Pedidos
Quadro em tempo real com as colunas Recebido, Em preparo, Pronto e Entregue. Cada pedido pode vir do salão (mesa/comanda) ou de um app de delivery (iFood, 99Food, etc.), e aceita observações como restrições ou trocas ("sem alface, sem cebola"), destacadas no card. A entrada de um novo pedido é um grid visual de itens por categoria, com busca sem acento e carrinho.

![Pedidos](docs/screenshots/pedidos.png)

### Modo Cozinha
Tela separada (`/cozinha`), sem menu, pensada pra rodar em tela cheia num monitor da cozinha. Cards grandes, cronômetro ao vivo por pedido e destaque progressivo (dourado para vermelho, com aviso pulsante) para pedidos parados há muito tempo.

![Modo cozinha](docs/screenshots/cozinha.png)

### Financeiro
Resumo de vendas e gastos (hoje, últimos 7 dias, mês atual), navegação por mês, quebra de receita por canal (salão vs. delivery) e gráfico comparativo. Acesso restrito a administradores.

![Financeiro](docs/screenshots/financeiro.png)

### Histórico, Logs e Usuários
- **Histórico:** consulta de vendas por dia, com filtro por canal e busca por mesa/item.
- **Logs:** auditoria de tudo que é criado, editado ou removido (pedido, cardápio, estoque, gasto), com data, ação e usuário responsável.
- **Usuários:** administração de contas (admin/operador), para o dono criar e gerenciar funcionários sem depender de ninguém.

![Usuários](docs/screenshots/usuarios.png)

## Stack

**Frontend**
- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vite.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/), [React Router](https://reactrouter.com/), [Recharts](https://recharts.org/), [Lucide](https://lucide.dev/)
- [`@microsoft/signalr`](https://www.npmjs.com/package/@microsoft/signalr) para o tempo real

**Backend**
- [ASP.NET Core](https://learn.microsoft.com/aspnet/core) (Minimal API, .NET 10) em C#
- [PostgreSQL 16](https://www.postgresql.org/) + [Dapper](https://github.com/DapperLib/Dapper) (micro-ORM, SQL na mão) via [Npgsql](https://www.npgsql.org/)
- [JWT Bearer](https://learn.microsoft.com/aspnet/core/security/authentication/jwt) + [BCrypt](https://github.com/BcryptNet/bcrypt.net) e [SignalR](https://learn.microsoft.com/aspnet/core/signalr/introduction)
- Migrations em SQL com [golang-migrate](https://github.com/golang-migrate/migrate)

**Infra**
- Backend *dockerizado* no [Railway](https://railway.app/) (API + Postgres + volume). Frontend na [Vercel](https://vercel.com/).

## Arquitetura

Monorepo: o frontend React na raiz, o backend .NET em `backend/`.

```
src/                  Frontend React (Vite)
  api/                cliente HTTP (fetch + JWT no localStorage)
  components/         layout, proteção de rota, formulários, modais
  context/            AuthContext (login/sessão via JWT)
  hooks/              um hook por domínio (usePedidos, useCardapio...)
  pages/              uma página por rota
  services/           chamadas à API .NET (mapeiam PT/EN e reais/centavos)
  types/  utils/      tipos de domínio e formatação

backend/              API .NET (ASP.NET Core Minimal API)
  Menu/ Orders/ Sales/ Inventory/ Expenses/ Finance/ Auth/ Audit/
                      uma pasta por domínio: record, repository (Dapper), service, endpoints
  Common/             exceções compartilhadas + handler global de erros
  Storage/            upload/servir fotos (volume)
  migrations/         schema em SQL (golang-migrate)
  Dockerfile

scripts/              importadores Firebase para a API (migração de dados)
```

**Convenção de nomes:** código e schema em inglês; banco em `snake_case` (`menu_items`, `price_cents`), C# em `PascalCase`, JSON da API em `camelCase`. Valores monetários trafegam em **centavos** (inteiro) e viram reais só na borda do frontend.

### Principais endpoints

| Recurso | Rota |
|---|---|
| Autenticação | `POST /api/auth/login`, `GET /api/auth/me` |
| Cardápio | `GET/POST /api/menu`, `PUT/DELETE /api/menu/{id}`, `POST/DELETE /api/menu/{id}/photo` |
| Estoque / Gastos | `/api/inventory`, `/api/expenses` |
| Pedidos | `GET/POST /api/orders`, `POST /api/orders/{id}/advance` |
| Vendas / Financeiro | `/api/sales`, `/api/finance/{summary,daily,by-channel}` |
| Usuários / Logs | `/api/users`, `/api/logs` |
| Tempo real | `GET /hubs/orders` (SignalR) |

## Rodando localmente

Pré-requisitos: **.NET 10 SDK**, **Node 20+**, **Docker**.

### 1. Banco de dados

```bash
docker run --name sabor-db -e POSTGRES_USER=sabor -e POSTGRES_PASSWORD=senha_dev \
  -e POSTGRES_DB=sabor -p 5432:5432 -d postgres:16
```

Aplique as migrations (com o [golang-migrate](https://github.com/golang-migrate/migrate) instalado):

```bash
migrate -path backend/migrations \
  -database "postgres://sabor:senha_dev@127.0.0.1:5432/sabor?sslmode=disable" up
```

### 2. Backend

A connection string e o segredo do JWT ficam em *User Secrets* (fora do git):

```bash
cd backend
dotnet user-secrets set "ConnectionStrings:Postgres" "Host=127.0.0.1;Port=5432;Database=sabor;Username=sabor;Password=senha_dev"
dotnet user-secrets set "Jwt:Secret" "uma-chave-longa-aleatoria"
dotnet run                       # sobe em http://localhost:5236
```

Crie um usuário admin:

```bash
dotnet run -- create-user admin@exemplo.com senha123 "Admin" admin
```

### 3. Frontend

```bash
npm install
npm run dev                      # sobe em http://localhost:5173
```

O `.env` já aponta o frontend para `http://localhost:5236`. Em produção, a `VITE_API_URL` é definida na Vercel.

## Roadmap

- [ ] **Testes automatizados** com xUnit + Testcontainers (integração com Postgres descartável) e WebApplicationFactory (E2E de autenticação), com destaque para o teste da transação atômica pedido para venda.
- [ ] *Code-splitting* por rota no frontend para reduzir o bundle inicial.
