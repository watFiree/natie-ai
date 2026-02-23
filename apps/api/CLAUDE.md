# CLAUDE.md — apps/api

Development guidelines for Claude Code when working in the `apps/api` package.

## Tech Stack

- **Runtime:** Node.js 22, TypeScript 5.9 (ES2022, ESM)
- **Framework:** Fastify 5 with `fastify-type-provider-zod`
- **Database:** PostgreSQL via Prisma 7 (`@prisma/adapter-pg`)
- **Validation:** Zod 4
- **AI:** LangChain (`@langchain/core`, `@langchain/openai`, `langchain`)
- **Auth:** WorkOS (`@workos-inc/node`), session cookie `wos-session`
- **API Docs:** Fastify Swagger + Swagger UI at `/docs`

## Key Rules

### 1. Route schemas are mandatory

Every route **must** declare a `schema` object with:
- `body` / `querystring` / `params` — Zod schemas for all inputs
- `response` — Zod schemas for **every possible status code**

Minimum required status codes per route:
- `200` — success payload
- `401` — unauthenticated (all protected routes)
- `400` — bad input / business rule violation
- `404` — resource not found (where applicable)
- `429` — rate limited / lock conflict (where applicable)
- `500` — unexpected server error

**Example pattern:**

```ts
typedFastify.post(
  '/some-resource',
  {
    preHandler: authHandler,
    schema: {
      body: SomeRequestSchema,
      response: {
        200: SomeResponseSchema,
        400: ErrorResponseSchema,
        401: ErrorResponseSchema,
        404: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
  },
  async (req, reply) => {
    if (!req.user?.id) return reply.code(401).send({ error: 'Unauthorized' });
    try {
      // ...
    } catch (err) {
      req.log.error(err, 'Context for this operation');
      return reply.code(500).send({ error: 'Internal server error' });
    }
  }
);
```

Import `ErrorResponseSchema` from `../../common/schema` (already defined).

### 2. All async operations must be wrapped in try/catch

Every `await` that can throw — database queries, external API calls, token operations, agent invocations — must be inside a `try/catch` block. Do not let errors propagate unhandled.

```ts
try {
  const result = await someAsyncOperation();
  return reply.send(result);
} catch (err) {
  req.log.error(err, 'Descriptive context');
  return reply.code(500).send({ error: 'Internal server error' });
}
```

Exceptions: cleanup/release operations in `finally` blocks (e.g., releasing agent locks) — these may omit inner try/catch if already logged at call site.

### 3. Regenerate the frontend client after route changes

After any change to route paths, request/response schemas, or HTTP methods:

```bash
# From repo root — API server must be running on :3000
cd apps/web && pnpm generate:api
```

Or from root:

```bash
pnpm --filter web generate:api
```

This runs Orval against `http://localhost:3000/docs/json` and regenerates:
- `apps/web/lib/api/` — raw fetch clients
- `apps/web/lib/client/` — SWR hooks
- `apps/web/lib/api/models/` — TypeScript types

Do not manually edit generated files in those directories.

### 4. Never write migrations manually

Use the Prisma script to create migrations:

```bash
# From apps/api
pnpm db:migrate
# or
npx prisma migrate dev --name <descriptive_name>
```

After schema changes:

```bash
pnpm db:generate   # Regenerate the Prisma client
```

Never create or edit files in `prisma/migrations/` by hand.

## Project Structure

```
src/
├── index.ts                    # Server bootstrap, plugin + router registration
├── common/
│   ├── encryption.ts           # Token encrypt/decrypt helpers
│   └── schema.ts               # Shared Zod schemas: ErrorResponseSchema, MessageSchema
├── modules/
│   ├── auth/                   # WorkOS auth (router, handler, consts)
│   ├── chat/                   # Chat endpoints (GET /messages, POST /chat, POST /chat/stream)
│   ├── gmail/                  # Gmail OAuth + account management
│   ├── messages/               # MessageRepository + LangChain mapping helpers
│   ├── natie/                  # Supervisor agent service + system prompt
│   ├── x_account/              # X credentials management
│   ├── agent_lock/             # In-memory lock service (prevents concurrent agent runs)
│   └── db/                     # Fastify Prisma plugin
├── gateways/
│   └── telegram/               # Telegram bot gateway + settings routes
├── integrations/
│   ├── common/runner/          # AgentRunner (invoke + stream)
│   ├── gmail/                  # Gmail subagent + tools
│   └── x/                     # X subagent + tools
├── plugins/swagger/            # Swagger plugin registration
└── types/fastify.d.ts          # FastifyInstance/FastifyRequest augmentations
```

## Route Conventions

- Use `fastify.withTypeProvider<ZodTypeProvider>()` for every router function.
- Protected routes always start with `if (!req.user?.id) return reply.code(401).send(...)`.
- Schemas for routes belong in a co-located `schema.ts` inside the module directory.
- Shared schemas (errors, messages) live in `src/common/schema.ts`.
- Tag routes with `{ schema: { tags: ['module-name'] } }` to keep Swagger organized.

## Auth Pattern

```ts
// preHandler — validates wos-session cookie, populates req.user
preHandler: authHandler,
```

After `authHandler`, `req.user` is either a `User` object or `null`. Always guard with `if (!req.user?.id)`.

## Migrations Workflow

1. Edit `prisma/schema.prisma`
2. Run `pnpm db:migrate` — Prisma prompts for a migration name and creates the SQL file
3. Run `pnpm db:generate` — regenerates the Prisma client in `prisma/generated/prisma/`
4. Import generated types from `'../../../prisma/generated/prisma/client'`

## Running Locally

```bash
# From repo root
docker compose -f docker-compose.dev.yml up -d   # Start Postgres
cd apps/api
pnpm db:migrate                                   # Apply migrations
pnpm dev                                          # Start API on :3000
```

## Development Scripts

| Script | Purpose |
|--------|---------|
| `pnpm dev` | Start dev server (tsx watch) |
| `pnpm tsc` | Type-check without emitting |
| `pnpm db:migrate` | Create and apply new migration |
| `pnpm db:deploy` | Apply existing migrations (production) |
| `pnpm db:generate` | Regenerate Prisma client |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm format` | Format with Prettier |
