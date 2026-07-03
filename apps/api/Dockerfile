# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:20-bookworm-slim AS builder
WORKDIR /repo

COPY package.json package-lock.json ./
COPY packages/database/package.json packages/database/package.json
COPY apps/api/package.json apps/api/package.json
RUN npm ci

COPY packages/database packages/database
COPY apps/api apps/api
COPY tsconfig.base.json ./

RUN npm run build --workspace=packages/database
RUN npm run build --workspace=apps/api

# ── Runtime stage ────────────────────────────────────────────────────────────
FROM node:20-bookworm-slim AS runner
WORKDIR /repo
ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY packages/database/package.json packages/database/package.json
COPY apps/api/package.json apps/api/package.json
RUN npm ci --omit=dev

COPY --from=builder /repo/packages/database/dist packages/database/dist
COPY --from=builder /repo/packages/database/generated packages/database/generated
COPY --from=builder /repo/packages/database/prisma packages/database/prisma
COPY --from=builder /repo/apps/api/dist apps/api/dist

EXPOSE 4000
CMD ["node", "apps/api/dist/main.js"]
