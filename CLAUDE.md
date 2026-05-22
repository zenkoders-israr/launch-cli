# CLAUDE.md — launch-cli (zen)

## Project Overview

**launch-cli** is a NestJS scaffolding CLI (`zen` binary) that generates fully configured, production-ready NestJS backends interactively. It's a generator tool — not a framework — that produces zero-dead-code projects from Handlebars templates based on user selections.

- **Binary:** `zen` (invoked as `launch server`)
- **Node.js:** ≥20.0.0, npm ≥9.0.0
- **Language:** TypeScript 5.3
- **Template engine:** Handlebars 4.7

---

## Repository Structure

```
boiler-plate/
├── src/                        # CLI source (TypeScript)
│   ├── bin/zen.ts              # Entry point, command registration (Commander.js)
│   ├── generator/
│   │   ├── engine.ts           # Template walker + Handlebars compiler
│   │   └── post-generate.ts    # git init, npm install, husky setup
│   ├── prompts/questions.ts    # @clack/prompts interactive questions
│   └── types/config.types.ts   # ProjectConfig interface
├── templates/                  # NestJS project templates (.hbs files)
│   ├── src/
│   │   ├── _ddd/               # DDD architecture templates
│   │   └── _modular/           # Modular architecture templates
│   ├── _docker/                # Dockerfile + docker-compose
│   ├── _prisma/                # Prisma schema + service
│   ├── _typeorm/               # TypeORM config + migrations
│   ├── _drizzle/               # Drizzle config + schema
│   ├── _cicd/                  # GitHub Actions workflow
│   ├── .husky/                 # pre-commit + pre-push hooks
│   ├── .nvmrc                  # Node.js version pin (20)
│   ├── package.json.hbs        # Dependency manifest (conditional)
│   ├── .env.example.hbs        # Environment variable template
│   ├── tsconfig.json.hbs       # TypeScript config with path aliases
│   ├── Makefile.hbs            # Common dev commands
│   └── README.md.hbs           # Auto-generated project README
├── dist/                       # Compiled output
├── package.json
└── tsconfig.json
```

---

## CLI Commands

```bash
npm run build        # Compile TypeScript → dist/
npm run dev          # Run CLI via ts-node (dev mode)
npm run start        # Run compiled CLI from dist/
npm run lint         # ESLint check
npm run format       # Prettier format
```

---

## How the Generator Works

### 1. Entry Point — `src/bin/zen.ts`
Registers `launch server` command via Commander.js. Calls `questions.ts` for prompts, then `engine.ts` for generation, then `post-generate.ts` for post-setup.

### 2. Prompt System — `src/prompts/questions.ts`
Uses `@clack/prompts` for a terminal TUI. Prompts are conditional (e.g., queue only appears if Redis is chosen). Returns a `ProjectConfig` object.

### 3. Template Engine — `src/generator/engine.ts`
- Walks `templates/` recursively
- Resolves Handlebars `.hbs` files using `ProjectConfig` context
- **Prefix-based conditional inclusion:** files/dirs prefixed with `_featureName` are only copied when that feature is selected (see Prefix System below)
- Transparent wrappers: `_docker/` → `./`, `_cicd/` → `.github/`
- Binary files (.png, .woff, etc.) copied as-is
- Path traversal protection + project name regex validation

### 4. Post-Generation — `src/generator/post-generate.ts`
Runs sequentially after file generation:
1. `git init` + creates `main` branch
2. `npm install` / `yarn install` / `pnpm install` with spinner
3. Husky setup (`npx husky install`)
4. Initial commit: `chore: initial scaffold via launch-cli`

---

## ProjectConfig Type — `src/types/config.types.ts`

The central config object passed to all Handlebars templates:

