import * as p from '@clack/prompts';
import chalk from 'chalk';
import ora from 'ora';
import type { ProjectConfig } from '../types/config.types.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const select = (opts: any) => p.select(opts) as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const multiselect = (opts: any) => p.multiselect(opts) as any;

// ─── Cancel handler ───────────────────────────────────────────────────────────

const onCancel = () => {
  p.cancel(chalk.yellow('Setup cancelled.'));
  process.exit(0);
};

// ─── Section header helper ────────────────────────────────────────────────────

function section(step: number, total: number, title: string, subtitle: string) {
  console.log();
  console.log(
    chalk.bgCyan.black(` ${step}/${total} `) +
    chalk.bold.white(` ${title} `) +
    chalk.dim(`— ${subtitle}`),
  );
  console.log(chalk.dim('  ' + '─'.repeat(52)));
}

// ─── Summary renderer ─────────────────────────────────────────────────────────

function formatSummary(c: ProjectConfig): string {
  const tick = chalk.green('✓');
  const cross = chalk.dim('✗');
  const bool = (v: boolean) => (v ? tick : cross);
  const arr = (v: string[] | null | undefined) =>
    Array.isArray(v) && v.length ? chalk.cyan(v.join(', ')) : chalk.dim('none');

  const lines: string[] = [
    row('Project',        chalk.cyan(c.projectName)),
    row('Node.js',        chalk.cyan(`v${c.nodeVersion}`)),
    '',
    row('Database',       chalk.cyan(c.database)),
    row('ORM / ODM',      chalk.cyan(c.orm)),
    row('Architecture',   chalk.cyan(c.architecture)),
    '',
    row('Auth',           chalk.cyan(c.auth)),
    row('OAuth',          arr(c.oauthProviders)),
    row('RBAC',           bool(c.rbac)),
    row('2FA / TOTP',     bool(c.twoFactor)),
    '',
    row('Cache',          chalk.cyan(c.cache)),
    row('Queue',          chalk.cyan(c.queue)),
    row('Mailer',         chalk.cyan(c.mailer)),
    row('Storage',        chalk.cyan(c.storage)),
    '',
    row('Stripe',         bool(c.stripe)),
    row('FCM Push',       bool(c.fcm)),
    row('Twilio SMS',     bool(c.sms)),
    row('Multi-tenancy',  chalk.cyan(c.multiTenancy)),
    '',
    row('API Docs',       chalk.cyan(c.docs)),
    row('WebSocket',      bool(c.socket)),
    row('Testing',        chalk.cyan(c.testing)),
    row('Docker',         bool(c.docker)),
    row('CI/CD',          bool(c.cicd)),
    row('Package mgr',    chalk.cyan(c.packageManager)),
  ];

  return lines.join('\n');
}

function row(label: string, value: string): string {
  return `  ${chalk.dim(label.padEnd(14))} ${value}`;
}

// ─── Node.js version fetch ────────────────────────────────────────────────────

interface NodeRelease { version: string; lts: string | false; date: string }

async function fetchNodeVersionOptions() {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 6000);
    const res = await fetch('https://nodejs.org/dist/index.json', { signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const releases = (await res.json()) as NodeRelease[];

    const seen = new Set<number>();
    const picks: NodeRelease[] = [];
    for (const r of releases) {
      const major = parseInt(r.version.slice(1), 10);
      if (!isNaN(major) && !seen.has(major)) {
        seen.add(major);
        picks.push(r);
        if (picks.length === 5) break;
      }
    }
    return picks.map((r, i) => {
      const major = r.version.slice(1).split('.')[0];
      const tag   = r.lts ? `LTS "${r.lts}"` : 'Current';
      const hint  = r.lts && i === 0 ? 'recommended' : r.lts ? 'active LTS' : 'latest';
      return { value: major, label: `Node ${major}  ${tag}  —  ${r.version}`, hint };
    });
  } catch {
    return [
      { value: '22', label: 'Node 22  LTS "Jod"      — v22.x  (offline fallback)', hint: 'recommended' },
      { value: '20', label: 'Node 20  LTS "Iron"     — v20.x  (offline fallback)', hint: 'active LTS' },
      { value: '18', label: 'Node 18  LTS "Hydrogen" — v18.x  (offline fallback)', hint: 'maintenance' },
    ];
  }
}

// ─── Main prompt flow ─────────────────────────────────────────────────────────

