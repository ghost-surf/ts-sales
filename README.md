# TS Sales

Sistema de gestão de stock, vendas e faturação. Frontend em React + Vite + TypeScript
(shadcn-ui + Tailwind), com um backend Node.js próprio (Express + Prisma + MySQL) para
autenticação, catálogo, faturação/cotações, pagamentos e relatórios.

## Estrutura do repositório

```
.
├── src/            # Frontend (Vite/React)
└── server/         # Backend (Express + Prisma + MySQL)
```

## Pré-requisitos

- Node.js 18+
- MySQL 8+ (ou MariaDB) a correr localmente ou remoto

## Configurar o backend

```sh
cd server
cp .env.example .env
# edite .env: DATABASE_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, CORS_ORIGIN

npm install
npx prisma migrate dev   # cria as tabelas
npm run seed             # cria o utilizador admin e o catálogo inicial
npm run dev               # sobe a API em http://localhost:4000
```

Credenciais criadas pelo seed (definidas em `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` no `.env`):

- Email: `admin@carecatech.co.mz`
- Palavra-passe: `Admin1234`

`CORS_ORIGIN` no `.env` do backend tem de bater com o URL onde o frontend corre
(por omissão o Vite deste projeto usa `http://localhost:8080`, configurado em `vite.config.ts`).

## Configurar o frontend

```sh
npm install
# .env na raiz do projeto:
# VITE_API_URL="http://localhost:4000/api"
npm run dev
```

Abra `http://localhost:8080`. A app redireciona para `/auth` quando não autenticado.

## Arquitetura do backend

- **Auth**: JWT de acesso (curto, em memória no frontend) + refresh token rotativo
  guardado em cookie httpOnly. Palavras-passe com bcrypt.
- **Permissões**: rotas de gestão de catálogo (categorias/produtos/serviços/impostos)
  e utilizadores exigem papel `admin`; o resto está disponível para qualquer
  utilizador autenticado (`admin` ou `operador`).
- **Documentos (faturas/cotações)**: modelo unificado `Document` (`type: FACT|COT`),
  com numeração atómica por ano via tabela `Counter`. Emitir uma fatura debita o stock
  e regista um `StockMovement`; cancelar uma fatura emitida estorna o stock.
- **Pagamentos/recibos**: `Payment` + `PaymentDocument` permitem pagamentos que cobrem
  uma ou várias faturas (split); a fatura passa a `paid` quando o valor alocado cobre o total.
- **Relatórios**: `/api/reports/sales`, `/stock`, `/top-clients`, `/dashboard`.

## Scripts úteis (backend, em `server/`)

- `npm run dev` — API em modo desenvolvimento (watch)
- `npm run build` / `npm start` — build e execução em produção
- `npx prisma migrate dev` — aplicar alterações ao schema
- `npm run seed` — recriar dados iniciais (idempotente)

## Como editar este projeto

Este projeto é gerido através do [Lovable](https://lovable.dev/projects/304f41e3-0712-4e93-b58d-922b105a8a85)
para o frontend. Pode também clonar o repositório e trabalhar localmente com qualquer IDE —
os requisitos são apenas Node.js e, agora, uma instância MySQL para o backend.

## Tecnologias

- Vite, TypeScript, React, shadcn-ui, Tailwind CSS
- Express, Prisma, MySQL, JWT, bcrypt, zod