```typescript
interface ProjectConfig {
  projectName: string;
  database: 'postgres' | 'mongodb' | 'supabase';
  orm: 'typeorm' | 'prisma' | 'drizzle' | 'mongoose';
  architecture: 'modular' | 'ddd';

  // Auth
  auth: 'jwt' | 'jwt-refresh' | 'api-key' | 'none';
  oauthProviders: ('google' | 'github')[];   // [] when not selected
  rbac: boolean;
  twoFactor: boolean;

  // Cache & Queue
  cache: 'redis' | 'in-memory' | 'none';
  queue: 'bullmq' | 'none';

  // Mailer
  mailer: 'nodemailer' | 'resend' | 'none';
  emailTemplate: 'handlebars' | 'ejs' | 'html' | null;
  smtp: boolean;

  // Storage
  storage: 's3' | 'cloudinary' | 'none';

  // Payments
  stripe: boolean;

  // Notifications
  fcm: boolean;    // Firebase Cloud Messaging
  sms: boolean;    // Twilio SMS

  // Multi-tenancy
  multiTenancy: 'row-level' | 'none';

  // Infra / DevOps
  docs: 'swagger' | 'swagger-scalar';
  testing: 'unit' | 'unit-e2e' | 'none';
  socket: boolean;
  docker: boolean;
  cicd: boolean;
  packageManager: 'npm' | 'yarn' | 'pnpm';
}
```

---

## Prefix System (Conditional File Inclusion)

Files and directories prefixed with `_name` are included only when the corresponding feature is selected:

| Prefix | Condition |
|---|---|
| `_ddd` | architecture === "ddd" |
| `_modular` | architecture === "modular" |
| `_auth` | auth !== "none" |
| `_jwt` | auth is "jwt" or "jwt-refresh" |
| `_refresh` | auth === "jwt-refresh" |
| `_apikey` | auth === "api-key" |
| `_oauth` | oauthProviders.length > 0 |
| `_rbac` | rbac === true |
| `_2fa` | twoFactor === true |
| `_redis` | cache === "redis" OR queue === "bullmq" |
| `_bullmq` | queue === "bullmq" |
| `_mailer` | mailer !== "none" |
| `_emailhbs` | emailTemplate === "handlebars" |
| `_emailejs` | emailTemplate === "ejs" |
| `_emailhtml` | emailTemplate === "html" |
| `_typeorm` | orm === "typeorm" |
| `_prisma` | orm === "prisma" |
| `_drizzle` | orm === "drizzle" |
| `_mongoose` | orm === "mongoose" |
| `_s3` | storage === "s3" |
| `_cloudinary` | storage === "cloudinary" |
| `_stripe` | stripe === true |
| `_fcm` | fcm === true |
| `_twilio` | sms === true |
| `_multitenancy` | multiTenancy !== "none" |
| `_socket` | socket === true |
| `_docker` | docker === true |
| `_cicd` | cicd === true |
| `_test` | testing !== "none" |
| `_e2e` | testing === "unit-e2e" |
| `_scalar` | docs === "swagger-scalar" |

File prefix is stripped from the final filename (e.g., `_2fa.two-factor.service.ts` → `two-factor.service.ts`).

### Directory → output path mapping

| Template dir | Output path |
|---|---|
| `_docker/` | `./` |
| `_cicd/` | `.github/` |
| `_ddd/` | `src/` |
| `_modular/` | `src/` |
| `_typeorm/` | `src/database/` |
| `_prisma/` | `prisma/` |
| `_drizzle/` | `src/database/` |
| `_redis/` | `infrastructure/cache/redis/` |
| `_bullmq/` | `infrastructure/queue/bullmq/` |
| `_mailer/` | `infrastructure/mail/` |
| `_s3/` | `infrastructure/storage/` |
| `_cloudinary/` | `infrastructure/storage/` |
| `_stripe/` | `infrastructure/payments/stripe/` |
| `_fcm/` | `infrastructure/notifications/fcm/` |
| `_twilio/` | `infrastructure/notifications/twilio/` |
| `_auth/` | `modules/auth/` |
| `_socket/` | `modules/socket/` |
| `_multitenancy/` | `modules/multitenancy/` |

---

## Handlebars Custom Helpers

