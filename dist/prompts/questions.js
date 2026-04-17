"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runPrompts = runPrompts;
const p = __importStar(require("@clack/prompts"));
const chalk_1 = __importDefault(require("chalk"));
// @clack/prompts types value as void in select — cast through unknown
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const select = (opts) => p.select(opts);
async function runPrompts() {
    p.intro(chalk_1.default.bgCyan(chalk_1.default.black(' launch server ')));
    const answers = await p.group({
        projectName: () => p.text({
            message: 'Project name',
            placeholder: 'my-api',
            validate: (v) => (!v ? 'Project name is required' : undefined),
        }),
        database: () => select({
            message: 'Database',
            options: [
                { value: 'postgres', label: 'PostgreSQL' },
                { value: 'mongodb', label: 'MongoDB' },
                { value: 'supabase', label: 'Supabase (Postgres + RLS)' },
            ],
        }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        orm: ({ results }) => {
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
        architecture: () => select({
            message: 'Architecture',
            options: [
                { value: 'modular', label: 'Modular', hint: 'feature modules, simpler' },
                { value: 'ddd', label: 'Domain-Driven Design', hint: 'domain/application/infrastructure layers' },
            ],
        }),
        auth: () => select({
            message: 'Auth strategy',
            options: [
                { value: 'jwt', label: 'JWT (access token only)' },
                { value: 'jwt-refresh', label: 'JWT + Refresh token rotation' },
                { value: 'api-key', label: 'API Key' },
                { value: 'none', label: 'None' },
            ],
        }),
        cache: () => select({
            message: 'Cache layer',
            options: [
                { value: 'redis', label: 'Redis (ioredis)' },
                { value: 'in-memory', label: 'In-memory (cache-manager)' },
                { value: 'none', label: 'None' },
            ],
        }),
        queue: () => select({
            message: 'Queue / Workers',
            options: [
                { value: 'bullmq', label: 'BullMQ (requires Redis)' },
                { value: 'none', label: 'None' },
            ],
        }),
        mailer: () => select({
            message: 'Mailer',
            options: [
                { value: 'nodemailer', label: 'Nodemailer (SMTP)' },
                { value: 'resend', label: 'Resend (API-based)' },
                { value: 'none', label: 'None' },
            ],
        }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        emailTemplate: ({ results }) => results.mailer !== 'none'
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
        smtp: ({ results }) => results.mailer === 'nodemailer'
            ? p.confirm({ message: 'Include SMTP configuration?', initialValue: true })
            : Promise.resolve(false),
        storage: () => select({
            message: 'File storage',
            options: [
                { value: 's3', label: 'AWS S3' },
                { value: 'cloudinary', label: 'Cloudinary' },
                { value: 'none', label: 'None' },
            ],
        }),
        docs: () => select({
            message: 'API documentation',
            options: [
                { value: 'swagger', label: 'Swagger UI' },
                { value: 'swagger-scalar', label: 'Swagger + Scalar (modern UI)' },
            ],
        }),
        testing: () => select({
            message: 'Testing',
            options: [
                { value: 'unit', label: 'Unit tests (Jest)' },
                { value: 'unit-e2e', label: 'Unit + E2E tests (Jest + Supertest)' },
                { value: 'none', label: 'None' },
            ],
        }),
        docker: () => p.confirm({ message: 'Add Docker + docker-compose?', initialValue: true }),
        socket: () => p.confirm({ message: 'Add WebSocket (Socket.io) with auth guard?', initialValue: false }),
        cicd: () => p.confirm({ message: 'Add CI/CD pipeline? (GitHub Actions → EC2 deploy)', initialValue: true }),
        packageManager: () => select({
            message: 'Package manager',
            options: [
                { value: 'npm', label: 'npm' },
                { value: 'yarn', label: 'yarn' },
                { value: 'pnpm', label: 'pnpm' },
            ],
        }),
    }, {
        onCancel: () => {
            p.cancel('Setup cancelled.');
            process.exit(0);
        },
    });
    return answers;
}
//# sourceMappingURL=questions.js.map