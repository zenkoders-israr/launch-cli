"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateProject = generateProject;
const handlebars_1 = __importDefault(require("handlebars"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
// Register helpers
handlebars_1.default.registerHelper('eq', function (a, b, options) {
    const result = String(a) === String(b);
    if (options && typeof options.fn === 'function') {
        return result ? options.fn(this) : (options.inverse ? options.inverse(this) : '');
    }
    return result;
});
handlebars_1.default.registerHelper('ne', function (a, b, options) {
    const result = String(a) !== String(b);
    if (options && typeof options.fn === 'function') {
        return result ? options.fn(this) : (options.inverse ? options.inverse(this) : '');
    }
    return result;
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
handlebars_1.default.registerHelper('or', function (...args) {
    const vals = args.slice(0, -1);
    const options = args[args.length - 1];
    const result = vals.some(Boolean);
    return result ? options.fn(this) : options.inverse(this);
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
handlebars_1.default.registerHelper('and', function (...args) {
    const vals = args.slice(0, -1);
    const options = args[args.length - 1];
    const result = vals.every(Boolean);
    return result ? options.fn(this) : options.inverse(this);
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
handlebars_1.default.registerHelper('isTrue', function (val, options) {
    const result = val === true || val === 'true';
    return result ? options.fn(this) : options.inverse(this);
});
// Works both as inline {{#if (includes arr val)}} and as block {{#includes arr val}}...{{/includes}}
handlebars_1.default.registerHelper('includes', function (arr, val, options) {
    const hit = Array.isArray(arr) && arr.includes(val);
    if (options && typeof options.fn === 'function') {
        return hit ? options.fn(this) : (options.inverse ? options.inverse(this) : '');
    }
    return hit;
});
handlebars_1.default.registerHelper('camel', (str) => str.replace(/-([a-z])/g, (_, c) => c.toUpperCase()));
handlebars_1.default.registerHelper('pascal', (str) => str
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(''));
handlebars_1.default.registerHelper('upper', (str) => str.toUpperCase().replace(/-/g, '_'));
const TEMPLATE_DIR = path_1.default.resolve(__dirname, '../../templates');
async function generateProject(config) {
    // Validate project name to prevent path traversal
    if (!/^[a-zA-Z0-9_-]+$/.test(config.projectName)) {
        throw new Error(`Invalid project name: "${config.projectName}". Only letters, numbers, hyphens and underscores are allowed.`);
    }
    const outputDir = path_1.default.resolve(process.cwd(), config.projectName);
    await fs_extra_1.default.ensureDir(outputDir);
    await walkAndRender(TEMPLATE_DIR, outputDir, config, outputDir);
}
async function walkAndRender(templateDir, outputDir, config, rootOutputDir) {
    const entries = await fs_extra_1.default.readdir(templateDir, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath = path_1.default.join(templateDir, entry.name);
        const resolvedName = resolveFileName(entry.name, config);
        if (!shouldInclude(entry.name, config))
            continue;
        const destPath = resolvedName ? path_1.default.join(outputDir, resolvedName) : outputDir;
        // Guard against path traversal in template file names
        const normalised = path_1.default.resolve(destPath);
        if (!normalised.startsWith(rootOutputDir)) {
            throw new Error(`Path traversal detected in template: ${entry.name}`);
        }
        if (entry.isDirectory()) {
            await fs_extra_1.default.ensureDir(destPath);
            await walkAndRender(srcPath, destPath, config, rootOutputDir);
        }
        else {
            await renderFile(srcPath, destPath, config);
        }
    }
}
async function renderFile(src, dest, config) {
    const raw = await fs_extra_1.default.readFile(src, 'utf-8');
    if (isBinaryExtension(src)) {
        await fs_extra_1.default.copy(src, dest);
        return;
    }
    // Only escape ${{ secrets.X }} GitHub Actions expressions in yml files
    const isYml = src.endsWith('.yml') || src.endsWith('.yml.hbs');
    const escaped = isYml
        ? raw.replace(/\$\{\{\s*(secrets\.[^}]+?)\s*\}\}/g, '__GHA__$1__GHA__')
        : raw;
    // noEscape is intentional — we are generating source code files, not HTML.
    // Escaping would corrupt TypeScript/JSON/YAML output.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const template = handlebars_1.default.compile(escaped, { noEscape: true });
    const rendered = template(config);
    const finalResult = isYml
        ? rendered.replace(/__GHA__([^_]+?)__GHA__/g, '\${{ $1 }}')
        : rendered;
    const finalDest = dest;
    await fs_extra_1.default.outputFile(finalDest, finalResult);
}
function resolveFileName(name, config) {
    return name
        .replace('__projectName__', config.projectName)
        // _emailhbs / _emailejs / _emailhtml dirs map to 'templates' in output
        .replace(/^_email(hbs|ejs|html)$/, 'templates')
        // _docker and _cicd are transparent wrappers — their contents go to project root
        .replace(/^_(docker|cicd)$/, '')
        // architecture wrappers are transparent — contents land directly in src/
        .replace(/^_(ddd|modular)$/, '')
        // ORM wrapper dirs at project root map to their conventional output paths
        .replace(/^_typeorm$/, 'src/database')
        .replace(/^_prisma$/, 'prisma')
        .replace(/^_drizzle$/, 'src/database')
        // strip conditional prefixes from filenames (e.g. _refresh.jwt-refresh.strategy.ts, _prisma.prisma.module.ts)
        .replace(/^_(refresh|jwt|apikey|smtp|test|e2e|scalar|supabase|postgres|mongodb|prisma|typeorm|drizzle|mongoose|oauth|rbac|2fa|stripe|fcm|twilio|multitenancy|redis)\./, '')
        // infrastructure feature dirs — strip leading underscore to canonical names
        .replace(/^_redis$/, 'cache/redis')
        .replace(/^_bullmq$/, 'queue/bullmq')
        .replace(/^_mailer$/, 'mail')
        .replace(/^_s3$/, 'storage')
        .replace(/^_cloudinary$/, 'storage')
        // _auth maps to auth (relative to its parent modules/ dir)
        .replace(/^_auth$/, 'auth')
        // _socket maps to socket (relative to its parent dir)
        .replace(/^_socket$/, 'socket')
        // New infrastructure feature dirs
        .replace(/^_stripe$/, 'payments/stripe')
        .replace(/^_fcm$/, 'notifications/fcm')
        .replace(/^_twilio$/, 'notifications/twilio')
        // New module dirs
        .replace(/^_multitenancy$/, 'multitenancy')
        // Strip new file-level prefixes
        .replace(/^_(oauth|rbac|2fa|stripe|fcm|twilio|multitenancy)\./, '')
        // strip .hbs suffix from CLI template wrappers only
        // keeps .hbs on email content files (welcome.hbs, password-reset.hbs)
        .replace(/\.hbs$/, (m, _o, full) => {
        const base = full.slice(0, -4);
        // has a real extension before .hbs (e.g. app.module.ts.hbs)
        if (/\.\w+$/.test(base))
            return '';
        // known extensionless wrappers
        if (/^(Dockerfile|Makefile|README|\.env[^.]*|docker-compose)/.test(base))
            return '';
        return m;
    });
}
function shouldInclude(name, config) {
    const guards = {
        // Existing
        '_redis': config.cache === 'redis' || config.queue === 'bullmq',
        '_bullmq': config.queue === 'bullmq',
        '_mailer': config.mailer !== 'none',
        '_smtp': config.smtp === true,
        '_emailhbs': config.emailTemplate === 'handlebars',
        '_emailejs': config.emailTemplate === 'ejs',
        '_emailhtml': config.emailTemplate === 'html',
        '_s3': config.storage === 's3',
        '_cloudinary': config.storage === 'cloudinary',
        '_docker': config.docker === true,
        '_cicd': config.cicd === true,
        '_socket': config.socket === true,
        '_ddd': config.architecture === 'ddd',
        '_modular': config.architecture === 'modular',
        '_typeorm': config.orm === 'typeorm',
        '_prisma': config.orm === 'prisma',
        '_drizzle': config.orm === 'drizzle',
        '_mongoose': config.orm === 'mongoose',
        '_auth': config.auth !== 'none',
        '_jwt': config.auth === 'jwt' || config.auth === 'jwt-refresh',
        '_refresh': config.auth === 'jwt-refresh',
        '_apikey': config.auth === 'api-key',
        '_test': config.testing !== 'none',
        '_e2e': config.testing === 'unit-e2e',
        '_scalar': config.docs === 'swagger-scalar',
        '_supabase': config.database === 'supabase',
        '_postgres': config.database === 'postgres',
        '_mongodb': config.database === 'mongodb',
        // New features
        '_oauth': Array.isArray(config.oauthProviders) && config.oauthProviders.length > 0,
        '_rbac': config.rbac === true,
        '_2fa': config.twoFactor === true,
        '_stripe': config.stripe === true,
        '_fcm': config.fcm === true,
        '_twilio': config.sms === true,
        '_multitenancy': config.multiTenancy !== 'none',
    };
    for (const [prefix, allowed] of Object.entries(guards)) {
        if (name.startsWith(prefix) && !allowed)
            return false;
    }
    return true;
}
function isBinaryExtension(filePath) {
    const binaryExts = ['.png', '.jpg', '.jpeg', '.gif', '.ico', '.woff', '.woff2', '.ttf', '.eot'];
    return binaryExts.includes(path_1.default.extname(filePath).toLowerCase());
}
//# sourceMappingURL=engine.js.map