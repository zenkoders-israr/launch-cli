export type Database = 'postgres' | 'mongodb' | 'supabase';
export type Architecture = 'modular' | 'ddd';
export type AuthStrategy = 'jwt' | 'jwt-refresh' | 'api-key' | 'none';
export type OAuthProvider = 'google' | 'github';
export type CacheLayer = 'redis' | 'in-memory' | 'none';
export type QueueWorker = 'bullmq' | 'none';
export type Mailer = 'nodemailer' | 'resend' | 'none';
export type EmailTemplate = 'handlebars' | 'ejs' | 'html';
export type FileStorage = 's3' | 'cloudinary' | 'none';
export type ApiDocs = 'swagger' | 'swagger-scalar';
export type Testing = 'unit' | 'unit-e2e' | 'none';
export type OrmChoice = 'typeorm' | 'drizzle' | 'prisma' | 'mongoose';
export type MultiTenancyStrategy = 'row-level' | 'none';

export interface ProjectConfig {
  projectName: string;
  nodeVersion: string;   // major only e.g. "22"
  database: Database;
  orm: OrmChoice;
  architecture: Architecture;

  // Auth
  auth: AuthStrategy;
  oauthProviders: OAuthProvider[];   // [] when oauth not selected
  rbac: boolean;
  twoFactor: boolean;

  // Cache & Queue
  cache: CacheLayer;
  queue: QueueWorker;

  // Mailer
  mailer: Mailer;
  emailTemplate: EmailTemplate | null;
  smtp: boolean;

  // Storage
  storage: FileStorage;

  // Payments
  stripe: boolean;

  // Notifications
  fcm: boolean;    // Firebase push notifications
  sms: boolean;    // Twilio SMS

  // Multi-tenancy
  multiTenancy: MultiTenancyStrategy;

  // Infra / DevOps
  docs: ApiDocs;
  testing: Testing;
  socket: boolean;
  docker: boolean;
  cicd: boolean;
  packageManager: 'npm' | 'yarn' | 'pnpm';
}
