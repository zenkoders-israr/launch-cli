/**
 * Multi-combination build tester.
 * Generates each combo, installs deps, runs build, reports pass/fail.
 */
import { generateProject } from './dist/generator/engine.js';
import { postGenerate }    from './dist/generator/post-generate.js';
import { execSync }        from 'child_process';
import path                from 'path';
import fs                  from 'fs';

const OUT = '/home/zenkoders/Desktop/zenkoders/test-combos';
fs.mkdirSync(OUT, { recursive: true });

const BASE = {
  nodeVersion: '22', docs: 'swagger', testing: 'unit',
  socket: false, docker: false, cicd: false, packageManager: 'pnpm',
  oauthProviders: [], rbac: false, twoFactor: false,
  stripe: false, fcm: false, sms: false, multiTenancy: 'none',
  emailTemplate: null, smtp: false,
};

const COMBOS = [
  {
    name: 'c1-typeorm-jwt',
    ...BASE,
    projectName: 'c1-typeorm-jwt',
    database: 'postgres', orm: 'typeorm', architecture: 'modular',
    auth: 'jwt', cache: 'none', queue: 'none', mailer: 'none', storage: 'none',
  },
  {
    name: 'c2-prisma-full',
    ...BASE,
    projectName: 'c2-prisma-full',
    database: 'postgres', orm: 'prisma', architecture: 'modular',
    auth: 'jwt-refresh', rbac: true, twoFactor: true,
    cache: 'redis', queue: 'bullmq',
    mailer: 'resend', emailTemplate: 'handlebars',
    storage: 's3', stripe: true, multiTenancy: 'row-level',
    docs: 'swagger-scalar', testing: 'unit-e2e',
  },
  {
    name: 'c3-mongo-apikey',
    ...BASE,
    projectName: 'c3-mongo-apikey',
    database: 'mongodb', orm: 'mongoose', architecture: 'modular',
    auth: 'api-key', cache: 'in-memory', queue: 'none',
    mailer: 'nodemailer', emailTemplate: 'ejs', smtp: true,
    storage: 'cloudinary',
  },
  {
    name: 'c4-drizzle-ddd',
    ...BASE,
    projectName: 'c4-drizzle-ddd',
    database: 'postgres', orm: 'drizzle', architecture: 'ddd',
    auth: 'jwt', cache: 'redis', queue: 'bullmq',
    mailer: 'none', storage: 'none',
    fcm: true, sms: true,
  },
  {
    name: 'c5-minimal',
    ...BASE,
    projectName: 'c5-minimal',
    database: 'postgres', orm: 'prisma', architecture: 'modular',
    auth: 'none', cache: 'none', queue: 'none',
    mailer: 'none', storage: 'none',
  },
];

const results = [];

for (const combo of COMBOS) {
  const dir = path.join(OUT, combo.projectName);
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true });

  process.chdir(OUT);
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`▶  ${combo.projectName}`);

  try {
    await generateProject(combo);
    await postGenerate(combo);
  } catch (e) {
    console.error('  ✖ generate/install failed:', e.message);
    results.push({ name: combo.name, ok: false, error: e.message });
    continue;
  }

  // Build
  try {
    execSync('pnpm run build 2>&1', {
      cwd: dir, encoding: 'utf-8', shell: true,
      env: { ...process.env },
      timeout: 120_000,
      maxBuffer: 10 * 1024 * 1024,
    });
    console.log(`  ✔ BUILD PASSED`);
    results.push({ name: combo.name, ok: true });
  } catch (e) {
    const out = (e.stdout ?? '') + (e.stderr ?? '') + (e.message ?? '');
    const errLines = out.split('\n')
      .filter(l => l.includes('error TS') || l.includes('error:'))
      .slice(0, 15);
    console.error(`  ✖ BUILD FAILED`);
    errLines.forEach(l => console.error(`     ${l.trim()}`));
    results.push({ name: combo.name, ok: false, errors: errLines });
  }
}

console.log(`\n${'═'.repeat(60)}`);
console.log('RESULTS');
console.log('═'.repeat(60));
for (const r of results) {
  console.log(`  ${r.ok ? '✔' : '✖'}  ${r.name}`);
  if (!r.ok) console.log(`     ${r.error?.split('\n')[0]}`);
}