| Helper | Usage | Description |
|---|---|---|
| `eq` | `{{#if (eq orm "prisma")}}` | Strict equality |
| `ne` | `{{#if (ne auth "none")}}` | Not equal |
| `or` | `{{#if (or a b)}}` | Logical OR |
| `and` | `{{#if (and a b)}}` | Logical AND |
| `isTrue` | `{{#if (isTrue socket)}}` | Boolean true check |
| `includes` | `{{#if (includes oauthProviders "google")}}` | Array includes |
| `camel` | `{{camel projectName}}` | camelCase |
| `pascal` | `{{pascal projectName}}` | PascalCase |
| `upper` | `{{upper projectName}}` | UPPER_CASE |

---

## Generated Project: Full Feature Set

| Category | Options |
|---|---|
| Database | PostgreSQL, MongoDB, Supabase |
| ORM/ODM | TypeORM, Prisma, Drizzle, Mongoose |
| Architecture | Modular, DDD |
| Auth | JWT, JWT+Refresh, API Key, None |
| OAuth | Google, GitHub (multiselect, requires JWT auth) |
| RBAC | Yes/No — generates Role enum, @Roles() decorator, RolesGuard |
| 2FA / TOTP | Yes/No — generates TwoFactorService, TOTP endpoints, QR code setup |
| Cache | Redis (ioredis + Redis-backed throttling), In-Memory, None |
| Queue | BullMQ (with job deduplication helpers), None |
| Mailer | Nodemailer (SMTP), Resend, None |
| Email Templates | Handlebars, EJS, Plain HTML |
| File Storage | AWS S3, Cloudinary, None |
| Payments | Stripe — checkout sessions, subscriptions, signed webhook handler |
| Push Notifications | Firebase FCM — single, multicast, topic-based |
| SMS | Twilio — plain SMS, OTP, Twilio Verify integration |
| Multi-tenancy | Row-level isolation (x-tenant-id header + AsyncLocalStorage) |
| API Docs | Swagger UI, Swagger + Scalar UI |
| Real-time | Socket.io with auth guard |
| Testing | Unit (Jest), Unit + E2E (supertest), None |
| Docker | Multi-stage Dockerfile + docker-compose with Prisma migrate service |
| CI/CD | GitHub Actions → EC2 deploy |
| Package Manager | npm, yarn, pnpm |

---

## Generated Project Architecture

### Modular Architecture (`_modular`)
Feature-based, best for smaller teams:

```
src/
├── config/                  # App, DB, env validation configs
├── common/                  # Shared utilities
│   ├── decorators/          # @Public(), @CurrentUser(), @Roles(), @TenantId()
│   ├── filters/             # HttpExceptionFilter
│   ├── guards/              # JwtAuthGuard, RolesGuard
│   ├── interceptors/        # ResponseInterceptor
│   ├── middleware/          # RequestIdMiddleware, rawBodyMiddleware (Stripe)
│   ├── helpers/             # ok() response helper
│   └── pipes/               # PaginationDto
├── modules/                 # Feature modules
│   ├── auth/                # Auth + OAuth + 2FA
│   ├── user/                # User management
│   ├── health/              # Health checks
│   ├── multitenancy/        # Tenant entity, service, middleware (if enabled)
│   └── socket/              # WebSocket gateway (if enabled)
├── infrastructure/          # Shared singleton services
│   ├── cache/redis/         # Redis module + service
│   ├── queue/bullmq/        # BullMQ module + processors + deduplication helpers
│   ├── mail/                # Mailer module + service + templates
│   ├── storage/             # S3 or Cloudinary module + service
│   ├── payments/stripe/     # StripeService + webhook controller
│   ├── notifications/fcm/   # FcmService (Firebase push)
│   ├── notifications/twilio/# TwilioService (SMS + Verify)
│   ├── database/            # ORM config (Prisma/TypeORM)
│   └── scheduler/cron/      # Cron module
└── integrations/            # Third-party API integrations
```

---

## Generated Project: Key Patterns

### Standard API Response
All endpoints return via `ResponseInterceptor`:
```json
{ "status": 200, "message": "Success", "data": {} }
```

