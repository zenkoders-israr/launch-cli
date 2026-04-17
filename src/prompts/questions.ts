import * as p from '@clack/prompts';
import chalk from 'chalk';
import type { ProjectConfig } from '../types/config.types.js';

// @clack/prompts types value as void in select — cast through unknown
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const select = (opts: any) => p.select(opts) as any;

export async function runPrompts(): Promise<ProjectConfig> {
  p.intro(chalk.bgCyan(chalk.black(' launch server ')));

  const answers = await p.group(
    {
      projectName: () =>
        p.text({
          message: 'Project name',
          placeholder: 'my-api',
          validate: (v) => (!v ? 'Project name is required' : undefined),
        }),

      database: () =>
        select({
          message: 'Database',
          options: [
            { value: 'postgres', label: 'PostgreSQL' },
            { value: 'mongodb', label: 'MongoDB' },
            { value: 'supabase', label: 'Supabase (Postgres + RLS)' },
          ],
        }),

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      orm: ({ results }: { results: any }) => {
        const db = results.database;
        if (db === 'mongodb') {
          return select({
            message: 'ODM',
            options: [{ value: 'mongoose', label: 'Mongoose' }],
          });
        }
        // postgres and supabase both get full ORM choice
        return select({
          message: 'ORM / Query builder',
          options: [
            { value: 'typeorm', label: 'TypeORM' },
            { value: 'prisma', label: 'Prisma' },
            { value: 'drizzle', label: 'Drizzle ORM' },
          ],
        });
      },

      architecture: () =>
        select({
          message: 'Architecture',
          options: [
            { value: 'modular', label: 'Modular', hint: 'feature modules, simpler' },
            { value: 'ddd', label: 'Domain-Driven Design', hint: 'domain/application/infrastructure layers' },
          ],
        }),

      auth: () =>
        select({
          message: 'Auth strategy',
          options: [
            { value: 'jwt', label: 'JWT (access token only)' },
            { value: 'jwt-refresh', label: 'JWT + Refresh token rotation' },
            { value: 'api-key', label: 'API Key' },
            { value: 'none', label: 'None' },
          ],
        }),

      cache: () =>
        select({
          message: 'Cache layer',
          options: [
            { value: 'redis', label: 'Redis (ioredis)' },
            { value: 'in-memory', label: 'In-memory (cache-manager)' },
            { value: 'none', label: 'None' },
          ],
        }),

      queue: () =>
        select({
          message: 'Queue / Workers',
          options: [
            { value: 'bullmq', label: 'BullMQ (requires Redis)' },
            { value: 'none', label: 'None' },
          ],
        }),

      mailer: () =>
        select({
          message: 'Mailer',
          options: [
            { value: 'nodemailer', label: 'Nodemailer (SMTP)' },
            { value: 'resend', label: 'Resend (API-based)' },
            { value: 'none', label: 'None' },
          ],
        }),

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      emailTemplate: ({ results }: { results: any }) =>
        results.mailer !== 'none'
          ? select({
              message: 'Email template engine',
              options: [
                { value: 'handlebars', label: 'Handlebars (.hbs)' },
                { value: 'ejs', label: 'EJS (.ejs)' },
                { value: 'html', label: 'Plain HTML (with {{variable}} replacer)' },
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
            { value: 's3', label: 'AWS S3' },
            { value: 'cloudinary', label: 'Cloudinary' },
            { value: 'none', label: 'None' },
          ],
        }),

      docs: () =>
        select({
          message: 'API documentation',
          options: [
            { value: 'swagger', label: 'Swagger UI' },
            { value: 'swagger-scalar', label: 'Swagger + Scalar (modern UI)' },
          ],
        }),

      testing: () =>
        select({
          message: 'Testing',
          options: [
            { value: 'unit', label: 'Unit tests (Jest)' },
            { value: 'unit-e2e', label: 'Unit + E2E tests (Jest + Supertest)' },
            { value: 'none', label: 'None' },
          ],
        }),

      docker: () =>
        p.confirm({ message: 'Add Docker + docker-compose?', initialValue: true }),

      socket: () =>
        p.confirm({ message: 'Add WebSocket (Socket.io) with auth guard?', initialValue: false }),

      cicd: () =>
        p.confirm({ message: 'Add CI/CD pipeline? (GitHub Actions → EC2 deploy)', initialValue: true }),

      packageManager: () =>
        select({
          message: 'Package manager',
          options: [
            { value: 'npm', label: 'npm' },
            { value: 'yarn', label: 'yarn' },
            { value: 'pnpm', label: 'pnpm' },
          ],
        }),
    },
    {
      onCancel: () => {
        p.cancel('Setup cancelled.');
        process.exit(0);
      },
    },
  );

  return answers as unknown as ProjectConfig;
}
