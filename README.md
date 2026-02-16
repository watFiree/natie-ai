# Natie AI

Natie AI is a self-hostable personal assistant platform built as a TypeScript monorepo.  
It combines a Next.js web app with a Fastify API that runs agent workflows for chat, Gmail, X (Twitter), and Telegram.

## What this project does

Natie AI provides:

- A **main assistant endpoint** (`/natie/chat`) that can delegate to specialized subagents.
- **Email integration** via Gmail OAuth (connect/list/remove accounts).
- **X integration** via user-provided `auth_token` and `ct0` credentials.
- **Telegram gateway** support (optional bot token) to chat with Natie from Telegram.
- **OpenAPI docs** at `/docs` and generated web clients via Orval.

> Current state: several integration setup flows are implemented in the web UI, while dedicated in-browser chat UIs for some modules are still scaffolded placeholders.

## Repository structure

This repository uses **pnpm workspaces** and **Turbo**.

- `apps/web` — Next.js 16 web app (port `5173`)
- `apps/api` — Fastify + Prisma + LangChain API (port `3000`)
- `packages/logger` — shared logger package with Jest tests
- `packages/eslint-config`, `packages/typescript-config`, `packages/jest-presets` — shared tooling packages

## Requirements

- Node.js **20+** (Node 22 is currently used in this repo environment)
- pnpm **10.10.0** (see root `packageManager`)
- PostgreSQL database reachable via `DATABASE_URL`
- API credentials for enabled integrations (WorkOS, OpenAI, Google, etc.)

## Configuration

For complete setup guidance, see: **https://docs.natie-ai.com**  
(Current in-app links still point to `https://docs.natie.ai`.)

### API environment variables (`apps/api`)

| Variable                 | Required                        | Purpose                                                                   |
| ------------------------ | ------------------------------- | ------------------------------------------------------------------------- |
| `DATABASE_URL`           | Yes                             | Prisma PostgreSQL connection string                                       |
| `OPENAI_API_KEY`         | Yes (for AI features)           | Used by LangChain `ChatOpenAI` models                                     |
| `ENCRYPTION_KEY`         | Yes                             | Encrypts stored sensitive credentials (tokens/cookies)                    |
| `WORKOS_API_KEY`         | Yes                             | WorkOS AuthKit integration                                                |
| `WORKOS_CLIENT_ID`       | Yes                             | WorkOS client identifier                                                  |
| `WORKOS_REDIRECT_URI`    | Yes                             | WorkOS callback URL                                                       |
| `WORKOS_COOKIE_PASSWORD` | Yes                             | Sealed session cookie key                                                 |
| `FRONTEND_URL`           | Recommended                     | CORS + redirect target (defaults to `http://localhost:5173`)              |
| `APP_BASE_URL`           | Recommended                     | OpenAPI server URL shown in Swagger (defaults to `http://localhost:3000`) |
| `GOOGLE_CLIENT_ID`       | Needed for Gmail integration    | Google OAuth client ID                                                    |
| `GOOGLE_CLIENT_SECRET`   | Needed for Gmail integration    | Google OAuth client secret                                                |
| `GOOGLE_REDIRECT_URI`    | Needed for Gmail integration    | Google OAuth callback URL                                                 |
| `GMAIL_PRIVATE_KEY`      | Needed for Gmail tool execution | Key used in Gmail tool calls                                              |
| `TELEGRAM_TOKEN`         | Optional                        | Enables Telegram bot gateway when set                                     |

### Web environment variables (`apps/web`)

| Variable               | Required    | Purpose                                                                      |
| ---------------------- | ----------- | ---------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_HOST` | Recommended | API base URL used by web fetch clients (defaults to `http://localhost:3000`) |

## Getting started (Docker, recommended)

1. Install dependencies:

```bash
pnpm install
```

2. Run the setup entrypoint:

```bash
./setup.sh
```

`setup.sh` runs `scripts/setup-env.sh`, which:

- Reads keys from `.env.example`
- Prompts for every key (hidden input for sensitive keys)
- Uses defaults from `.env.example` when you press Enter
- Writes `.env` files to:
  - `./.env`
  - `./apps/api/.env`
  - `./apps/web/.env`
- Backs up existing `.env` files before overwriting
- Applies secure permissions (`chmod 600`) to generated `.env` files
- Starts Docker with `pnpm docker:up` (`docker compose --env-file .env up --build`)

3. Open:

- Web app: `http://localhost:5173`
- API docs: `http://localhost:3000/docs`

4. Stop containers:

```bash
pnpm docker:down
```

## Getting started (without Docker)

If you prefer running services directly:

1. Configure environment variables for `apps/api` and `apps/web`.
2. Prepare Prisma client and run migrations:

```bash
pnpm --filter api db:generate
pnpm --filter api db:migrate
```

3. Start the API:

```bash
pnpm --filter api dev
```

4. In another terminal, start the web app:

```bash
pnpm --filter web dev
```

## Usage examples

### 1) Start auth flow (browser redirect)

Open this in your browser to start WorkOS login:

```text
http://localhost:3000/auth/login
```

### 2) Ask Natie (invoke mode)

After authenticating (cookie `wos-session`), call:

```bash
curl -X POST "http://localhost:3000/natie/chat" \
  -H "Content-Type: application/json" \
  -H "Cookie: wos-session=<your-session-cookie>" \
  -d '{"message":"Summarize my inbox priorities for today","type":"invoke"}'
```

### 3) Ask Natie (stream mode / SSE)

```bash
curl -N -X POST "http://localhost:3000/natie/chat" \
  -H "Content-Type: application/json" \
  -H "Cookie: wos-session=<your-session-cookie>" \
  -d '{"message":"Give me a quick daily briefing","type":"stream"}'
```

### 4) Link X credentials

```bash
curl -X POST "http://localhost:3000/x-account/" \
  -H "Content-Type: application/json" \
  -H "Cookie: wos-session=<your-session-cookie>" \
  -d '{"authToken":"<auth_token>","ct0":"<ct0>"}'
```

## Build, lint, and test

From repository root:

```bash
pnpm build
pnpm lint
pnpm test
pnpm format:check
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution workflow, PR expectations, and checks.

## License

This repository is licensed under **Creative Commons Attribution-NonCommercial 4.0 International**.  
See [LICENSE](./LICENSE).

- Personal and other non-commercial use is allowed.
- Commercial use is not allowed without separate permission.

## Maintainer / contact

- Maintainer: [@watFiree](https://github.com/watFiree)
- General contact: `maintainers@natie.ai` _(placeholder until official public email is confirmed)_
