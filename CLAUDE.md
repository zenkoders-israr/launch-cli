# CLAUDE.md — launch-cli

## Project Overview

**launch-cli** is a NestJS scaffolding CLI (`zen` binary, `launch server` command) that generates fully configured, production-ready NestJS backends from Handlebars templates based on interactive user selections. It's a generator tool — not a framework.

- **Binary:** `zen` (invoked as `launch server`)
- **Node.js requirement:** ≥20.0.0, npm ≥9.0.0
- **Language:** TypeScript 5.3
- **Template engine:** Handlebars 4.7
- **Test coverage:** 5 combination builds verified green (TypeORM/JWT, Prisma/full, MongoDB/API-key, Drizzle/DDD, minimal)

---

## Repository Structure

```
boiler-plate/
├── src/                          # CLI source (TypeScript)
│   ├── bin/zen.ts                # Entry point — Commander.js command registration
│   ├── generator/
│   │   ├── engine.ts             # Template walker + Handlebars compiler + prefix system
│   │   └── post-generate.ts      # git init → install → prisma generate → husky → commit
│   ├── prompts/questions.ts      # @clack/prompts — 6 sections, summary screen
│   └── types/config.types.ts     # ProjectConfig interface
├── templates/                    # NestJS project templates (.hbs files)
│   ├── src/
│   │   ├── _ddd/                 # DDD architecture templates
│   │   └── _modular/             # Modular architecture templates
│   ├── _docker/                  # Dockerfile + docker-compose
│   ├── _prisma/                  # schema.prisma.hbs + seed.ts.hbs
│   ├── _typeorm/                 # TypeORM config + migration
│   ├── _drizzle/                 # Drizzle config + schema.ts.hbs
│   ├── _cicd/                    # GitHub Actions workflow
│   ├── .husky/                   # pre-commit + pre-push hooks
│   ├── .nvmrc.hbs                # Node version pin (from user selection)
│   ├── package.json.hbs          # Dependency manifest (all conditional)
│   ├── .env.example.hbs          # Environment variable template
│   ├── tsconfig.json.hbs         # TypeScript config with path aliases
│   ├── Makefile.hbs              # Common dev commands
│   └── README.md.hbs             # Auto-generated project README
├── test-generate.mjs             # Direct generation script (bypasses prompts)
├── test-combos.mjs               # Multi-combination build test runner
├── dist/                         # Compiled output
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

## ProjectConfig Type — `src/types/config.types.ts`

```typescript
interface ProjectConfig {
  projectName: string;
  nodeVersion: string;             // major only, e.g. "22" — from live nodejs.org fetch

  // Data layer
  database: 'postgres' | 'mongodb' | 'supabase';
  orm: 'typeorm' | 'prisma' | 'drizzle' | 'mongoose';
  architecture: 'modular' | 'ddd';

  // Auth
  auth: 'jwt' | 'jwt-refresh' | 'api-key' | 'none';
  oauthProviders: ('google' | 'github')[];  // [] when none selected
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

  // Payments & Notifications
  stripe: boolean;
  fcm: boolean;
  sms: boolean;

  // Multi-tenancy
  multiTenancy: 'row-level' | 'none';

  // Dev tools
  docs: 'swagger' | 'swagger-scalar';
  testing: 'unit' | 'unit-e2e' | 'none';
  socket: boolean;
  docker: boolean;
  cicd: boolean;
  packageManager: 'npm' | 'yarn' | 'pnpm';
}
```

---

## How the Generator Works

### 1. Entry Point — `src/bin/zen.ts`
Registers `launch server` via Commander.js → calls `questions.ts` → `engine.ts` → `post-generate.ts`.

### 2. Prompt System — `src/prompts/questions.ts`
- Fetches live Node.js releases from `https://nodejs.org/dist/index.json` (6s timeout, offline fallback)
- Splits questions into **6 visual sections** with chalk headers and `p.group`
- Shows a **summary confirmation screen** before generating
- `multiselect` for OAuth providers guards against cancel-symbol returns (`p.isCancel` check)