### Error Response (HttpExceptionFilter)
```json
{ "status": 400, "message": "Validation failed", "data": null }
```

### Security Stack (bootstrap)
1. `app.enableShutdownHooks()` — graceful SIGTERM drain
2. Helmet (security headers)
3. Compression (gzip)
4. CORS (whitelist from `CORS_ORIGINS` env)
5. RequestIdMiddleware (UUID v4 tracing)
6. ValidationPipe (whitelist, forbid unknown, auto-transform)
7. Global error filter + response interceptor
8. ThrottlerGuard — Redis-backed when Redis selected, in-memory otherwise

### TypeScript Path Aliases (generated project)
```json
"@config/*"         → "src/config/*"
"@modules/*"        → "src/modules/*"
"@infrastructure/*" → "src/infrastructure/*"
"@common/*"         → "src/common/*"   (modular)
"@shared/*"         → "src/shared/*"   (ddd)
"@interfaces/*"     → "src/interfaces/*" (ddd)
```

---

## New Feature: OAuth / Social Login

- **Files:** `strategies/google.strategy.ts`, `strategies/github.strategy.ts`, `oauth.controller.ts`
- **Routes:** `GET /api/v1/auth/oauth/google` → redirect, `GET /api/v1/auth/oauth/google/callback`
- **Flow:** Passport OAuth20 → calls `authService.upsertUser()` → returns JWT tokens
- **Env vars:** `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` (+ GitHub equivalents)
- **Condition:** Only generated when auth is JWT or JWT+Refresh AND oauthProviders is non-empty

## New Feature: RBAC

- **Files:** `common/decorators/roles.decorator.ts`, `common/guards/roles.guard.ts`
- **Usage:** `@Roles(Role.ADMIN)` on a controller/route, combined with `@UseGuards(RolesGuard)`
- **Roles:** `admin`, `user`, `moderator` (extend the `Role` enum as needed)
- **User entity:** Gets `role: 'admin' | 'user' | 'moderator'` field when RBAC is enabled
- **Global guard:** Registered as `APP_GUARD` in AuthModule — no need to apply per-controller

## New Feature: 2FA / TOTP

- **Files:** `two-factor.service.ts`, `two-factor.controller.ts`
- **Routes:**
  - `GET /api/v1/auth/2fa/setup` — generates TOTP secret + QR code data URL
  - `POST /api/v1/auth/2fa/enable` — verifies code and enables 2FA
  - `DELETE /api/v1/auth/2fa/disable` — verifies code and disables 2FA
- **Libraries:** `otplib` (TOTP), `qrcode` (QR PNG data URL)
- **User entity:** Gets `twoFactorEnabled: boolean` + `twoFactorSecret: string | null` fields

## New Feature: Stripe Payments

- **Files:** `infrastructure/payments/stripe/`
  - `stripe.service.ts` — checkout sessions, subscriptions, customer management, signature verification
  - `stripe-webhook.controller.ts` — handles `checkout.session.completed`, subscription events, payment failures
  - `common/middleware/raw-body.middleware.ts` — captures raw body for webhook signature verification
- **Key methods:** `createCheckoutSession()`, `createSubscriptionSession()`, `createCustomer()`, `cancelSubscription()`, `constructWebhookEvent()`
- **Env vars:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- **Important:** Register `rawBodyMiddleware` on `/webhooks/stripe` in bootstrap for signature verification to work

## New Feature: Firebase Cloud Messaging (FCM)

- **Files:** `infrastructure/notifications/fcm/`
  - `fcm.service.ts` — single device, multicast, topic-based push
