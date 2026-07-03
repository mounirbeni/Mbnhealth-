# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:20-bookworm-slim AS builder
WORKDIR /repo

COPY package.json package-lock.json ./
COPY packages/database/package.json packages/database/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm ci

COPY packages/database packages/database
COPY apps/web apps/web
COPY tsconfig.base.json ./

ARG NEXT_PUBLIC_API_URL=http://localhost:4000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build --workspace=packages/database
RUN npm run build --workspace=apps/web

# ── Runtime stage (Next.js standalone output) ───────────────────────────────
FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /repo/apps/web/public ./apps/web/public
COPY --from=builder /repo/apps/web/.next/standalone ./
COPY --from=builder /repo/apps/web/.next/static ./apps/web/.next/static

EXPOSE 3000
CMD ["node", "apps/web/server.js"]
