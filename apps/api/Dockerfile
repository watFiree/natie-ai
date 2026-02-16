FROM node:22-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable && corepack prepare pnpm@10.10.0 --activate

FROM base AS deps
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/web/package.json apps/web/package.json
COPY apps/api/package.json apps/api/package.json
COPY packages packages

RUN pnpm install --frozen-lockfile

FROM deps AS builder
WORKDIR /app

COPY . .

RUN NODE_OPTIONS="--max-old-space-size=4096" pnpm --filter api build

FROM base AS prod-deps
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/web/package.json apps/web/package.json
COPY apps/api/package.json apps/api/package.json
COPY packages packages

RUN pnpm install --frozen-lockfile --prod --filter api...

FROM node:22-alpine AS runner
WORKDIR /app/apps/api

ENV NODE_ENV=production
ENV HOST=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 fastify

COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=prod-deps /app/apps/api/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/apps/api/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/apps/api/package.json ./package.json

USER fastify

EXPOSE 3000

CMD ["node", "--import", "tsx", "dist/src/index.js"]