### 3. Template Engine — `src/generator/engine.ts`
- Walks `templates/` recursively
- Resolves Handlebars `.hbs` via `ProjectConfig` context
- **Prefix-based conditional inclusion** (see table below)
- `includes` helper works as both inline `{{#if (includes arr val)}}` and block `{{#includes arr val}}...{{/includes}}`
- Binary files copied as-is; YAML files have `${{ secrets.X }}` escaping
- Path traversal guard on all output paths

### 4. Post-Generation — `src/generator/post-generate.ts`
All steps use `spawn`-based async (event loop stays free → ora spinner animates):
1. `git init` + `git checkout -b main`
2. Detect package manager version via `process.execPath` (resolves nvm/fnm paths)
3. Patch `"packageManager"` field in `package.json` (Corepack requirement)
4. `pnpm install` / `npm install` / `yarn install`
5. `prisma generate` (only when `orm === 'prisma'`)
6. Husky v9 setup (`husky` binary, no `install` subcommand)
7. Initial commit (`--no-verify`)

---

## Prompt UI Structure (6 sections)

```
⚡ launch-cli  —  Production-ready NestJS backend generator

1/6  Project Basics     — name and runtime
  ◆  Project name
  ◆  Node.js version    (fetched live from nodejs.org)

2/6  Database          — storage engine and ORM
  ◆  Database
  ◆  ORM / Query builder
  ◆  Architecture

3/6  Auth & Security   — authentication and access control
  ◆  Auth strategy
  ◆  OAuth / Social login  (multiselect: Google, GitHub)
  ◆  Add RBAC?
  ◆  Add 2FA / TOTP?

4/6  Infrastructure    — cache, queues, mail, storage
  ◆  Cache layer
  ◆  Queue / Background workers
  ◆  Mailer
  ◆  Email template engine
  ◆  File storage

5/6  Features          — payments, notifications, multi-tenancy
  ◆  Stripe payments?
  ◆  Firebase push notifications?
  ◆  Twilio SMS?
  ◆  Multi-tenancy

6/6  Developer Tools   — docs, testing, docker, CI/CD
  ◆  API documentation
  ◆  Testing setup
  ◆  WebSocket?
  ◆  Docker?
  ◆  CI/CD?
  ◆  Package manager

[ Project Summary ] — confirmation screen before generation
```

---

## Prefix System (Conditional File Inclusion)

| Prefix | Condition | Output name |
|---|---|---|
| `_ddd` | architecture === "ddd" | transparent (contents → `src/`) |
| `_modular` | architecture === "modular" | transparent (contents → `src/`) |
| `_auth` | auth !== "none" | `auth/` |
| `_jwt` | auth is "jwt" or "jwt-refresh" | stripped |
| `_refresh` | auth === "jwt-refresh" | stripped |
| `_apikey` | auth === "api-key" | stripped |
| `_oauth` | oauthProviders.length > 0 | stripped |
| `_rbac` | rbac === true | stripped |
| `_2fa` | twoFactor === true | stripped |
| `_redis` | cache === "redis" OR queue === "bullmq" | `cache/redis/` |
| `_bullmq` | queue === "bullmq" | `queue/bullmq/` |
| `_mailer` | mailer !== "none" | `mail/` |
| `_emailhbs` | emailTemplate === "handlebars" | `templates/` |
| `_emailejs` | emailTemplate === "ejs" | `templates/` |
| `_emailhtml` | emailTemplate === "html" | `templates/` |
| `_typeorm` | orm === "typeorm" | `src/database/` |
| `_prisma` | orm === "prisma" | `prisma/` |
| `_drizzle` | orm === "drizzle" | `src/database/` |
| `_mongoose` | orm === "mongoose" | stripped |
| `_s3` | storage === "s3" | `storage/` |
| `_cloudinary` | storage === "cloudinary" | `storage/` |
| `_stripe` | stripe === true | `payments/stripe/` |
| `_fcm` | fcm === true | `notifications/fcm/` |
| `_twilio` | sms === true | `notifications/twilio/` |
| `_multitenancy` | multiTenancy !== "none" | `multitenancy/` |
| `_socket` | socket === true | `socket/` |
| `_docker` | docker === true | transparent (→ `./`) |
| `_cicd` | cicd === true | transparent (→ `.github/`) |
| `_test` | testing !== "none" | stripped |
| `_e2e` | testing === "unit-e2e" | stripped |
| `_scalar` | docs === "swagger-scalar" | stripped |

