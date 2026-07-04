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
| Messaging | WhatsApp Business Cloud API (real Graph API integration) + a limited-capability AI assistant (Claude) |
| Jobs | Vercel Cron (daily appointment reminders — Hobby plan caps cron frequency at once/day, see below) + inline synchronous processing of inbound WhatsApp messages — no background worker process, by design |
| Billing | Stripe Checkout + Billing Portal + webhooks |
| Storage | S3-compatible object storage (MinIO locally) |
| Deployment | Single Vercel project (both `apps/web` and `apps/api`, the latter as a serverless function). Docker Compose and Kubernetes manifests are also provided for self-hosting. GitHub Actions CI runs unit/e2e/Playwright tests either way. |

## Monorepo layout

```
apps/
  api/        NestJS backend (REST API)
  web/        Next.js frontend (dashboard) + Playwright e2e suite (apps/web/e2e)
packages/
  database/   Prisma schema, generated client, seed script, shared permission map
k8s/          Kubernetes manifests (Deployment/Service/Ingress/HPA)
.github/      CI workflow (unit + e2e API tests, Playwright web e2e)
docker-compose.yml
```

## Module status: deep vs. thin

This build prioritized a small set of modules built to real production depth, with the remaining
modules implemented as genuine, working features at a simpler level rather than placeholders.
Every tier has a real Prisma schema, real REST endpoints with RBAC + tenant isolation, and a real
UI wired to live data — "thin" just means the business logic and screen are simpler.

**Deep** (multi-step workflows, validation, business rules):
Auth & multi-tenancy, Dashboard/Analytics, Patients & EHR, Appointments (day/week/month calendar,
drag-to-reschedule, status workflow, waitlist), Doctors, Departments, Medical Records (SOAP notes),
Prescriptions, Billing (invoices, payments, insurance claims), **WhatsApp Business integration**
(real Meta Cloud API webhook + send, Vercel-Cron-driven appointment reminders, a
limited-capability AI assistant), **Stripe subscription billing** (Checkout, Billing Portal,
webhooks).

**Thin** (functional CRUD + status workflow, simpler UI):
Laboratory, Radiology, Inventory, internal staff chat, message templates, Reports & CSV export,
Staff management, Audit Logs.

**Not implemented in this pass** (documented, not faked): push notification delivery, digital
consent-form e-signing, medical certificate generation, AI features beyond the WhatsApp assistant
(e.g. AI-generated medical note summarization inside the doctor workspace, AI-optimized scheduling).

## The WhatsApp bot and its AI assistant

SMS support was removed entirely (per product decision) in favor of a real WhatsApp integration:

- **Real protocol, not a simulation.** `apps/api/src/whatsapp` talks to the actual Meta WhatsApp
  Business Cloud API — webhook signature verification, the verify-token handshake, and outbound
  `sendText`/`sendTemplate` calls that hit `graph.facebook.com`. With no phone number configured
  for a clinic (the seeded demo tenant ships with `isActive: false`), sends are logged as
  `SIMULATED` instead of silently failing, so the rest of the product works end-to-end without a
  live Meta account.
- **Serverless-native, not a background-worker architecture.** The whole app (both `apps/web` and
  `apps/api`) runs as a single Vercel project, and Vercel's Node.js functions can't host a
  persistent process — so there's no BullMQ/Redis queue and no `@nestjs/schedule` cron job.
  Instead: incoming WhatsApp messages are processed inline, synchronously, inside the webhook's
  POST handler (`apps/api/src/whatsapp/whatsapp-inbound.service.ts`) before it acks Meta, guarded
  against Meta's own delivery retries by a dedup check on the inbound message's WhatsApp message
  id. Reminders run from `GET /cron/reminders` (`apps/api/src/reminders`), triggered daily at
  08:00 UTC by [Vercel Cron](https://vercel.com/docs/cron-jobs) (configured in
  `apps/api/vercel.json`) and authenticated via a `CRON_SECRET` bearer token; each appointment's
  `reminderSentAt` is set *before* the send so a re-triggered/overlapping run can't double-send.
  Once/day is a Hobby plan limit (Vercel rejects anything more frequent) — upgrade to Pro and
  change the cron schedule in `vercel.json` for hourly reminders instead.
