# ============================================
# Stage 1: Install dependencies
# ============================================
FROM node:22-slim AS dependencies
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    corepack enable pnpm && \
    pnpm install --frozen-lockfile --dangerously-allow-all-builds

# ============================================
# Stage 2: Build Next.js (standalone mode)
# ============================================
FROM node:22-slim AS builder
WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# ensure .env is present (Next.js reads it for NEXT_PUBLIC_* vars)
RUN test -f .env || { echo "ERROR: .env is required for build"; exit 1; }

ENV NODE_ENV=production
RUN --mount=type=cache,target=/app/.next/cache \
    corepack enable pnpm && pnpm build

# ============================================
# Stage 3: Minimal production image
# ============================================
FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

# copy production assets (standalone bundles runtime deps)
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

# writable .next for prerender cache at runtime
RUN chown node:node .next

USER node
CMD ["node", "server.js"]