File prefix strip list (in `resolveFileName`): `refresh`, `jwt`, `apikey`, `smtp`, `test`, `e2e`, `scalar`, `supabase`, `postgres`, `mongodb`, `prisma`, `typeorm`, `drizzle`, `mongoose`, `oauth`, `rbac`, `2fa`, `stripe`, `fcm`, `twilio`, `multitenancy`, `redis`

---

## Handlebars Custom Helpers (`src/generator/engine.ts`)

| Helper | Usage | Notes |
|---|---|---|
| `eq` | `{{#if (eq orm "prisma")}}` | Strict equality, works as block |
| `ne` | `{{#if (ne auth "none")}}` | Not equal, works as block |
| `or` | `{{#if (or a b)}}` | Logical OR, block only |
| `and` | `{{#if (and a b)}}` | Logical AND, block only |
| `isTrue` | `{{#if (isTrue socket)}}` | Boolean true check, works as block |
| `includes` | `{{#includes oauthProviders "google"}}` | Array includes — works as **both** inline and block helper |
| `camel` | `{{camel projectName}}` | camelCase conversion |
| `pascal` | `{{pascal projectName}}` | PascalCase conversion |
| `upper` | `{{upper projectName}}` | UPPER_CASE conversion |

**Critical note on `includes`:** Must support both inline `{{#if (includes arr val)}}` and block `{{#includes arr val}}...{{/includes}}` modes. Using it as a block helper without this dual support renders `false` as a literal string.

---

## Generated Project Features

| Category | Options |
|---|---|
| Node.js version | User-selected from live nodejs.org feed — sets `.nvmrc`, `engines`, Dockerfile |
| Database | PostgreSQL, MongoDB, Supabase |
| ORM/ODM | TypeORM, Prisma, Drizzle, Mongoose |
| Architecture | Modular (feature-based), DDD (domain layers) |
| Auth | JWT, JWT+Refresh, API Key, None |
| OAuth | Google, GitHub (passport-google-oauth20 / passport-github2) |
| RBAC | `Role` enum (admin/user/moderator), `@Roles()` decorator, global `RolesGuard` |
| 2FA/TOTP | `otplib` + `qrcode` — setup/enable/disable endpoints with QR code |
| Cache | Redis (`redisStore` API), In-memory, None |
| Rate limiting | Redis-backed when Redis selected (`@nest-lab/throttler-storage-redis`) |
| Queue | BullMQ with job deduplication helper (`enqueueUnique`) |
| Mailer | Nodemailer (SMTP), Resend |
| Email templates | Handlebars, EJS, Plain HTML |
| File storage | AWS S3, Cloudinary |
| Payments | Stripe — checkout, subscriptions, signature-verified webhooks |
| Push notifications | Firebase FCM — single, multicast, topic, subscribe/unsubscribe |
| SMS | Twilio — plain SMS, OTP, Twilio Verify managed flow |
| Multi-tenancy | Row-level isolation — `x-tenant-id` header + `AsyncLocalStorage` |
| API docs | Swagger UI, Swagger + Scalar UI |
| WebSocket | Socket.io with JWT auth guard |
| Testing | Unit (Jest), Unit+E2E (Jest+Supertest) |
| Docker | Multi-stage alpine Dockerfile + docker-compose (with Prisma migrate service) |
| CI/CD | GitHub Actions → EC2 (lint → test → build → SCP → SSH deploy) |
| Git hooks | Husky v9 — pre-commit (lint-staged) + pre-push (no console.log, no commented code) |

---

## Generated Project: Key Patterns

### Standard API Response
Every endpoint returns via `ResponseInterceptor`:
```json
{ "status": 200, "message": "Success", "data": {} }
```