- **The AI assistant is deliberately limited**, per the product requirement: it can only (1)
  answer general clinic FAQ (hours/address/phone, pulled from the tenant record) and (2) look up
  the *matched* patient's own upcoming appointments — read-only, and only ever that one patient's
  data, because the tool that exposes appointments is only offered to the model once the inbound
  phone number has already been matched server-side. It cannot book, reschedule, cancel, or give
  medical advice; anything outside its two tools gets a short "a staff member will follow up"
  reply instead of a model-generated answer. With no `ANTHROPIC_API_KEY` configured, it degrades
  to that same handoff message rather than erroring.
- **Configure it** from the dashboard under Settings → WhatsApp Bot (or `PATCH /whatsapp/config`):
  phone number ID, access token, and an AI-bot on/off toggle. The webhook URL to paste into your
  Meta App is shown right there in the UI.
- All of this was verified live in this repo's own dev environment: a real Postgres instance, a
  simulated Meta webhook payload posted with `curl`, and confirmation that the message was
  logged, the patient was matched by phone number, and the AI bot's graceful-degradation
  path fired correctly with no API key configured (see `git log` for the session this was built in
  if you want the exact commands).

## Patient portal (public clinic search + self-service booking)

A second, deliberately separate front door into the platform for patients (not clinic staff):

- **Public clinic directory** (`GET /public/clinics`, `/public/clinics/:slug`, `/public/clinics/:slug/doctors/:id/availability`)
  — unauthenticated, cross-tenant search by clinic name/address/specialty. Only ever returns
  `ACTIVE` tenants and a hand-picked set of safe fields (never a doctor's email, phone, or
  password hash) — this is the one deliberate exception to the "always scope by tenantId" rule
  everywhere else in the API, so it's implemented in its own module
  (`apps/api/src/patient-portal`) rather than bolted onto the staff-facing controllers.
- **Patient accounts are a separate identity from staff `User`s and from clinic-scoped `Patient`
  records.** A `PatientAccount` (`packages/database` schema) is global — the same person can
  search and book with several different clinics — and a `PatientAccountLink` joins it to the
  normal tenant-scoped `Patient` row created the first time they book with a given clinic. Staff
  never see anything different: a portal-originated patient looks exactly like any other patient
  in the clinic's UI.
- **A completely separate JWT.** `PatientJwtStrategy`/`PatientJwtAuthGuard` use their own secret
  (`JWT_PATIENT_SECRET`) — a patient token is rejected by every staff endpoint and a staff token
  is rejected by every patient endpoint, verified by an actual cross-token test, not just code
  review.
- **Booking reuses `AppointmentsService.create()`** (the same conflict-checking staff booking
  goes through) rather than duplicating slot-conflict logic, but never returns that method's
  staff-shaped result directly — the public response is re-selected down to a safe subset of
  fields before going back over the wire.
- **Self-service bookings still respect the clinic's plan limits**: booking with a new clinic for
  the first time creates a `Patient` row, which still counts against that clinic's Starter/
  Professional/Enterprise patient cap (see "Pricing & plan limits" below).
- **Frontend**: `/find-a-clinic` (search), `/clinics/[slug]` (profile + doctor list),
  `/clinics/[slug]/book/[doctorId]` (date/slot picker), `/patient/login` + `/patient/register`,
  `/patient/appointments` ("my bookings" across every clinic) — all under
  `apps/web/src/app/(patient)`, with their own auth context/token storage
  (`lib/patient-auth-context.tsx`, `lib/patient-api-client.ts`) kept separate from the staff
  dashboard's.
