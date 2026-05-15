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

# ensure .env.docker is present and Next.js can read it as .env
RUN test -f .env.docker || { echo "ERROR: .env.docker is required for build"; exit 1; }
RUN cp .env.docker .env

ENV NODE_ENV=production
ENV PATH="/app/node_modules/.bin:${PATH}"
RUN --mount=type=cache,target=/app/.next/cache \
    next build

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