### Bootstrap Order (main.ts)
1. `enableShutdownHooks()` — graceful SIGTERM drain
2. `rawBody: true` — enabled when Stripe is selected (webhook signature verification)
3. Helmet, compression, CORS
4. `RequestIdMiddleware` (UUID v4 tracing)
5. `ValidationPipe` (whitelist, forbid unknown, auto-transform)
6. Global error filter + response interceptor
7. `ThrottlerGuard` — Redis-backed when Redis selected, in-memory otherwise

### RBAC Flow
- `Role` enum in `common/decorators/roles.decorator.ts`
- `RolesGuard` registered as `APP_GUARD` globally
- JWT payload includes `role` field → strategy merges into user object
- Usage: `@Roles(Role.ADMIN)` on any route — no `@UseGuards` needed

### 2FA Flow
1. `GET /auth/2fa/setup` → returns secret + QR code data URL
2. `POST /auth/2fa/enable` → verifies TOTP code, sets `twoFactorEnabled: true`
3. `DELETE /auth/2fa/disable` → verifies TOTP code, disables

### Stripe Webhook
- `rawBody: true` in NestJS factory (enables raw body buffer)
- Webhook controller calls `stripeService.constructWebhookEvent(req.rawBody, sig)`
- Handles: `checkout.session.completed`, subscription updates/deletions, payment failures

### Multi-tenancy
- `TenantMiddleware` reads `x-tenant-id` header → binds to `AsyncLocalStorage`
- Any service calls `getCurrentTenantId()` to scope queries
- `@TenantId()` param decorator for controllers
- User entity has `tenantId` field in all ORM schemas

---

## ORM Schema Files (Conditional with Handlebars)

These are `.hbs` files so they can conditionally include fields:

| File | Conditionals |
|---|---|
| `_prisma/schema.prisma.hbs` | `Role` enum + role field (rbac), twoFactor fields (twoFactor), tenantId (multiTenancy) |
| `_prisma/seed.ts.hbs` | `import { Role }` + seed role + seed tenantId placeholder |
| `_drizzle/schema.ts.hbs` | `pgEnum('role')` + role column (rbac), boolean fields (twoFactor), tenantId (multiTenancy) |
| `_typeorm/migrations/*.ts.hbs` | role column (rbac), 2FA columns (twoFactor), tenantId column (multiTenancy) |

---

## Known Working Combinations (Build-Verified)

| Combo | Stack | Status |
|---|---|---|
| C1 | postgres + typeorm + modular + jwt | ✔ |
| C2 | postgres + prisma + modular + jwt-refresh + rbac + 2fa + redis + bullmq + resend + s3 + stripe + multitenancy + e2e | ✔ |
| C3 | mongodb + mongoose + modular + api-key + in-memory + nodemailer + cloudinary | ✔ |
| C4 | postgres + drizzle + ddd + jwt + redis + bullmq + fcm + sms | ✔ |
| C5 | postgres + prisma + modular + no-auth (minimal) | ✔ |

---

## Bug Fixes Log (Chronological)