- **Served from its own subdomain, not folded into the clinic-facing site.** The patient portal
  and the clinic app/marketing site are the same Next.js deployment but are kept on separate hosts
  by `apps/web/src/middleware.ts`, which routes purely on the `Host` header: the patient subdomain
  (`NEXT_PUBLIC_PATIENT_HOST`, e.g. `care.mbnhealth.com`) only ever serves `/find-a-clinic`,
  `/clinics/*` and `/patient/*` — any other path there redirects to `/find-a-clinic` — while the
  main app domain redirects those same paths *away* to the patient subdomain instead of rendering
  them inline. The two products never appear on the same page or even the same domain.
  - **Local dev**: visit `http://care.localhost:3000` — Chromium/Firefox resolve any `*.localhost`
    host to `127.0.0.1` automatically, no `/etc/hosts` edit needed. `next.config.mjs`'s
    `allowedDevOrigins` has to explicitly list `care.localhost`, otherwise `next dev`'s
    cross-origin asset protection 404s every `_next/static` request from that host (a dev-only
    restriction — production builds aren't affected).
  - **Production**: point a real subdomain's DNS at the same Vercel project as the main app and
    add it as a Domain in that Vercel project's settings (Vercel supports multiple domains per
    project, so this does **not** require a second Vercel project or deployment) — provisioning
    that DNS record is outside what this environment can do; see the "demo.mbnhealth.com" caveat
    earlier in this README for the same reason. Set `NEXT_PUBLIC_PATIENT_HOST` to that subdomain
    on the `apps/web` project, and make sure `CORS_ORIGIN` on the `apps/api` project lists **both**
    the main app origin and the patient-portal origin (comma-separated) — the patient portal calls
    the same API cross-origin.
- Verified end-to-end in this repo's dev environment: searched for a clinic, opened its profile,
  picked an available slot, created a patient account mid-flow (the slot selection survives the
  register-and-return trip via the URL, not component state), confirmed the booking, and checked
  it appears correctly in the clinic staff's own Appointments calendar via the staff API.

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
# Edit .env — at minimum set DATABASE_URL to a real Postgres instance.
# WhatsApp, Anthropic and Stripe keys are all optional for local dev: every
# integration degrades gracefully (simulated sends / handoff replies / a
# clear "not configured" error) when its key is missing.
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

## Connecting real WhatsApp, AI and Stripe (optional)

Everything below is optional for local development — the app works fully without any of it,
just with sends/checkouts simulated or clearly rejected instead of silently succeeding.

