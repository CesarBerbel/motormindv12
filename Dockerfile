# ============================================================
# Produção — imagem multi-stage otimizada
# ============================================================
FROM node:22-alpine AS base

# Dependências do sistema
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# ── Deps ────────────────────────────────────────────────────
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production --ignore-scripts

# ── Builder ─────────────────────────────────────────────────
FROM base AS builder
COPY package*.json ./
RUN npm ci --ignore-scripts

COPY . .
COPY .env.example .env.local

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npx prisma generate
RUN npm run build

# ── Runner ──────────────────────────────────────────────────
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