- **Key methods:** `sendToDevice()`, `sendMulticast()`, `sendToTopic()`, `subscribeToTopic()`, `unsubscribeFromTopic()`
- **Env vars:** `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
- **Notes:** `FIREBASE_PRIVATE_KEY` must have `\n` escaped as `\\n` in .env file

## New Feature: Twilio SMS

- **Files:** `infrastructure/notifications/twilio/`
  - `twilio.service.ts` — plain SMS, OTP sending, Twilio Verify managed flow
- **Key methods:** `sendSms()`, `sendOtp()`, `startVerification()`, `checkVerification()`
- **Env vars:** `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`, `TWILIO_VERIFY_SERVICE_SID`
- **Twilio Verify vs manual OTP:** Use `startVerification`/`checkVerification` (Verify service) when you want Twilio to manage OTP storage + expiry. Use `sendOtp` when you manage the code yourself.

## New Feature: Multi-tenancy (Row-level)

- **Files:** `modules/multitenancy/`
  - `tenant.middleware.ts` — reads `x-tenant-id` header, binds to `AsyncLocalStorage`
  - `tenant.context.ts` — `getCurrentTenantId()` callable from any service
  - `tenant.decorator.ts` — `@TenantId()` controller param decorator
  - `tenant.service.ts` — stub service (replace with ORM repository)
  - `tenant.controller.ts` — `POST /tenants`, `GET /tenants/:id`
- **User entity:** Gets `tenantId: string` field
- **Pattern:** Register `TenantMiddleware` in `AppModule.configure()` for all API routes. Each service calls `getCurrentTenantId()` to scope queries.

---

## Bug Fixes Applied

| Fix | File(s) Changed |
|---|---|
| Graceful shutdown (`enableShutdownHooks`) | `_modular/main.ts.hbs`, `_ddd/main.ts.hbs` |
| `.nvmrc` (Node 20 pin) | `templates/.nvmrc` |
| `engines` field in package.json | `templates/package.json.hbs` |
| Redis-backed rate limiting | `app.module.ts.hbs`, `package.json.hbs` |
| Refresh token blacklist entity + service | `modules/_auth/entities/token-blacklist.entity.ts`, `token-blacklist.service.ts` |
| BullMQ job deduplication | `infrastructure/_bullmq/queue.helpers.ts`, updated processor |
| Prisma migrate race condition in Docker | `_docker/docker-compose.yml.hbs` (added `migrate` service) |

---

## Adding a New Generator Feature

1. Add option to `ProjectConfig` in `src/types/config.types.ts`
2. Add prompt in `src/prompts/questions.ts`
3. Create template files prefixed with `_featureName` in `templates/`
4. Add prefix → condition mapping in `shouldInclude()` in `src/generator/engine.ts`
5. Add directory → output path in `resolveFileName()` in `src/generator/engine.ts`
6. Add conditional dependency blocks in `templates/package.json.hbs`
7. Add env vars to `templates/.env.example.hbs`
8. Wire module import in `templates/src/_modular/app.module.ts.hbs`

---

## Key Dependencies (CLI)

| Package | Purpose |
|---|---|
| `commander` 12 | CLI argument parsing |
| `@clack/prompts` 0.7 | Terminal TUI prompts |
| `handlebars` 4.7 | Template rendering |
| `fs-extra` 11 | File system utilities |
| `chalk` 5.3 | Terminal colors |
| `ora` 8 | Spinner UI |

---

## Important Notes

- **No dead code in generated projects** — unused features are never written to disk
- **YAML escaping** in CI/CD templates preserves `${{ secrets.X }}` GitHub Actions syntax
- **Binary files** (.png, .jpg, .woff, etc.) are copied as-is, never processed as Handlebars
- **Supabase** uses raw PostgreSQL connection string (not the Supabase JS client)
- **In-memory cache** is single-instance only, not suitable for distributed deployments
- **Socket.io** namespace is hardcoded to `"socket"` in templates
- **Rate limiting** uses Redis store when Redis is selected, in-memory otherwise
- **Prisma migrations** run in a separate `migrate` docker-compose service before the app starts
- **Stripe webhooks** require `rawBodyMiddleware` on `/webhooks/stripe` — do not use global JSON body parser on that route
- **FCM `FIREBASE_PRIVATE_KEY`** — must escape newlines as `\\n` in .env files
- **Multi-tenancy middleware** must be registered in `AppModule.configure()` for all API routes
- **RBAC RolesGuard** is registered as `APP_GUARD` globally — use `@Roles()` to restrict, no `@UseGuards` needed per-route
