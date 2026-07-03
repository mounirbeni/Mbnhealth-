# MBN Health

Enterprise SaaS clinic management platform: multi-tenant, role-based, built for real clinics.

Monorepo containing a NestJS API, a Next.js dashboard, and a shared Prisma/PostgreSQL data layer.

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, shadcn/ui-style components, Radix UI, Framer Motion, TanStack Query, TanStack Table, React Hook Form, Zod |
| Backend | NestJS, TypeScript, REST, Passport/JWT, class-validator |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT access + rotating refresh tokens, TOTP MFA, RBAC, session management |
| Storage | S3-compatible object storage (MinIO locally) |
| Cache/Queue | Redis (BullMQ wired in for future background jobs) |
| Deployment | Docker, Docker Compose, Kubernetes manifests, GitHub Actions CI |

## Monorepo layout

```
apps/
  api/        NestJS backend (REST API)
  web/        Next.js frontend (dashboard)
packages/
  database/   Prisma schema, generated client, seed script, shared permission map
k8s/          Kubernetes manifests (Deployment/Service/Ingress/HPA)
.github/      CI workflow
docker-compose.yml
```

## Module status: deep vs. thin

This build prioritized a small set of modules built to real production depth, with the remaining
modules implemented as genuine, working features at a simpler level rather than placeholders.
Both tiers have a real Prisma schema, real REST endpoints with RBAC + tenant isolation, and a real
UI wired to live data — "thin" just means the business logic and screen are simpler.

**Deep** (multi-step workflows, validation, business rules):
Auth & multi-tenancy, Dashboard/Analytics, Patients & EHR, Appointments (day/week/month calendar,
drag-to-reschedule, status workflow, waitlist), Doctors, Departments, Medical Records (SOAP notes),
Prescriptions, Billing (invoices, payments, insurance claims).

**Thin** (functional CRUD + status workflow, simpler UI):
Laboratory, Radiology, Inventory, Messaging (internal chat, templates, SMS/WhatsApp/Email send —
provider-agnostic with a console/log fallback when no provider is configured), Reports & CSV
export, Staff management, Audit Logs.

**Not implemented in this pass** (documented, not faked): AI features (medical note
summarization, appointment optimization, AI search/assistant), push notification delivery,
digital consent-form e-signing, medical certificate generation, full BullMQ background job
processors (the queue is wired into the API but no jobs are scheduled yet).

## Getting started (local development)

### Prerequisites

- Node.js 20+
- PostgreSQL 16 (or `docker compose up postgres`)
- npm 10+

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env — at minimum set DATABASE_URL to a real Postgres instance
```

### 3. Set up the database

```bash
npm run prisma:generate
npm run prisma:migrate      # creates the schema
npm run prisma:seed         # seeds a demo clinic with realistic data
```

### 4. Run the apps

```bash
npm run dev:api   # http://localhost:4000
npm run dev:web   # http://localhost:3000
```

### Demo login

The seed script creates one demo tenant (`demo-clinic`) with a user per role, all sharing the
password `Passw0rd!123`:

| Role | Email |
|---|---|
| Super Admin (platform) | `superadmin@mbnhealth.com` (no clinic URL needed at login) |
| Clinic Owner | `owner@demo-clinic.com` |
| Manager | `manager@demo-clinic.com` |
| Receptionist | `reception@demo-clinic.com` |
| Accountant | `accountant@demo-clinic.com` |
| Laboratory | `lab@demo-clinic.com` |
| Doctor | `dr.hicham@demo-clinic.com` |

Use clinic URL `demo-clinic` when logging in as any non-Super-Admin user.

## Running with Docker

```bash
docker compose up --build
```

This starts Postgres, Redis, MinIO, the API (port 4000) and the web app (port 3000). Run
migrations once the API container is healthy:

```bash
docker compose exec api node node_modules/.bin/prisma migrate deploy --schema packages/database/prisma/schema.prisma
docker compose exec api node -e "require('./packages/database/dist')" # sanity check
```

(Docker builds were authored against the documented Next.js "standalone output" + npm-workspaces
pattern and validated via `next build`/`nest build` locally in this environment; the actual
`docker build` could not be executed here because no Docker daemon was available in this sandbox —
validate it once in a machine with Docker before shipping.)

## Testing

```bash
npm run test --workspace=apps/api        # unit tests (Jest)
npm run test:e2e --workspace=apps/api    # e2e tests against a real Postgres DB
```

Both suites pass against a live database as of this build (backend: 13 unit tests + 5 e2e tests,
covering auth, RBAC guards, appointment conflict/status-transition logic, and invoice/payment
math). The frontend has no automated tests yet — it was verified with `tsc --noEmit`, `next build`,
and manual/Playwright-driven browser walkthroughs of every route.

## Security notes

- Passwords hashed with Argon2id; refresh tokens stored as SHA-256 hashes, rotated on every use.
- RBAC enforced via a `PermissionsGuard` reading permissions embedded in the access token; every
  tenant-scoped query is filtered by `tenantId` taken from the authenticated user's JWT, never from
  client input, so one clinic cannot address another clinic's data by guessing an ID.
- MFA via TOTP (`otplib`) with recovery codes; Helmet + a global rate limiter (`@nestjs/throttler`)
  are applied API-wide, with a stricter limit on `/auth/login`.
- All mutating actions relevant to compliance (login, login failures, create/update/delete) are
  recorded in `AuditLog` with actor, IP, and user agent.
- This is a solid foundation, not a completed compliance program: a real launch still needs a
  third-party security review, encryption-at-rest configuration for the chosen Postgres/S3
  hosting, and a written incident-response/backup policy before treating it as GDPR/HIPAA-ready.

## Deployment

- `docker-compose.yml` is meant for local/single-host use.
- `k8s/` contains Deployment/Service/HPA manifests for the API and web app, plus an example
  ConfigMap/Secret file and an Ingress with TLS via cert-manager. They assume you build and push
  `api`/`web` images to a registry the cluster can pull from, and manage secrets via your cluster's
  secret store rather than the example file.
- The API is stateless (JWT-based auth, no in-memory session state) so it scales horizontally
  behind a load balancer without sticky sessions.