export async function runPrompts(): Promise<ProjectConfig> {
  // Banner
  console.log();
  console.log(
    chalk.bgCyan.black.bold('  ⚡ launch-cli  ') +
    chalk.cyan('  Production-ready NestJS backend generator'),
  );
  console.log(chalk.dim('  scaffold a full backend in under 2 minutes'));
  console.log();

  // Fetch Node.js releases
  const nodeSpinner = ora({ text: chalk.dim('Fetching Node.js releases…'), color: 'cyan' }).start();
  const nodeVersionOptions = await fetchNodeVersionOptions();
  nodeSpinner.stop();

  // ── 1 / 6  Project Basics ────────────────────────────────────────────────────
  section(1, 6, 'Project Basics', 'name and runtime');

  const basics = await p.group(
    {
      projectName: () =>
        p.text({
          message: 'Project name',
          placeholder: 'my-api',
          validate: (v) => (!v ? 'Project name is required' : undefined),
        }),

      nodeVersion: () =>
        select({
          message: 'Node.js version',
          options: nodeVersionOptions,
        }),
    },
    { onCancel },
  );

  // ── 2 / 6  Database ──────────────────────────────────────────────────────────
  section(2, 6, 'Database', 'storage engine and ORM');

  const db = await p.group(
    {
      database: () =>
        select({
          message: 'Database',
          options: [
            { value: 'postgres',  label: 'PostgreSQL',               hint: 'recommended' },
            { value: 'mongodb',   label: 'MongoDB' },
            { value: 'supabase',  label: 'Supabase',                 hint: 'Postgres + RLS' },
          ],
        }),

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      orm: ({ results }: { results: any }) =>
        results.database === 'mongodb'
          ? select({
              message: 'ODM',
              options: [{ value: 'mongoose', label: 'Mongoose' }],
            })
          : select({
              message: 'ORM / Query builder',
              options: [
                { value: 'prisma',   label: 'Prisma',     hint: 'recommended' },
                { value: 'typeorm',  label: 'TypeORM' },
                { value: 'drizzle',  label: 'Drizzle ORM', hint: 'lightweight' },
              ],
            }),

      architecture: () =>
        select({
          message: 'Architecture',
          options: [
            { value: 'modular', label: 'Modular',               hint: 'feature modules — simpler' },
            { value: 'ddd',     label: 'Domain-Driven Design',  hint: 'layered — enterprise' },
          ],
        }),
    },
    { onCancel },
  );

  // ── 3 / 6  Auth & Security ───────────────────────────────────────────────────
  section(3, 6, 'Auth & Security', 'authentication and access control');

  const auth = await p.group(
    {
      auth: () =>
        select({
          message: 'Auth strategy',
          options: [
            { value: 'jwt-refresh', label: 'JWT + Refresh token rotation', hint: 'recommended' },
            { value: 'jwt',         label: 'JWT  (access token only)' },
            { value: 'api-key',     label: 'API Key' },
            { value: 'none',        label: 'None' },
          ],
        }),

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      oauthProviders: async ({ results }: { results: any }) => {
        if (results.auth !== 'jwt' && results.auth !== 'jwt-refresh') return [];
        const val = await p.multiselect({
          message: 'OAuth / Social login  (space to select, enter to confirm)',
          options: [
            { value: 'google', label: 'Google' },
            { value: 'github', label: 'GitHub' },
          ],
          required: false,
        });
        // Guard against cancel symbol or null — return empty array instead
        if (p.isCancel(val) || !Array.isArray(val)) return [];
        return val as string[];
      },

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rbac: ({ results }: { results: any }) =>
        results.auth !== 'none'
          ? p.confirm({
              message: 'Add RBAC?  (Role-Based Access Control — admin / user / moderator)',
              initialValue: true,
            })
          : Promise.resolve(false),

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      twoFactor: ({ results }: { results: any }) =>
        results.auth === 'jwt' || results.auth === 'jwt-refresh'
          ? p.confirm({
              message: 'Add 2FA / TOTP?  (Google Authenticator, Authy)',
              initialValue: false,
            })
          : Promise.resolve(false),
    },
    { onCancel },
  );

  // ── 4 / 6  Infrastructure ────────────────────────────────────────────────────
  section(4, 6, 'Infrastructure', 'cache, queues, mail, storage');

  const infra = await p.group(
    {
      cache: () =>
        select({
          message: 'Cache layer',
          options: [
            { value: 'redis',      label: 'Redis',        hint: 'ioredis — recommended' },
            { value: 'in-memory',  label: 'In-memory',    hint: 'single-instance only' },
            { value: 'none',       label: 'None' },
          ],
        }),

      queue: () =>
        select({
          message: 'Queue / Background workers',
          options: [
            { value: 'bullmq', label: 'BullMQ',  hint: 'requires Redis' },
            { value: 'none',   label: 'None' },
          ],
        }),

      mailer: () =>
        select({
          message: 'Mailer',
          options: [
            { value: 'resend',       label: 'Resend',      hint: 'API-based — recommended' },
            { value: 'nodemailer',   label: 'Nodemailer',  hint: 'SMTP' },
            { value: 'none',         label: 'None' },
          ],
        }),

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      emailTemplate: ({ results }: { results: any }) =>
        results.mailer !== 'none'
          ? select({
              message: 'Email template engine',
              options: [
                { value: 'handlebars', label: 'Handlebars  (.hbs)', hint: 'recommended' },
                { value: 'ejs',        label: 'EJS         (.ejs)' },
                { value: 'html',       label: 'Plain HTML' },
              ],
            })
          : Promise.resolve(null),

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      smtp: ({ results }: { results: any }) =>
        results.mailer === 'nodemailer'
          ? p.confirm({ message: 'Include SMTP configuration?', initialValue: true })
          : Promise.resolve(false),

      storage: () =>
        select({
          message: 'File storage',
          options: [
            { value: 's3',          label: 'AWS S3',      hint: 'recommended' },
            { value: 'cloudinary',  label: 'Cloudinary' },
            { value: 'none',        label: 'None' },
          ],
        }),
    },
    { onCancel },
  );

  // ── 5 / 6  Features ──────────────────────────────────────────────────────────
  section(5, 6, 'Features', 'payments, notifications, multi-tenancy');

  const features = await p.group(
    {
      stripe: () =>
        p.confirm({
          message: 'Stripe payments?  (checkout, subscriptions, webhook handler)',
          initialValue: false,
        }),

      fcm: () =>
        p.confirm({
          message: 'Firebase push notifications?  (FCM — mobile + web)',
          initialValue: false,
        }),

      sms: () =>
        p.confirm({
          message: 'Twilio SMS?  (plain SMS + OTP via Twilio Verify)',
          initialValue: false,
        }),

      multiTenancy: () =>
        select({
          message: 'Multi-tenancy',
          options: [
            { value: 'none',        label: 'None',                hint: 'single tenant' },
            { value: 'row-level',   label: 'Row-level isolation', hint: 'shared DB, tenantId column' },
          ],
        }),
    },
    { onCancel },
  );

  // ── 6 / 6  Developer Tools ───────────────────────────────────────────────────
  section(6, 6, 'Developer Tools', 'docs, testing, docker, CI/CD');

  const devtools = await p.group(
    {
      docs: () =>
        select({
          message: 'API documentation',
          options: [
            { value: 'swagger-scalar', label: 'Swagger + Scalar UI', hint: 'recommended' },
            { value: 'swagger',        label: 'Swagger UI only' },
          ],
        }),

      testing: () =>
        select({
          message: 'Testing setup',
          options: [
            { value: 'unit-e2e', label: 'Unit + E2E  (Jest + Supertest)', hint: 'recommended' },
            { value: 'unit',     label: 'Unit tests  (Jest only)' },
            { value: 'none',     label: 'None' },
          ],
        }),

      socket: () =>
        p.confirm({ message: 'WebSocket support?  (Socket.io with auth guard)', initialValue: false }),

      docker: () =>
        p.confirm({ message: 'Docker + docker-compose?', initialValue: true }),

      cicd: () =>
        p.confirm({ message: 'CI/CD pipeline?  (GitHub Actions → EC2 deploy)', initialValue: true }),

      packageManager: () =>
        select({
          message: 'Package manager',
          options: [
            { value: 'pnpm', label: 'pnpm', hint: 'recommended' },
            { value: 'npm',  label: 'npm' },
            { value: 'yarn', label: 'yarn' },
          ],
        }),
    },
    { onCancel },
  );

  // ── Summary ──────────────────────────────────────────────────────────────────
  const config = {
    ...basics,
    ...db,
    ...auth,
    ...infra,
    ...features,
    ...devtools,
  } as ProjectConfig;

  console.log();
  p.note(formatSummary(config), chalk.bold.cyan('  Project Summary'));

  const confirmed = await p.confirm({
    message: 'Generate project with these settings?',
    initialValue: true,
  });

  if (p.isCancel(confirmed) || !confirmed) {
    p.cancel(chalk.yellow('Setup cancelled.'));
    process.exit(0);
  }

  console.log();
  return config;
}
