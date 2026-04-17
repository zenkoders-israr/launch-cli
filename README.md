# launch-cli

> Production-grade NestJS scaffolding CLI
>
> Scaffold a fully configured, production-ready NestJS backend in under a minute — with your exact stack choices baked in.

[![npm version](https://img.shields.io/npm/v/launch-cli.svg)](https://www.npmjs.com/package/launch-cli)
[![npm downloads](https://img.shields.io/npm/dm/launch-cli.svg)](https://www.npmjs.com/package/launch-cli)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Table of Contents

- [What It Generates](#what-it-generates)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [CLI Commands](#cli-commands)
- [What Gets Asked](#what-gets-asked)
- [What Gets Generated](#what-gets-generated)
- [Development](#development)
- [Publishing to npm](#publishing-to-npm)
- [Project Structure (CLI)](#project-structure-cli)

---

## What It Generates

Every generated backend includes:

- ✅ NestJS 10 + TypeScript 5 with strict mode
- ✅ Standardized API response `{ status, message, data }` on every endpoint
- ✅ Complete auth flow — register, login, forgot/reset/change password, upsert user
- ✅ JWT guard with `@Public()` opt-out and `@CurrentUser()` decorator
- ✅ Global rate limiting + per-route throttle on auth endpoints
- ✅ Helmet, CORS allowlist, request ID tracing
- ✅ Joi env validation — app crashes early on missing config
- ✅ Winston structured logger (JSON in prod, pretty in dev)
- ✅ Health check endpoint — DB, Redis, memory, disk
- ✅ Cron jobs module pre-wired
- ✅ Husky pre-commit + pre-push hooks (blocks `console.log`, commented code, `.log` files)
- ✅ ESLint + Prettier + lint-staged
- ✅ Path aliases (`@config/*`, `@common/*`, `@modules/*`)
- ✅ `.env.example` with every variable documented inline
- ✅ `README.md` with full endpoint docs, env table, and setup guide

**Optional (prompted):**

| Feature | Options |
|---|---|
| Database | PostgreSQL · MongoDB · Supabase |
| ORM | TypeORM · Prisma · Drizzle · Mongoose |
| Architecture | Modular · Domain-Driven Design |
| Auth | JWT · JWT + Refresh · API Key · None |
| Cache | Redis · In-memory · None |
| Queue / Workers | BullMQ · None |
| Mailer | Nodemailer (SMTP) · Resend · None |
| Email templates | Handlebars · EJS · Plain HTML |
| File storage | AWS S3 · Cloudinary · None |
| API docs | Swagger · Swagger + Scalar |
| WebSocket | Socket.io with JWT auth guard |
| Testing | Unit · Unit + E2E · None |
| Docker | Dockerfile + docker-compose |
| CI/CD | GitHub Actions → EC2 deploy pipeline |
| Package manager | npm · yarn · pnpm |

---

## Prerequisites

- **Node.js** 20 or higher
- **npm** 9+ (or yarn / pnpm)
- **Git** (for auto git init on generated projects)

---

## Installation

### Option A — Install from npm (recommended)

```bash
npm install -g launch-cli
```

Verify:

```bash
launch --version
# 1.0.0

launch --help
```

### Option B — Run without installing (npx)

```bash
npx launch-cli server
```

### Option C — Clone and link locally (for contributors)

```bash
git clone <repo-url>
cd launch-cli

npm install
npm run build
npm link
```

---

## Usage

### Generate a new backend

```bash
launch server
```

The CLI will ask a series of questions, then:

1. Generate the full project into `./<project-name>/`
2. Install all dependencies automatically
3. Run `git init` + `npx husky install`
4. Create the initial commit

Once done:

```bash
cd <project-name>
cp .env.example .env
# Fill in your .env values

make docker-up   # start DB / Redis (if Docker was selected)
make migrate     # run migrations (if postgres was selected)
make seed        # seed initial data
make dev         # start dev server with hot reload
```

Server runs at `http://localhost:3000/api/v1`

---

## CLI Commands

| Command | Description |
|---|---|
| `launch server` | Scaffold a new NestJS backend |
| `launch --version` | Print CLI version |
| `launch --help` | Show help |
| `launch help server` | Show command-level help |

---

## What Gets Asked

The CLI walks you through a series of questions. Every question has a sensible default — just hit Enter to accept.

```
✔ Project name          › my-api
✔ Database              › PostgreSQL / MongoDB / Supabase
✔ ORM / Query builder   › TypeORM / Prisma / Drizzle / Mongoose
✔ Architecture          › Modular / Domain-Driven Design
✔ Auth strategy         › JWT / JWT + Refresh / API Key / None
✔ Cache layer           › Redis / In-memory / None
✔ Queue / Workers       › BullMQ / None
✔ Mailer                › Nodemailer / Resend / None
✔ Email template engine › Handlebars / EJS / Plain HTML
✔ Include SMTP config?  › Yes / No
✔ File storage          › AWS S3 / Cloudinary / None
✔ API documentation     › Swagger / Swagger + Scalar
✔ WebSocket?            › Yes / No
✔ Testing               › Unit / Unit + E2E / None
✔ Docker + compose?     › Yes / No
✔ CI/CD pipeline?       › Yes / No
✔ Package manager       › npm / yarn / pnpm
```

---

## What Gets Generated

Based on your answers, only the files relevant to your choices are written. Nothing unused is included.

### Always generated

```
<project-name>/
├── src/
│   ├── config/
│   │   ├── app.config.ts          # App + throttle + bcrypt config
│   │   ├── database.config.ts     # DB connection config
│   │   └── env.validation.ts      # Joi schema — validates all env vars on startup
│   ├── common/
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   ├── public.decorator.ts
│   │   │   └── api-paginated-response.decorator.ts
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts   # { status, message, data: null }
│   │   ├── helpers/
│   │   │   └── response.helper.ts         # ok(message, data) helper
│   │   ├── interceptors/
│   │   │   └── response.interceptor.ts    # { status, message, data }
│   │   ├── middleware/
│   │   │   └── request-id.middleware.ts   # x-request-id header
│   │   └── pipes/
│   │       └── pagination.dto.ts
│   ├── modules/
│   │   ├── health/                # GET /health — DB, Redis, memory, disk
│   │   └── user/                  # GET/PATCH/DELETE /users/me
│   ├── cron/                      # Scheduled jobs
│   ├── app.module.ts
│   └── main.ts
├── .env.example                   # All vars documented with inline comments
├── .eslintrc.json
├── .gitignore
├── .husky/
│   ├── pre-commit                 # lint-staged
│   └── pre-push                   # lint + no console.log + no commented code
├── .prettierrc
├── Makefile
├── nest-cli.json
├── package.json
├── README.md                      # Full docs for the generated project
└── tsconfig.json
```

### Conditional — generated only when selected

| Selection | Files added |
|---|---|
| Auth (JWT / JWT+Refresh / API Key) | `src/modules/auth/` — controller, service, strategies, guards, all DTOs |
| Redis cache | `src/modules/redis/` — RedisModule, RedisService |
| BullMQ | `src/modules/queue/` — QueueModule, EmailProcessor |
| Nodemailer / Resend | `src/modules/mailer/` — MailerModule, MailService |
| Email → Handlebars | `src/modules/mailer/templates/*.hbs` |
| Email → EJS | `src/modules/mailer/templates/*.ejs` |
| Email → Plain HTML | `src/modules/mailer/templates/*.html` + `html-template.util.ts` |
| TypeORM | `src/database/typeorm.config.ts`, `migrations/`, `seeders/seed.ts` |
| Prisma | `prisma/schema.prisma`, `prisma/seed.ts`, `PrismaService`, `PrismaModule` |
| Drizzle | `src/database/schema.ts`, `drizzle.config.ts`, `seeders/seed.ts` |
| AWS S3 | `src/modules/storage/` |
| Cloudinary | `src/modules/storage/` |
| WebSocket | `src/modules/socket/` — AppGateway, WsJwtGuard, @WsCurrentUser() |
| Docker | `Dockerfile` (multi-stage, non-root), `docker-compose.yml`, `.dockerignore` |
| CI/CD | `.github/workflows/dev.yml` — lint → test → build → SCP → SSH deploy |
| Swagger + Scalar | Scalar UI wired at `/api/reference` |
| Unit tests | Jest config in `package.json` |
| Unit + E2E tests | Jest config + `test/jest-e2e.json` + supertest |

---

## Development

Working on the CLI itself:

```bash
# Install dependencies
npm install

# Run CLI in dev mode (ts-node, no build needed)
npm run dev

# Or run a specific command directly
npx ts-node src/bin/zen.ts server

# Build to dist/
npm run build

# Lint CLI source
npm run lint

# Format CLI source
npm run format
```

### Adding a new template file

1. Create the file under `templates/` in the right location
2. Use `.hbs` extension if it needs Handlebars rendering
3. Prefix the filename or directory with `_featurename` if it should only be included conditionally
4. Add the guard to `shouldInclude()` in `src/generator/engine.ts`

### Adding a new prompt question

1. Add the type to `src/types/config.types.ts`
2. Add the question to `src/prompts/questions.ts`
3. Use the value in templates via `{{yourField}}`

### Prefix convention for conditional files/dirs

| Prefix | Included when |
|---|---|
| `_auth` | auth is not `none` |
| `_jwt` | auth is `jwt` or `jwt-refresh` |
| `_refresh` | auth is `jwt-refresh` |
| `_redis` | cache is `redis` OR queue is `bullmq` |
| `_bullmq` | queue is `bullmq` |
| `_mailer` | mailer is not `none` |
| `_emailhbs` | emailTemplate is `handlebars` |
| `_emailejs` | emailTemplate is `ejs` |
| `_emailhtml` | emailTemplate is `html` |
| `_typeorm` | orm is `typeorm` |
| `_prisma` | orm is `prisma` |
| `_drizzle` | orm is `drizzle` |
| `_mongoose` | orm is `mongoose` |
| `_s3` | storage is `s3` |
| `_cloudinary` | storage is `cloudinary` |
| `_socket` | socket is `true` |
| `_docker` | docker is `true` |
| `_cicd` | cicd is `true` |
| `_test` | testing is not `none` |
| `_e2e` | testing is `unit-e2e` |

---

## Publishing to npm

### First-time setup

```bash
# Login to npm (only needed once)
npm login

# Verify you are logged in
npm whoami
```

### Publish a new version

```bash
# 1. Bump version (pick one)
npm version patch   # 1.0.0 → 1.0.1  (bug fixes)
npm version minor   # 1.0.0 → 1.1.0  (new features, backwards compatible)
npm version major   # 1.0.0 → 2.0.0  (breaking changes)

# 2. Build + publish in one step (prepublishOnly runs build automatically)
npm publish --access public
```

> `prepublishOnly` in `package.json` runs `npm run build` automatically before every publish — you can never accidentally publish stale `dist/` files.

### Verify what gets published before releasing

```bash
# Dry run — shows every file that would be included, package size, no upload
npm pack --dry-run
```

### What gets shipped to npm

| Included | Excluded |
|---|---|
| `dist/` — compiled JS | `src/` — TypeScript source |
| `templates/` — all NestJS templates | `node_modules/` |
| `README.md` | `tsconfig.json` |
| `LICENSE` | `.eslintrc*`, `.prettierrc*` |
| `package.json` | `.git/`, `.husky/` |

### After publishing

Users can immediately install and use it:

```bash
npm install -g launch-cli
launch server
```

Or without installing:

```bash
npx launch-cli server
```

---

## Project Structure (CLI)

```
launch-cli/
├── src/
│   ├── bin/
│   │   └── zen.ts               # CLI entry point — registers commands
│   ├── generator/
│   │   ├── engine.ts            # Template walker + Handlebars renderer
│   │   └── post-generate.ts     # npm install + git init + husky setup
│   ├── prompts/
│   │   └── questions.ts         # All @clack/prompts questions
│   └── types/
│       └── config.types.ts      # ProjectConfig interface + all types
├── templates/                   # NestJS project templates (Handlebars)
├── dist/                        # Compiled output (after npm run build)
├── package.json
└── tsconfig.json
```