**WhatsApp Business Cloud API** — create an app at
[developers.facebook.com/apps](https://developers.facebook.com/apps), add the WhatsApp product,
and set:
- `WHATSAPP_WEBHOOK_VERIFY_TOKEN` / `WHATSAPP_APP_SECRET` in your API's environment (platform-wide)
- the phone number ID + access token per clinic, from Settings → WhatsApp Bot in the app itself
- your webhook URL (shown in that same settings page) in the Meta App's WhatsApp configuration
- an approved message template named `appointment_reminder` in Meta Business Manager — required
  because WhatsApp only allows template messages outside the 24h customer-service window, which
  is exactly the case for a reminder sent ahead of an appointment

**AI assistant** — set `ANTHROPIC_API_KEY` (and optionally `ANTHROPIC_MODEL`, default
`claude-sonnet-5`) in the API's environment. No per-tenant configuration needed.

**Stripe subscriptions** — set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and the three
`STRIPE_PRICE_ID_*` variables, then point a Stripe webhook at
`POST /api/v1/billing/subscription/webhook` for `checkout.session.completed` and
`customer.subscription.*` events. Clinic owners then see working "Upgrade" buttons under
Settings → Billing.

## Running with Docker

```bash
docker compose up --build
```

This starts Postgres, MinIO, the API (port 4000) and the web app (port 3000). Run
migrations once the API container is healthy:

```bash
docker compose exec api node node_modules/.bin/prisma migrate deploy --schema packages/database/prisma/schema.prisma
```

(Docker builds were authored against the documented Next.js "standalone output" + npm-workspaces
pattern and validated via `next build`/`nest build` locally in this environment; the actual
`docker build` could not be executed here because no Docker daemon was available in this sandbox —
validate it once on a machine with Docker before shipping.)

## Testing

```bash
npm run test --workspace=apps/api          # unit tests (Jest)
npm run test:e2e --workspace=apps/api      # API e2e tests against a real Postgres DB
npm run test:e2e --workspace=apps/web      # Playwright browser e2e tests
```

All three suites pass against live infrastructure as of this build:
- **API unit tests** (18): auth/RBAC guards, appointment conflict/status-transition logic,
  invoice/payment math, WhatsApp send dry-run/live branching and token-masking, AI bot
  graceful-degradation.
- **API e2e tests** (5): full app bootstrap against a real Postgres DB, auth flow, RBAC
  enforcement on a real endpoint.
- **Playwright web e2e tests** (19): login (success/failure/unauthenticated-redirect), every
  primary nav route renders without an error page, patient registration end-to-end, the
  appointments calendar's day/week/month view switch, and the WhatsApp settings screen. Tests
  authenticate once via a shared Playwright storage-state fixture (`apps/web/e2e/auth.setup.ts`)
  rather than logging in per test, both for speed and to avoid the login endpoint's own rate
  limiter. CI runs all three suites (`.github/workflows/ci.yml`), including a dedicated
  `e2e-web` job that builds both apps, boots them against a real Postgres service container,
  and runs Playwright against the live pages.

## Security notes

- Passwords hashed with Argon2id; refresh tokens stored as SHA-256 hashes, rotated on every use.
- RBAC enforced via a `PermissionsGuard` reading permissions embedded in the access token; every
  tenant-scoped query is filtered by `tenantId` taken from the authenticated user's JWT, never from
  client input, so one clinic cannot address another clinic's data by guessing an ID.
- MFA via TOTP (`otplib`) with recovery codes; Helmet + a global rate limiter (`@nestjs/throttler`)
  are applied API-wide, with a stricter limit on `/auth/login`.
- The WhatsApp webhook verifies Meta's `X-Hub-Signature-256` HMAC before trusting a payload
  (when `WHATSAPP_APP_SECRET` is set); the Stripe webhook verifies Stripe's signature via the
  official SDK before trusting an event. The WhatsApp access token is never returned to the
  frontend — only a masked preview (`getConfigForDisplay`).
- All mutating actions relevant to compliance (login, login failures, create/update/delete) are
  recorded in `AuditLog` with actor, IP, and user agent.
- This is a solid foundation, not a completed compliance program: a real launch still needs a
  third-party security review, encryption-at-rest configuration for the chosen Postgres/S3
  hosting, a written incident-response/backup policy, and a secrets manager in front of the
  WhatsApp access token and Stripe keys (currently plain environment variables / a DB column)
  before treating it as GDPR/HIPAA-ready.

## Deployment

**Primary target: Vercel, one project for both apps.**

- `apps/web` is a standard Next.js app — Vercel builds and serves it with no special config.
- `apps/api` deploys with Vercel's `nestjs` framework preset, which detects the standard
  `NestFactory.create(AppModule); await app.listen(process.env.PORT)` pattern in `src/main.ts` and
  wraps it into a serverless function automatically — no custom handler file needed.
  `src/config/configuration.ts` reads `process.env.PORT` first for exactly this reason (Vercel
  injects it; `API_PORT` is only the Docker/local-dev fallback). `apps/api/vercel.json` configures
  the daily reminders cron (Hobby plan limit — see above).
- If your Vercel project's Root Directory is set to `apps/api`, dependencies still install at the
  monorepo root (respecting npm workspaces), and a root `postinstall` script builds
  `packages/database` (Prisma client + compiled TS) first — required before anything importing
  `@mbn/database` can resolve. Set the same for a second Vercel project pointed at `apps/web`.
- Required env vars on the `apps/api` Vercel project: `DATABASE_URL`, `JWT_ACCESS_SECRET`,
  `JWT_REFRESH_SECRET`, `JWT_PATIENT_SECRET`, `CORS_ORIGIN` (comma-separated: the web app's URL
  **and** the patient-portal subdomain's URL — see "Patient portal" below), plus the
  WhatsApp/AI/Stripe/`CRON_SECRET` vars documented above as needed. Use a pooled connection string
  for `DATABASE_URL` (e.g. Neon, Supabase, or PgBouncer) — serverless functions open a new DB
  connection per cold start, and an unpooled Postgres will run out of connections under real
  traffic.
- There is deliberately no BullMQ/Redis queue and no in-process cron in this deployment target —
  see "The WhatsApp bot and its AI assistant" above for how reminders and inbound messages are
  handled instead.

**Alternative: self-hosting**, if you'd rather run this on infrastructure you control instead of
Vercel:
- `docker-compose.yml` for a single host — see "Running with Docker" below. Note the comment on the
  `api` service: without Vercel Cron, nothing calls `GET /cron/reminders` on a schedule, so add it
  to the host's crontab if you rely on WhatsApp reminders.
- `k8s/` contains Deployment/Service/HPA manifests for the API and web app, plus an example
  ConfigMap/Secret file and an Ingress with TLS via cert-manager. They assume you build and push
  `api`/`web` images to a registry the cluster can pull from, and manage secrets via your cluster's
  secret store rather than the example file. The same "nothing triggers `/cron/reminders`" caveat
  applies — add a `CronJob` manifest hitting that endpoint if you go this route.

## Pricing & plan limits

Three subscription tiers, each sized for a different clinic — sold on time saved, not features:

| | Starter | Professional | Enterprise |
|---|---|---|---|
| Fits | Solo doctor | Small clinic | Hospital / multi-branch |
| Price (MAD/mo) | 399 | 999 | Custom |
| Doctors | 1 | Up to 10 | Unlimited |
| Staff accounts | Up to 3 | Up to 30 | Unlimited |
| Patients | Up to 500 | Unlimited | Unlimited |
| WhatsApp | Basic messaging | AI assistant | Advanced AI assistant |
| Reports | Basic | Advanced analytics | Custom reports |
| Support | Basic | Priority | Dedicated account manager |

The limits are enforced, not just marketing copy:
- **Single source of truth:** `packages/database/src/plan-limits.ts` exports `PLAN_LIMITS` (per-plan
  `maxDoctors`/`maxStaff`/`maxPatients`, `null` = unlimited). The marketing/display copy in
  `apps/web/src/lib/pricing.ts` is kept in sync with it by hand — the API is authoritative.
- **Enforced server-side** by `PlanLimitsService` (`apps/api/src/common/plan-limits`), called from
  `DoctorsService.create`, `UsersService.create` and `PatientsService.create`. Exceeding a plan's
  limit returns `403 Forbidden` with an "upgrade your plan" message rather than silently succeeding.
  The `TRIAL` plan (used before a clinic picks a paid tier) gets Professional-level limits so
  prospects experience the full product before paying.
- **Not yet wired:** the Stripe `STRIPE_PRICE_ID_STARTER` / `_PROFESSIONAL` / `_ENTERPRISE`
  environment variables still need real Stripe Price objects created at the prices above (or
  whatever pricing you settle on) before checkout will work — see "Connecting real WhatsApp, AI and
  Stripe" above.

## Public demo environment (demo.mbnhealth.com)

For letting prospects click into a live, fully-populated clinic before talking to sales:

- **Seed data:** `packages/database/prisma/seed.ts` creates the `demo-clinic` tenant on the
  `PROFESSIONAL` plan with 14 patients, 30 appointments across every status, medical
  records/prescriptions, invoices in every status (`PAID`/`PARTIALLY_PAID`/`OVERDUE`) with insurance
  claims, lab/radiology orders, inventory, an internal staff chat thread, simulated WhatsApp
  conversation logs (including one AI-assisted reply), and audit log entries — every screen has
  something real to show. Re-run `npm run prisma:seed` any time to reset it back to this baseline
  (upserts, safe to run repeatedly).
- **One-click login:** the landing page's "Try the live demo" buttons link to
  `/login?clinic=demo-clinic`, which shows a one-click role picker (Owner/Manager/Receptionist/
  Doctor) that fills in the login form with the seeded demo credentials — no typing required.
- **What's *not* set up here:** provisioning the actual `demo.mbnhealth.com` DNS record and a
  dedicated Vercel project/domain alias requires access to the domain registrar and the Vercel
  account, which this environment does not have. To stand it up:
  1. Deploy a second Vercel project (or a Preview/Production domain alias on the existing one)
     pointed at a **separate** Postgres database seeded with the script above — don't point the
     public demo at the same database as real clinic data.
  2. Add `demo.mbnhealth.com` as a custom domain on that Vercel project and create the matching
     CNAME/A record with your DNS provider.
  3. Consider a nightly cron (e.g. a scheduled GitHub Action or Vercel Cron hitting a small reset
     endpoint) that re-runs the seed script against the demo database, so visitor edits don't
     accumulate or corrupt the demo over time.
  4. Skip real WhatsApp/Stripe credentials on the demo project — leave them unset so sends/checkouts
     stay in their existing "simulated" / "not configured" graceful-degradation paths instead of
     hitting real Meta or Stripe accounts from a public sandbox.
