# launch-cli

> Production-grade NestJS backend generator
>
> Answer a few questions. Get a fully configured, deployable NestJS backend in under 2 minutes — with only the features you actually need.

[![npm version](https://img.shields.io/npm/v/launch-cli.svg)](https://www.npmjs.com/package/launch-cli)
[![npm downloads](https://img.shields.io/npm/dm/launch-cli.svg)](https://www.npmjs.com/package/launch-cli)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Commands](#commands)
- [Generating a Backend](#generating-a-backend)
- [What You Get — Always](#what-you-get--always)
- [What You Get — By Choice](#what-you-get--by-choice)
- [Feature Details](#feature-details)
- [First Steps After Generation](#first-steps-after-generation)

---

## Prerequisites

- **Node.js** 18 or higher
- **Git** installed and available on PATH
- One of: **pnpm**, **npm**, or **yarn**

---

## Installation

```bash
npm install -g launch-cli
```

Or run without installing:

```bash
npx launch-cli server
```

---

## Commands

| Command | Description |
|---|---|
| `launch server` | Start the interactive backend generator |
| `launch --version` | Print the CLI version |
| `launch --help` | Show all available commands |
| `launch help server` | Show options for the server command |

---

## Generating a Backend

```bash
launch server
```

The CLI walks you through **6 short sections**. Every question has a default — press Enter to accept it. At the end, a **summary screen** shows every choice before anything is written to disk.

After confirmation, the CLI automatically:
1. Generates the project into `./<project-name>/`
2. Detects and uses your selected package manager
3. Installs all dependencies
4. Runs `prisma generate` (if Prisma was selected)
5. Sets up Husky git hooks
6. Creates the initial git commit on `main`

### Section 1 — Project Basics

```
◆  Project name
◆  Node.js version    (fetched live from nodejs.org — pick from last 5 releases)
```

### Section 2 — Database

```
◆  Database           PostgreSQL · MongoDB · Supabase
◆  ORM / Query        Prisma · TypeORM · Drizzle · Mongoose
◆  Architecture       Modular (feature modules) · Domain-Driven Design
```

### Section 3 — Auth & Security

```
◆  Auth strategy      JWT + Refresh · JWT · API Key · None
◆  OAuth providers    Google · GitHub   (multiselect, requires JWT auth)
◆  Add RBAC?          Roles: admin / user / moderator
◆  Add 2FA / TOTP?    Google Authenticator, Authy
```

### Section 4 — Infrastructure

```
◆  Cache              Redis · In-memory · None
◆  Queue / Workers    BullMQ · None
◆  Mailer             Resend · Nodemailer (SMTP) · None
◆  Email templates    Handlebars · EJS · Plain HTML
◆  File storage       AWS S3 · Cloudinary · None
```

### Section 5 — Features

```
◆  Stripe payments?   Checkout sessions, subscriptions, signed webhook handler
◆  Firebase FCM?      Push notifications — mobile and web
◆  Twilio SMS?        SMS sending + OTP via Twilio Verify
◆  Multi-tenancy      Row-level isolation (x-tenant-id header)
```

### Section 6 — Developer Tools

```
◆  API docs           Swagger + Scalar UI · Swagger only
◆  Testing            Unit + E2E · Unit only · None
◆  WebSocket?         Socket.io with auth guard
◆  Docker?            Dockerfile + docker-compose
◆  CI/CD pipeline?    GitHub Actions → EC2 deploy
◆  Package manager    pnpm · npm · yarn
```

---

## What You Get — Always

Every generated project includes these out of the box:

| Feature | Detail |
|---|---|
| **NestJS 10 + TypeScript 5** | Strict mode, `nest build`, path aliases (`@config/*`, `@modules/*`, `@common/*`) |
| **Standard API response** | Every endpoint returns `{ status, message, data }` via global interceptor |
| **Global error handler** | All exceptions return `{ status, message, data: null }` consistently |
| **Rate limiting** | Redis-backed when Redis is selected · In-memory otherwise |
| **Security headers** | Helmet, CORS allowlist, gzip compression |
| **Request ID tracing** | `x-request-id` header generated and propagated through logs |
| **Env validation** | Joi schema — app refuses to start if any required variable is missing |
| **Structured logging** | Winston — JSON in production, pretty-print in development |
| **Health check** | `GET /api/v1/health` — DB, Redis (if used), memory, disk |
| **Graceful shutdown** | `enableShutdownHooks()` — drains in-flight requests on SIGTERM |
| **Cron jobs** | `@nestjs/schedule` pre-wired with example task |
| **Git hooks** | Husky v9 — pre-commit lints staged files, pre-push blocks `console.log` and commented-out code |
| **ESLint 9 + Prettier** | Auto-fixes on commit via lint-staged |
| **Node version pin** | `.nvmrc` + `engines` field in `package.json` set to your selected version |
| **`packageManager` field** | Corepack-compatible — version auto-detected at generation time |
| **`.env.example`** | Every variable documented with inline comments |
| **`Makefile`** | Shortcuts: `make dev`, `make build`, `make migrate`, `make seed`, `make docker-up` |
| **Swagger docs** | Auto-generated at `/api/docs` |
| **Versioned API** | All routes under `/api/v1/` |

---

## What You Get — By Choice

Only the files for your selections are generated. Nothing unused is ever written.

### Database & ORM

| Selection | What's generated |
|---|---|
| **PostgreSQL + Prisma** | `prisma/schema.prisma`, `PrismaService`, `PrismaModule`, seed script, `prisma generate` runs automatically |
| **PostgreSQL + TypeORM** | `typeorm.config.ts`, `DataSource`, migration scaffolding, seed script |
| **PostgreSQL + Drizzle** | `schema.ts`, `drizzle.config.ts`, migration scripts, seed script |
| **MongoDB + Mongoose** | `MongooseModule`, schema patterns, seed script |
| **Supabase** | PostgreSQL connection via `DATABASE_URL`, compatible with Prisma/TypeORM/Drizzle |

All ORM schemas include conditional columns — `role`, `twoFactorEnabled`, `tenantId` are added automatically based on your feature selections.

### Auth & Security

| Selection | What's generated |
|---|---|
| **JWT** | Register, login, forgot/reset/change password, `@Public()` decorator, `@CurrentUser()` decorator |
| **JWT + Refresh** | All of the above + refresh token rotation endpoint |
| **API Key** | `x-api-key` header validation via Passport HeaderAPIKey strategy |
| **OAuth — Google** | `GET /auth/oauth/google` + callback route + Google Passport strategy |
| **OAuth — GitHub** | `GET /auth/oauth/github` + callback route + GitHub Passport strategy |
| **RBAC** | `Role` enum (`admin`/`user`/`moderator`), `@Roles()` decorator, global `RolesGuard`, role embedded in JWT payload |
| **2FA / TOTP** | `GET /auth/2fa/setup` (QR code), `POST /auth/2fa/enable`, `DELETE /auth/2fa/disable` |

### Infrastructure

| Selection | What's generated |
|---|---|
| **Redis** | `RedisModule`, `RedisService`, health indicator, Redis-backed rate limiting |
| **BullMQ** | `QueueModule`, `EmailProcessor`, `enqueueUnique()` deduplication helper |
| **Nodemailer** | `MailService` with `sendWelcome()` and `sendPasswordReset()`, SMTP config |
| **Resend** | Same `MailService` interface via Resend API |
| **Handlebars templates** | `welcome.hbs`, `password-reset.hbs` |
| **EJS templates** | `welcome.ejs`, `password-reset.ejs` |
| **AWS S3** | `StorageService` — upload, download, presigned URLs |
| **Cloudinary** | `StorageService` — upload, transform, delete |

### Payments & Notifications

| Selection | What's generated |
|---|---|
| **Stripe** | `StripeService` (checkout, subscriptions, customer management) + webhook controller (signature-verified) |
| **Firebase FCM** | `FcmService` — send to device, multicast, topic broadcast, subscribe/unsubscribe |
| **Twilio SMS** | `TwilioService` — plain SMS, `sendOtp()`, `startVerification()` + `checkVerification()` (Twilio Verify) |

### Multi-tenancy

| Selection | What's generated |
|---|---|
| **Row-level isolation** | `TenantMiddleware` (reads `x-tenant-id` header), `AsyncLocalStorage` context, `TenantService`, `@TenantId()` param decorator |

All ORM schemas automatically include `tenantId` column when this is selected.

### DevOps

| Selection | What's generated |
|---|---|
| **Docker** | Multi-stage alpine `Dockerfile` (non-root `appuser`), `docker-compose.yml` with DB + Redis + Adminer, `.dockerignore` |
| **Docker + Prisma** | Extra `migrate` service in docker-compose that runs migrations before app starts |
| **CI/CD** | `.github/workflows/dev.yml` — lint → test → build → SCP to EC2 → SSH deploy |
| **Swagger + Scalar** | Modern Scalar UI at `/api/reference` in addition to Swagger at `/api/docs` |
| **WebSocket** | `AppGateway` (Socket.io), `WsJwtGuard`, `@WsCurrentUser()` decorator |
| **Unit tests** | Jest config with path alias mapping |
| **Unit + E2E tests** | Jest config + `test/jest-e2e.json` + Supertest |

---

## Feature Details

### Role-Based Access Control (RBAC)

```typescript
import { Roles, Role } from '@common/decorators/roles.decorator';

// Restrict to admin only
@Roles(Role.ADMIN)
@Get('dashboard')
getDashboard() { ... }

// Open to all authenticated users (no @Roles needed)
@Get('profile')
getProfile(@CurrentUser() user) { ... }

// Public — no auth required
@Public()
@Get('status')
getStatus() { ... }
```

### 2FA Setup

```
1. GET  /api/v1/auth/2fa/setup
   → returns { secret, qrCodeDataUrl }
   → user scans QR with Google Authenticator / Authy

2. POST /api/v1/auth/2fa/enable   { "code": "123456" }
   → 2FA enabled on the account

3. DELETE /api/v1/auth/2fa/disable { "code": "123456" }
   → 2FA disabled
```

### OAuth Flow

```
GET /api/v1/auth/oauth/google
  → redirects to Google consent screen

GET /api/v1/auth/oauth/google/callback
  → creates or retrieves user → returns { accessToken, refreshToken }

Same pattern for GitHub: /auth/oauth/github and /auth/oauth/github/callback
```

### Stripe Webhooks

The webhook controller at `POST /webhooks/stripe` verifies the Stripe signature automatically. Implement your business logic in the handler stubs:

```typescript
private async onCheckoutCompleted(session: Stripe.Checkout.Session) {
  // Fulfil order or activate subscription in your DB
}

private async onSubscriptionDeleted(subscription: Stripe.Subscription) {
  // Downgrade user plan
}
```

### Multi-tenancy

Every request carrying `x-tenant-id: <uuid>` has the tenant bound to the request context. Scope your queries with:

```typescript
import { getCurrentTenantId } from '@modules/multitenancy/tenant.context';

const tenantId = getCurrentTenantId(); // throws if header is missing
```

Or in controllers via the decorator:

```typescript
@Get('items')
getItems(@TenantId() tenantId: string) { ... }
```

### Health Endpoint

```
GET /api/v1/health

{
  "status": "ok",
  "info": {
    "database":     { "status": "up" },
    "redis":        { "status": "up" },   ← only when Redis selected
    "memory_heap":  { "status": "up" },
    "disk":         { "status": "up" }
  }
}
```

---

## First Steps After Generation

```bash
cd <project-name>

# 1. Copy and fill in environment variables
cp .env.example .env

# 2. Start the database and Redis (if Docker was selected)
make docker-up

# 3. Run database migrations
make migrate

# 4. Seed the initial admin user  (admin@example.com / Admin@123456)
make seed

# 5. Start the development server
make dev
```

Your API is now running at `http://localhost:3000/api/v1`

| URL | Description |
|---|---|
| `http://localhost:3000/api/v1/health` | Health check |
| `http://localhost:3000/api/docs` | Swagger UI |
| `http://localhost:3000/api/reference` | Scalar UI (if selected) |

### Available Make commands

```bash
make dev          # Start dev server with hot reload
make build        # Compile TypeScript → dist/
make start        # Run compiled production server
make test         # Run unit tests
make test-cov     # Run tests with coverage report
make lint         # Run ESLint
make format       # Run Prettier
make docker-up    # Start containers (DB, Redis, Adminer)
make docker-down  # Stop containers
make migrate      # Run database migrations
make migrate-gen  # Generate a new migration
make seed         # Seed database with initial data
make logs         # Tail container logs
```