| Fix | File(s) |
|---|---|
| Graceful shutdown missing (`enableShutdownHooks`) | `main.ts.hbs` (modular + DDD) |
| `.nvmrc` hardcoded to 20 | Converted to `.nvmrc.hbs` using `{{nodeVersion}}` |
| `engines` field missing from `package.json` | `package.json.hbs` |
| Redis rate limiting was in-memory | Added `@nest-lab/throttler-storage-redis` when Redis selected |
| Token blacklist used TypeORM in all projects | Prefixed `_typeorm.token-blacklist.*` — only generated with TypeORM |
| BullMQ `queue.add` generic type too strict | Changed to `Queue<any>` |
| Prisma migrate race condition in Docker | Added `migrate` service to `docker-compose.yml.hbs` |
| `npm install` spinner frozen (event loop blocked) | Switched from `execSync` to async `spawn`-based `run()` |
| `npm install` failing in nvm environments | `resolvePackageManagerBin()` derives path from `process.execPath` |
| Corepack pnpm error (missing `packageManager` field) | Detect version, patch `package.json` before install |
| `includes` block helper renders `false` literal | Rewrote to support both inline and block modes |
| `redis.health.ts` always generated | Renamed to `_redis.redis.health.ts` + added `redis` to prefix strip list |
| `common/guards/index.ts` exports JwtAuthGuard when auth=none | Converted to `.hbs`, conditional export |
| `JwtModule` imported for api-key auth | Wrapped in `{{#or (eq auth "jwt") (eq auth "jwt-refresh")}}` |
| `JwtService` used in auth.service for api-key auth | `generateTokens` + its calls wrapped in JWT conditional |
| `cache-manager-ioredis-yet` API changed | `createKeyv` → `redisStore` (modular + DDD templates) |
| `body-parser` import in Stripe middleware | Removed; using NestJS `rawBody: true` instead |
| Stripe `apiVersion` outdated | Updated to `'2025-02-24.acacia'` |
| `dotenv` missing from TypeORM/Drizzle projects | Added `"dotenv": "^16.4.7"` to `package.json.hbs` |
| `@types/multer` missing for Cloudinary | Added to devDeps when `storage === cloudinary` |
| DDD auth controller import paths wrong (1 level short) | Fixed all 3 relative imports (`../../` → `../../../`) |
| DDD `ValueObject<T extends Record<string, unknown>>` too strict | Changed to `ValueObject<T = any>` |
| RBAC fields missing from all ORM schemas | Added conditional role column to Prisma/Drizzle/TypeORM schema templates |
| Prisma seed `role: "admin"` type mismatch | Import `Role` from `@prisma/client`, use `Role.admin` |
| Prisma seed missing `tenantId` when multiTenancy enabled | Added `tenantId: '00000000-...'` placeholder |
| `User` interface missing 2FA/role fields | Added `twoFactorEnabled?`, `twoFactorSecret?`, `tenantId?`, `role` to interface |
| OAuth `oauthProviders` null in summary | Guard `p.isCancel(val)` check on multiselect result |

---

## Adding a New Feature

1. Add type to `ProjectConfig` in `src/types/config.types.ts`
2. Add prompt in `src/prompts/questions.ts` (correct section, conditional if dependent)
3. Create template files prefixed `_featureName` in `templates/`
4. Add prefix → condition in `shouldInclude()` in `src/generator/engine.ts`
5. Add directory → output path in `resolveFileName()` in `src/generator/engine.ts`
6. Add prefix to the filename strip regex in `resolveFileName()`
7. Add conditional deps to `templates/package.json.hbs`
8. Add env vars to `templates/.env.example.hbs`
9. Wire module import in `templates/src/_modular/app.module.ts.hbs`
10. Run `node test-combos.mjs` to verify no regressions

---

## Testing Generated Projects

```bash
# Direct generation (bypasses prompts) — edit config object inside
node test-generate.mjs

# Multi-combination build verifier — runs 5 preset stacks
node test-combos.mjs
```

---

## Important Notes

- **No dead code** — unused features are never written to disk
- **YAML escaping** — `${{ secrets.X }}` GitHub Actions syntax is preserved in CI/CD templates
- **Binary files** — `.png`, `.jpg`, `.woff` etc. copied as-is, never processed as Handlebars
- **Supabase** — uses raw PostgreSQL connection string, not the Supabase JS client
- **In-memory cache** — single-instance only, not suitable for distributed deployments
- **Redis rate limiting** — automatically switches to `ThrottlerStorageRedisService` when Redis is selected
- **Prisma migrate** — runs in a separate docker-compose `migrate` service before the app starts
- **Stripe webhooks** — require `rawBody: true` in `NestFactory.create()` (auto-set when stripe is selected)
- **FCM `FIREBASE_PRIVATE_KEY`** — must escape newlines as `\\n` in .env files
- **Husky v9** — initializes with `husky` (no `install` subcommand); `prepare` script is `"husky"` not `"husky install"`
- **ORM schemas** — `schema.prisma`, `schema.ts` (Drizzle), and TypeORM migrations are `.hbs` files so they can use Handlebars conditionals for role/2FA/tenantId fields
- **`includes` helper** — must be used as a block helper in templates, not inline, for array checks on config arrays like `oauthProviders`
