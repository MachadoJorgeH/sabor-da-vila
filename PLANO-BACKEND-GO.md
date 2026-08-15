# Sabor da Vila v2 — Backend em Go + Frontend React

Plano de reconstrução do painel de gestão, trocando o Firebase por um backend próprio em Go
com PostgreSQL, mantendo o frontend React/TypeScript.

O objetivo aqui é **aprender Go e backend de verdade** — por isso o plano evita frameworks que
escondem o funcionamento e prefere a biblioteca padrão sempre que ela dá conta.

---

## Sumário

1. [O que muda em relação à v1](#1-o-que-muda-em-relação-à-v1)
2. [Stack escolhida](#2-stack-escolhida)
3. [Estrutura de pastas](#3-estrutura-de-pastas)
4. [O que cada arquivo faz](#4-o-que-cada-arquivo-faz)
5. [Schema do banco](#5-schema-do-banco)
6. [Contrato da API](#6-contrato-da-api)
7. [Tempo real (WebSocket)](#7-tempo-real-websocket)
8. [Autenticação](#8-autenticação)
9. [Mudanças no frontend](#9-mudanças-no-frontend)
10. [Migração dos dados do Firebase](#10-migração-dos-dados-do-firebase)
11. [Roteiro de implementação](#11-roteiro-de-implementação)
12. [Decisões de projeto e o porquê](#12-decisões-de-projeto-e-o-porquê)

---

## 1. O que muda em relação à v1

| Área | v1 (Firebase) | v2 (Go) |
|---|---|---|
| Banco | Firestore (documentos) | PostgreSQL (relacional) |
| Acesso a dados | SDK do Firebase no navegador | API REST em Go |
| Tempo real | `onSnapshot` | WebSocket com hub de broadcast |
| Auth | Firebase Auth | JWT próprio + bcrypt |
| Agregações do financeiro | `reduce` no navegador | `GROUP BY` no SQL |
| Valores monetários | `number` (float) | centavos (`bigint` / `int64`) |
| Consistência | escritas soltas | transações |
| Deploy | só frontend (Vercel) | frontend (Vercel) + API + banco |

### Dois problemas da v1 que a v2 resolve

**1. Pedido entregue sem venda registrada.**
Em `src/hooks/usePedidos.ts` a v1 faz duas escritas separadas: primeiro muda o status para
`entregue`, depois grava a venda. Se a rede cair ou o navegador fechar no meio, o pedido fica
entregue e a venda some — o financeiro perde dinheiro silenciosamente. Na v2 isso vira **uma
transação**: ou grava as duas coisas, ou nenhuma.

**2. Financeiro baixando dados demais.**
`useFinanceiro` baixa 35 dias de vendas e gastos para o navegador só para somar com `reduce`.
Na v2 o servidor devolve os números já calculados.

---

## 2. Stack escolhida

### Backend

| Peça | Escolha | Por quê |
|---|---|---|
| Roteamento | `net/http` (Go 1.22+) | O roteador padrão já faz `GET /api/pedidos/{id}`. Sem dependência. |
| Banco | PostgreSQL 16 | Relacional, transações, SQL de verdade. |
| Driver | `jackc/pgx/v5` | O melhor driver de Postgres em Go, com pool de conexões. |
| Migrations | `golang-migrate` | Versiona o schema em arquivos `.sql`. |
| WebSocket | `coder/websocket` | API pequena e moderna. |
| JWT | `golang-jwt/jwt/v5` | Padrão de mercado. |
| Senhas | `golang.org/x/crypto/bcrypt` | Nunca guardar senha em texto puro. |
| UUID | `google/uuid` | IDs sem sequência previsível. |

> **Evite no começo:** Gin, Echo, Fiber, GORM. Eles escondem exatamente o que você quer aprender.
> Depois que os conceitos estiverem firmes, trocar é fácil.

### Frontend

O mesmo de hoje — React 19, Vite, Tailwind v4, React Router, Recharts, Lucide.
Sai apenas o pacote `firebase`.

### Infra

- Banco: **Neon** ou **Supabase** (free tier, Postgres gerenciado)
- API: **Fly.io** ou **Railway**
- Front: **Vercel** (como já está)

---

## 3. Estrutura de pastas

```
sabor-da-vila-v2/
├── backend/
│   ├── cmd/
│   │   ├── api/
│   │   │   └── main.go
│   │   └── importar/
│   │       └── main.go
│   ├── internal/
│   │   ├── config/
│   │   │   └── config.go
│   │   ├── database/
│   │   │   └── database.go
│   │   ├── httpx/
│   │   │   ├── json.go
│   │   │   └── erros.go
│   │   ├── auth/
│   │   │   ├── modelo.go
│   │   │   ├── repositorio.go
│   │   │   ├── servico.go
│   │   │   ├── handler.go
│   │   │   └── jwt.go
│   │   ├── middleware/
│   │   │   ├── autenticado.go
│   │   │   ├── cors.go
│   │   │   ├── log.go
│   │   │   └── recuperar.go
│   │   ├── realtime/
│   │   │   ├── hub.go
│   │   │   ├── cliente.go
│   │   │   └── handler.go
│   │   ├── cardapio/
│   │   │   ├── modelo.go
│   │   │   ├── repositorio.go
│   │   │   ├── servico.go
│   │   │   └── handler.go
│   │   ├── estoque/        (mesmos 4 arquivos)
│   │   ├── pedidos/        (mesmos 4 arquivos)
│   │   ├── vendas/         (mesmos 4 arquivos)
│   │   ├── gastos/         (mesmos 4 arquivos)
│   │   ├── logs/           (mesmos 4 arquivos)
│   │   └── financeiro/
│   │       ├── modelo.go
│   │       ├── repositorio.go
│   │       └── handler.go
│   ├── migrations/
│   │   ├── 000001_inicial.up.sql
│   │   ├── 000001_inicial.down.sql
│   │   └── ...
│   ├── .env.example
│   ├── Dockerfile
│   ├── Makefile
│   ├── go.mod
│   └── go.sum
│
├── frontend/                 (o React de hoje, adaptado)
│   ├── src/
│   │   ├── api/
│   │   │   ├── cliente.ts
│   │   │   ├── cardapio.ts
│   │   │   ├── estoque.ts
│   │   │   ├── pedidos.ts
│   │   │   ├── vendas.ts
│   │   │   ├── gastos.ts
│   │   │   ├── logs.ts
│   │   │   └── financeiro.ts
│   │   ├── realtime/
│   │   │   └── useWebSocket.ts
│   │   ├── components/       (igual à v1)
│   │   ├── context/          (AuthContext adaptado)
│   │   ├── hooks/            (mesmos hooks, novo miolo)
│   │   ├── pages/            (praticamente iguais)
│   │   ├── types/            (sem Timestamp do Firebase)
│   │   └── utils/
│   └── ...
│
├── scripts/
│   └── exportar-firestore.mjs
│
└── README.md
```

### A ideia da organização

Cada domínio é **um pacote com os mesmos 4 arquivos**. Você aprende o padrão uma vez
(no `cardapio`, que é o mais simples) e repete cinco vezes. Isso é proposital: a repetição
é o que fixa o modelo mental.

```
modelo.go       →  as structs (o "quê")
repositorio.go  →  o SQL (fala com o banco)
servico.go      →  as regras de negócio (orquestra)
handler.go      →  o HTTP (traduz requisição ↔ serviço)
```

A regra de ouro: **o handler não sabe SQL, o repositório não sabe HTTP.** Se você respeitar
só isso, o projeto inteiro se organiza sozinho.

---

## 4. O que cada arquivo faz

### `cmd/api/main.go`
O ponto de entrada. É o único arquivo que conhece o projeto inteiro. Responsabilidades:

1. Carrega config do ambiente
2. Abre o pool de conexões com o Postgres
3. Sobe o hub de WebSocket (goroutine)
4. Instancia, para cada domínio, o trio repositório → serviço → handler
5. Registra todas as rotas no `http.ServeMux`
6. Empilha os middlewares globais
7. Sobe o servidor e trata *graceful shutdown* (Ctrl+C fecha conexões abertas)

É a "montagem" do sistema — o lugar onde as dependências são injetadas na mão. Nada de mágica.

### `cmd/importar/main.go`
Comando avulso que lê os JSONs exportados do Firestore e popula o Postgres. Roda uma vez.
Detalhado na [seção 10](#10-migração-dos-dados-do-firebase).

### `internal/config/config.go`
Lê variáveis de ambiente e devolve uma struct `Config`. Falha na hora de subir se faltar algo
obrigatório (melhor quebrar no boot que às 3h da manhã).

```go
type Config struct {
    PortaHTTP        string
    DatabaseURL      string
    JWTSegredo       string
    JWTExpiracao     time.Duration
    OrigensPermitidas []string
    Ambiente         string // "dev" | "prod"
}
```

### `internal/database/database.go`
Abre o `pgxpool`, configura limites (máx. de conexões, timeout) e testa com um `Ping`.
Expõe também um helper `EmTransacao(ctx, fn)` que abre transação, roda a função, e faz
commit ou rollback conforme o erro — usado pelo fluxo de "avançar pedido".

### `internal/httpx/json.go`
Duas funções que você vai chamar em todo handler:

- `LerJSON(w, r, destino)` — decodifica o corpo, com limite de tamanho e rejeitando campos desconhecidos
- `EscreverJSON(w, status, dados)` — serializa e escreve com o header certo

Sem isso você repete 6 linhas de boilerplate em cada endpoint.

### `internal/httpx/erros.go`
Um tipo `ErroAPI` com status HTTP + código + mensagem, e helpers como `NaoEncontrado()`,
`RequisicaoInvalida(msg)`, `NaoAutorizado()`. Garante que **todo erro da API sai no mesmo
formato JSON** — o front trata um formato só.

```json
{ "erro": { "codigo": "nao_encontrado", "mensagem": "Pedido não encontrado" } }
```

### `internal/auth/`
- **`modelo.go`** — `Usuario`, `CredenciaisLogin`, `RespostaLogin`
- **`repositorio.go`** — `BuscarPorEmail`, `BuscarPorID`, `Criar`
- **`servico.go`** — `Login` (valida senha com bcrypt, gera JWT), `Registrar` (hash da senha)
- **`jwt.go`** — `GerarToken(usuario)` e `ValidarToken(string)`; conhece o segredo e a expiração
- **`handler.go`** — `POST /api/auth/login`, `POST /api/auth/refresh`, `GET /api/auth/me`

### `internal/middleware/`
Middleware em Go é só uma função que recebe um `http.Handler` e devolve outro. Depois de
escrever o primeiro, os outros são triviais.

- **`autenticado.go`** — lê o header `Authorization: Bearer ...`, valida o JWT, coloca o usuário
  no `context` da requisição. Sem token válido → 401. **É aqui que o resto do sistema descobre
  quem está logado** (o que substitui o `auth.currentUser` da v1 usado nos logs).
- **`cors.go`** — libera o domínio do frontend (Vercel + localhost).
- **`log.go`** — imprime método, rota, status e duração de cada requisição. Seu melhor amigo no debug.
- **`recuperar.go`** — captura `panic`, devolve 500 e mantém o servidor de pé.

### `internal/realtime/`
O coração da parte "tempo real" — o que substitui o `onSnapshot`.

- **`hub.go`** — mantém o conjunto de clientes conectados e faz o broadcast. Estrutura clássica
  em Go: um `map` de clientes protegido por `sync.RWMutex` (ou canais `registrar`/`remover`/
  `transmitir` consumidos por uma goroutine). Expõe `Transmitir(evento Evento)`.
- **`cliente.go`** — representa uma conexão. Duas goroutines por cliente: uma lendo (para
  detectar desconexão e responder ping/pong) e outra escrevendo da fila de saída.
  Se a fila lotar, derruba o cliente lento em vez de travar o servidor inteiro.
- **`handler.go`** — `GET /ws`: faz o upgrade da conexão HTTP, autentica e registra no hub.

### `internal/cardapio/` (o modelo que os outros seguem)

- **`modelo.go`**
  ```go
  type Item struct {
      ID             uuid.UUID `json:"id"`
      Nome           string    `json:"nome"`
      PrecoCentavos  int64     `json:"precoCentavos"`
      Categoria      string    `json:"categoria"`
      Ativo          bool      `json:"ativo"`
      CriadoEm       time.Time `json:"criadoEm"`
  }

  type EntradaItem struct { /* o que o cliente envia */ }
  func (e EntradaItem) Validar() error { /* nome não vazio, preço >= 0, categoria válida */ }
  ```
- **`repositorio.go`** — `Listar`, `BuscarPorID`, `Criar`, `Atualizar`, `Desativar`. Só SQL.
- **`servico.go`** — chama o repositório e registra o log de auditoria. É o dono da regra
  "remover item do cardápio é **desativar**, não apagar" (senão pedidos antigos quebram).
- **`handler.go`** — os 4 endpoints REST.

### `internal/pedidos/` (o mais interessante)

- **`modelo.go`** — `Pedido`, `ItemPedido`, os enums `Status`/`Origem`, e a função
  `ProximoStatus(atual)` — a mesma máquina de estados do `PROXIMO_STATUS` da v1, agora no servidor.
- **`repositorio.go`** — precisa montar pedido + itens. Duas abordagens; comece com duas queries
  (`SELECT` nos pedidos, `SELECT` nos itens, junta em Go) e depois experimente `json_agg` no SQL.
  Todos os métodos de escrita aceitam uma transação.
- **`servico.go`** — onde mora a lógica de verdade:
  - `Criar`: valida itens, grava pedido + itens **numa transação**, registra log, `hub.Transmitir("pedido.criado")`
  - `AvancarStatus`: calcula o próximo status; **se for `entregue`, grava a venda na mesma
    transação** — o bug da v1, resolvido
  - `Remover`, `ListarDoDia`
- **`handler.go`** — `GET /api/pedidos`, `POST`, `POST /{id}/avancar`, `DELETE /{id}`

### `internal/financeiro/`
Não tem `servico.go` — é só leitura.

- **`repositorio.go`** — as queries de agregação. Aqui você aprende SQL de verdade:
  ```sql
  SELECT COALESCE(SUM(total_centavos), 0)
  FROM vendas
  WHERE criado_em >= $1 AND criado_em < $2;
  ```
  e, para o gráfico de 7 dias, um `generate_series` com `LEFT JOIN` para não perder os dias sem venda.
- **`handler.go`** — `/api/financeiro/resumo`, `/serie`, `/por-canal`

### `internal/logs/`
- **`servico.go`** — `Registrar(ctx, tx, entrada)`. Recebe a transação para que o log seja
  gravado junto com a operação. Pega o usuário do `context` (colocado lá pelo middleware).
- **`handler.go`** — `GET /api/logs` com filtros de data e limite.

---

## 5. Schema do banco

`migrations/000001_inicial.up.sql`:

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------- usuários ----------
CREATE TABLE usuarios (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       TEXT NOT NULL UNIQUE,
    senha_hash  TEXT NOT NULL,
    nome        TEXT NOT NULL,
    papel       TEXT NOT NULL DEFAULT 'operador'
                CHECK (papel IN ('admin', 'operador')),
    criado_em   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- cardápio ----------
CREATE TABLE cardapio_itens (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome           TEXT NOT NULL,
    preco_centavos BIGINT NOT NULL CHECK (preco_centavos >= 0),
    categoria      TEXT NOT NULL
                   CHECK (categoria IN ('Lanches','Bebidas','Sobremesas','Pizzas','Prato Feito')),
    ativo          BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em      TIMESTAMPTZ NOT NULL DEFAULT now(),
    atualizado_em  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_cardapio_ativo ON cardapio_itens (categoria, nome) WHERE ativo;

-- ---------- estoque ----------
CREATE TABLE estoque_itens (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome           TEXT NOT NULL,
    quantidade     NUMERIC(12,3) NOT NULL,
    unidade        TEXT NOT NULL,
    custo_centavos BIGINT NOT NULL CHECK (custo_centavos >= 0),
    criado_em      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_estoque_criado_em ON estoque_itens (criado_em DESC);

-- ---------- pedidos ----------
CREATE TABLE pedidos (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mesa          TEXT NOT NULL,
    origem        TEXT NOT NULL CHECK (origem IN ('salao','app')),
    status        TEXT NOT NULL DEFAULT 'recebido'
                  CHECK (status IN ('recebido','em_preparo','pronto','entregue')),
    observacao    TEXT,
    criado_em     TIMESTAMPTZ NOT NULL DEFAULT now(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_pedidos_criado_em ON pedidos (criado_em DESC);
CREATE INDEX idx_pedidos_abertos   ON pedidos (criado_em) WHERE status <> 'entregue';

CREATE TABLE pedido_itens (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id               UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    cardapio_item_id        UUID REFERENCES cardapio_itens(id) ON DELETE SET NULL,
    nome                    TEXT NOT NULL,
    preco_unitario_centavos BIGINT NOT NULL CHECK (preco_unitario_centavos >= 0),
    quantidade              INTEGER NOT NULL CHECK (quantidade > 0)
);
CREATE INDEX idx_pedido_itens_pedido ON pedido_itens (pedido_id);

-- ---------- vendas ----------
CREATE TABLE vendas (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id      UUID UNIQUE REFERENCES pedidos(id) ON DELETE SET NULL,
    mesa           TEXT NOT NULL,
    origem         TEXT NOT NULL CHECK (origem IN ('salao','app')),
    observacao     TEXT,
    total_centavos BIGINT NOT NULL CHECK (total_centavos >= 0),
    criado_em      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_vendas_criado_em ON vendas (criado_em DESC);
CREATE INDEX idx_vendas_origem    ON vendas (origem, criado_em DESC);

CREATE TABLE venda_itens (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venda_id                UUID NOT NULL REFERENCES vendas(id) ON DELETE CASCADE,
    cardapio_item_id        UUID REFERENCES cardapio_itens(id) ON DELETE SET NULL,
    nome                    TEXT NOT NULL,
    preco_unitario_centavos BIGINT NOT NULL,
    quantidade              INTEGER NOT NULL CHECK (quantidade > 0)
);
CREATE INDEX idx_venda_itens_venda ON venda_itens (venda_id);

-- ---------- gastos ----------
CREATE TABLE gastos (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    descricao      TEXT NOT NULL,
    categoria      TEXT NOT NULL
                   CHECK (categoria IN ('Aluguel','Fornecedores','Contas (água/luz/internet)',
                                        'Funcionários','Manutenção','Outros')),
    valor_centavos BIGINT NOT NULL CHECK (valor_centavos >= 0),
    criado_em      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_gastos_criado_em ON gastos (criado_em DESC);

-- ---------- logs de auditoria ----------
CREATE TABLE logs (
    id            BIGSERIAL PRIMARY KEY,
    acao          TEXT NOT NULL CHECK (acao IN ('criar','atualizar','remover')),
    entidade      TEXT NOT NULL CHECK (entidade IN ('pedido','cardapio','estoque','gasto')),
    descricao     TEXT NOT NULL,
    usuario_id    UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    usuario_email TEXT NOT NULL,
    criado_em     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_logs_criado_em ON logs (criado_em DESC);
```

### Três detalhes que valem entender

**`vendas.pedido_id` é `UNIQUE`.** É o banco garantindo que um pedido nunca gere duas vendas.
Mesmo que um bug no código tente gravar duas vezes, o Postgres recusa. Isso se chama deixar a
regra no lugar mais confiável possível.

**Os itens guardam `nome` e `preco_unitario_centavos` copiados.** Não são só uma referência
ao cardápio. Se amanhã o X-Burger subir de R$ 20 para R$ 25, os pedidos de ontem continuam
valendo R$ 20. Isso se chama *snapshot* — em qualquer sistema com histórico financeiro é
obrigatório.

**Cardápio tem `ativo` em vez de `DELETE`.** Apagar um item que já apareceu em pedidos
destruiria o histórico. "Remover" na interface vira `UPDATE ... SET ativo = false`.

---

## 6. Contrato da API

Todas as rotas sob `/api` (exceto `/auth/login`) exigem `Authorization: Bearer <token>`.

### Auth
```
POST   /api/auth/login       { email, senha } → { token, expiraEm, usuario }
POST   /api/auth/refresh                      → { token, expiraEm }
GET    /api/auth/me                           → { usuario }
```

### Cardápio
```
GET    /api/cardapio                 → Item[]
POST   /api/cardapio                 { nome, precoCentavos, categoria } → Item
PUT    /api/cardapio/{id}            { nome, precoCentavos, categoria } → Item
DELETE /api/cardapio/{id}            → 204   (desativa)
```

### Estoque
```
GET    /api/estoque                  → ItemEstoque[]
POST   /api/estoque                  { nome, quantidade, unidade, custoCentavos } → ItemEstoque
DELETE /api/estoque/{id}             → 204
```

### Pedidos
```
GET    /api/pedidos?desde=2026-08-15T00:00:00Z   → Pedido[]  (padrão: hoje)
POST   /api/pedidos                  { mesa, origem, itens[], observacao? } → Pedido
POST   /api/pedidos/{id}/avancar     → Pedido   (gera venda se virar "entregue")
DELETE /api/pedidos/{id}             → 204
```

### Vendas / Gastos / Logs
```
GET    /api/vendas?inicio=&fim=      → Venda[]
GET    /api/gastos?inicio=&fim=      → Gasto[]
POST   /api/gastos                   { descricao, categoria, valorCentavos } → Gasto
PUT    /api/gastos/{id}              → Gasto
DELETE /api/gastos/{id}              → 204
GET    /api/logs?inicio=&fim=&max=300 → Log[]
```

### Financeiro
```
GET /api/financeiro/resumo    → { vendasHojeCentavos, gastosHojeCentavos,
                                  vendasSemanaCentavos, gastosSemanaCentavos,
                                  vendasMesCentavos, gastosMesCentavos }
GET /api/financeiro/serie?dias=7  → [{ dia: "2026-08-15", vendasCentavos, gastosCentavos }]
GET /api/financeiro/por-canal     → { salaoCentavos, appCentavos }
```

### WebSocket
```
GET /ws?token=<jwt>
```

---

## 7. Tempo real (WebSocket)

É a parte mais nova e a mais valiosa de aprender. Substitui o `onSnapshot` da v1.

### Como funciona

```
Navegador A ──┐
Navegador B ──┼──► /ws ──► Hub ──► broadcast para todos
Tela cozinha ─┘              ▲
                             │
              serviço de pedidos chama hub.Transmitir(...)
              depois de cada escrita bem-sucedida
```

### Formato dos eventos

```json
{ "tipo": "pedido.criado",     "dados": { /* Pedido completo */ } }
{ "tipo": "pedido.atualizado", "dados": { /* Pedido completo */ } }
{ "tipo": "pedido.removido",   "dados": { "id": "uuid" } }
{ "tipo": "venda.criada",      "dados": { /* Venda */ } }
```

Enviar o objeto inteiro (e não só o id) evita que o front precise fazer outra requisição.

### Regras que evitam dor de cabeça

1. **Só transmita depois do commit da transação.** Se transmitir antes e a transação falhar,
   as telas mostram um pedido que não existe.
2. **Cada cliente tem uma fila com limite** (ex.: 32 mensagens). Se encher, desconecte o cliente
   — ele reconecta e recarrega. Nunca deixe um cliente lento travar o hub.
3. **Ping/pong a cada ~30s.** Sem isso, proxies e o Fly.io derrubam conexões ociosas em silêncio.
4. **Reconexão automática no front**, com *backoff* (1s, 2s, 4s… até 30s) e um `GET` completo
   ao reconectar para pegar o que perdeu.

### Alternativa mais simples

Se o WebSocket parecer demais no começo, **SSE (Server-Sent Events)** resolve 90% do caso:
é HTTP puro, unidirecional (só servidor → cliente, que é tudo que este app precisa), e o
navegador já reconecta sozinho via `EventSource`. Dá para começar com SSE e migrar depois.

---

## 8. Autenticação

Fluxo:

1. `POST /api/auth/login` com email e senha
2. O serviço busca o usuário, compara a senha com `bcrypt.CompareHashAndPassword`
3. Gera um JWT com `sub` (id), `email`, `papel`, `exp` (~8h — um turno de trabalho)
4. O front guarda o token e manda em todo request

**Onde guardar o token no front:** `localStorage` é o mais simples e aceitável para um painel
interno. O caminho mais seguro (cookie `httpOnly` + refresh token) é um bom "nível 2" depois
que o resto estiver funcionando.

**Criando o primeiro usuário:** não exponha rota pública de cadastro. Faça um comando
`cmd/criar-usuario/main.go` que roda no terminal e insere direto no banco.

---

## 9. Mudanças no frontend

A boa notícia: **as páginas quase não mudam.** `Pedidos.tsx`, `Cozinha.tsx`, `Financeiro.tsx`
continuam iguais, porque a v1 já isolou tudo em hooks.

### `src/api/cliente.ts`
Um `fetch` embrulhado que:
- prefixa a URL base (`VITE_API_URL`)
- injeta `Authorization: Bearer <token>`
- desserializa o JSON
- converte erro da API em `throw`
- em 401, limpa o token e manda pro login

Todo o resto de `src/api/` usa essa função.

### `src/realtime/useWebSocket.ts`
Hook que abre a conexão, trata reconexão com backoff e entrega os eventos via callback.

### Os hooks
`usePedidos` passa a: buscar o estado inicial via `GET /api/pedidos` e aplicar os eventos
do WebSocket em cima. Mesma assinatura de retorno de hoje (`{ pedidos, salvando, criar,
avancarStatus, remover }`), então as páginas não percebem a troca.

`useFinanceiro` fica **muito menor** — só chama três endpoints e devolve os números.
Todo o `somarPorData`/`useMemo` sai.

### Os types
Some o `Timestamp` do Firebase. Datas viram `string` (ISO 8601) e você converte com `new Date(...)`
onde precisar. Valores viram `precoCentavos: number` (inteiro) — a formatação em `formatCurrency`
passa a dividir por 100.

### O que apagar
`src/firebase.ts`, `src/services/` inteiro, e o pacote `firebase` do `package.json`.

---

## 10. Migração dos dados do Firebase

**Resposta curta: sim, dá para trazer tudo.** O caminho é exportar cada coleção do Firestore
para JSON e importar no Postgres com um comando em Go.

> Não use o export nativo do Firestore (`gcloud firestore export`) — ele gera um formato binário
> próprio, feito para reimportar no próprio Firestore. Para ir para o Postgres, um script de
> leitura é muito mais simples.

### Passo 1 — Baixar a chave de serviço

No Console do Firebase → ⚙️ Configurações do projeto → **Contas de serviço** →
**Gerar nova chave privada**. Salve como `scripts/serviceAccount.json`.

> ⚠️ **Coloque no `.gitignore` imediatamente.** Essa chave dá acesso total ao projeto — é
> muito diferente do `firebaseConfig` público que está no código hoje.

### Passo 2 — Exportar as coleções

`scripts/exportar-firestore.mjs`:

```js
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { writeFileSync, mkdirSync } from "node:fs";

initializeApp({ credential: cert("./serviceAccount.json") });
const db = getFirestore();

// Converte Timestamp do Firestore em string ISO, recursivamente.
function normalizar(valor) {
  if (valor instanceof Timestamp) return valor.toDate().toISOString();
  if (Array.isArray(valor)) return valor.map(normalizar);
  if (valor && typeof valor === "object") {
    return Object.fromEntries(
      Object.entries(valor).map(([chave, v]) => [chave, normalizar(v)])
    );
  }
  return valor;
}

const colecoes = ["cardapio", "estoque", "pedidos", "vendas", "gastos", "logs"];

mkdirSync("./dados", { recursive: true });

for (const nome of colecoes) {
  const snapshot = await db.collection(nome).get();
  const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...normalizar(doc.data()) }));
  writeFileSync(`./dados/${nome}.json`, JSON.stringify(docs, null, 2));
  console.log(`${nome}: ${docs.length} documentos`);
}
```

```bash
cd scripts
npm install firebase-admin
node exportar-firestore.mjs
```

Isso gera `dados/cardapio.json`, `dados/pedidos.json`, etc. **Guarde esses arquivos** — eles são
seu backup e você pode rodar a importação quantas vezes quiser enquanto ajusta.

### Passo 3 — Importar no Postgres (`cmd/importar/main.go`)

A parte que exige atenção é que **os IDs mudam**: no Firestore são strings tipo `"a7Kd93..."`,
no Postgres são UUIDs. Como pedidos referenciam itens do cardápio e vendas referenciam pedidos,
é preciso manter um mapa de tradução.

**Ordem obrigatória** (respeitando as chaves estrangeiras):

```
1. cardapio  →  guarda mapa: idFirestore → uuid
2. estoque
3. gastos
4. pedidos   →  usa o mapa do cardápio nos itens
             →  guarda mapa: idFirestore → uuid
5. vendas    →  usa o mapa de pedidos
6. logs
```

Esqueleto:

```go
type Importador struct {
    tx           pgx.Tx
    mapaCardapio map[string]uuid.UUID
    mapaPedidos  map[string]uuid.UUID
}
```

**Casos que você vai encontrar** (e como tratar):

| Situação | O que fazer |
|---|---|
| Item do pedido cujo `cardapioId` não existe mais | Insere com `cardapio_item_id = NULL`. O `nome` e o preço do snapshot preservam a informação. |
| Venda cujo `pedidoId` foi apagado | Insere com `pedido_id = NULL` (por isso a coluna é anulável). |
| `criadoEm` ausente (`serverTimestamp` que não gravou) | Use a data do documento mais próximo ou `now()`; registre num aviso. |
| `origem` ausente em pedidos antigos | Assume `'salao'` — é o que a v1 já faz com `pedido.origem ?? "salao"`. |
| `observacao` ausente | Vira `NULL`. |
| Valores em float (`19.9`) | `int64(math.Round(valor * 100))` → `1990`. **Use `Round`**, não conversão direta: `int64(19.9*100)` pode dar `1989`. |

**Rode tudo dentro de uma transação só.** Se algo falhar no meio, o banco volta ao estado
vazio e você corrige e roda de novo, sem dados pela metade.

### Passo 4 — Usuários

Os usuários do Firebase Auth são o único caso que **não vale migrar**. Os hashes de senha usam
uma variante de scrypt com parâmetros próprios do Firebase — tecnicamente importável, mas muito
trabalho para o benefício.

Como é um restaurante com poucos funcionários, o pragmático é:

```bash
go run ./cmd/criar-usuario -email jorge@... -nome "Jorge" -papel admin
```

E avisar a equipe da nova senha. Se quiser conferir quem existe hoje:
`firebase auth:export usuarios.json` lista os emails.

### Passo 5 — Conferir

Antes de desligar o Firebase, compare:

```sql
SELECT COUNT(*) FROM pedidos;                          -- vs. pedidos.json
SELECT COUNT(*) FROM vendas;                           -- vs. vendas.json
SELECT SUM(total_centavos) / 100.0 FROM vendas;        -- vs. o total do financeiro na v1
```

Se o faturamento total bater, a migração está correta.

---

## 11. Roteiro de implementação

Ordem pensada para você aprender em curva crescente — cada etapa usa o que a anterior ensinou.

### Etapa 0 — Preservar a v1
```bash
git tag v1-firebase
git push origin v1-firebase
```
Assim a versão Firebase fica registrada para sempre, e você pode começar a v2 sem medo.

### Etapa 1 — Fundação
Postgres rodando (Docker local), `migrations/000001`, `config`, `database`, `httpx`,
e um `GET /api/saude` respondendo `{"ok":true}`.
**Você aprende:** módulos Go, structs, `net/http`, conexão com banco.

### Etapa 2 — Cardápio completo
O CRUD inteiro: modelo → repositório → serviço → handler. Sem auth ainda, testando com `curl`.
**Você aprende:** o padrão que vai repetir 5 vezes, `context`, tratamento de erro em Go.

### Etapa 3 — Auth
Usuários, bcrypt, JWT, middleware `Autenticado`. Trancar tudo que já existe.
**Você aprende:** middleware, `context.WithValue`, criptografia básica.

### Etapa 4 — Estoque, Gastos e Logs
Repetição do padrão da etapa 2. Rápido, e é onde ele fixa.

### Etapa 5 — Pedidos + Vendas com transação
`AvancarStatus` gravando venda na mesma transação.
**Você aprende:** transações, `defer`, o modelo de erro do Go — a etapa mais importante.

### Etapa 6 — Financeiro em SQL
As queries de agregação com `generate_series`.
**Você aprende:** SQL analítico de verdade.

### Etapa 7 — WebSocket
Hub, clientes, broadcast a partir do serviço de pedidos.
**Você aprende:** goroutines, channels, `sync.Mutex` — o coração do Go.

### Etapa 8 — Frontend
`api/cliente.ts`, os módulos de API, o hook de WebSocket, e adaptar os hooks existentes.
Uma página de cada vez, começando por Cardápio e terminando por Pedidos/Cozinha.

### Etapa 9 — Migração dos dados
Rodar export + import, conferir os totais.

### Etapa 10 — Deploy
Dockerfile, banco no Neon, API no Fly.io, front no Vercel apontando pra API.

---

## 12. Decisões de projeto e o porquê

**Dinheiro em centavos (`int64`), nunca `float`.**
`0.1 + 0.2` não dá `0.3` em ponto flutuante. Num sistema financeiro isso vira centavos sumindo
no relatório do mês. A v1 usa `number` para preços; a v2 corrige. Regra: o backend fala
centavos do banco até o JSON, e **só a formatação na tela divide por 100**.

**Um pacote por domínio, não uma pasta por camada.**
Existe a alternativa de `models/`, `repositories/`, `handlers/`. Ela parece organizada, mas
espalha cada funcionalidade por 4 pastas distantes. Por domínio, tudo que é de pedidos está
em `internal/pedidos/`. Em Go essa é a convenção mais comum.

**`internal/` não é decoração.**
É uma regra do compilador: nada fora do módulo consegue importar de `internal/`. Marca
explicitamente o que é detalhe interno.

**A validação mora no `modelo.go`, não no handler.**
Assim vale para qualquer entrada — HTTP hoje, e o comando de importação amanhã.

**O serviço recebe a transação como parâmetro.**
`func (s *Servico) Criar(ctx context.Context, tx pgx.Tx, ...)`. É o que permite compor
operações (gravar pedido + venda + log) numa unidade atômica. Se o serviço abrisse a própria
transação, isso seria impossível.

**Sem ORM no começo.**
Escrever o SQL na mão é justamente o que você quer aprender aqui. Depois, se quiser reduzir
boilerplate, olhe **sqlc** (gera Go tipado a partir do seu SQL) antes de pensar em GORM.

---

## Referências

- [Go by Example](https://gobyexample.com/) — a melhor referência rápida de sintaxe
- [Effective Go](https://go.dev/doc/effective_go) — as convenções da linguagem
- [Documentação do pgx](https://pkg.go.dev/github.com/jackc/pgx/v5)
- [Como estruturar aplicações Go](https://go.dev/doc/modules/layout) — oficial
- [Use case for WebSockets em Go — coder/websocket](https://pkg.go.dev/github.com/coder/websocket)
