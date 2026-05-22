/**
 * Direct generation test — bypasses the interactive prompts.
 * Run from the boiler-plate directory:
 *   node test-generate.mjs
 */
import { generateProject } from './dist/generator/engine.js';
import { postGenerate }    from './dist/generator/post-generate.js';
import path from 'path';
import { fileURLToPath }   from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Change cwd to the target output directory
process.chdir('/home/zenkoders/Desktop/zenkoders');

const config = {
  projectName:    'demo-api',
  nodeVersion:    '22',
  database:       'postgres',
  orm:            'prisma',
  architecture:   'modular',
  auth:           'jwt-refresh',
  oauthProviders: [],
  rbac:           true,
  twoFactor:      false,
  cache:          'redis',
  queue:          'bullmq',
  mailer:         'resend',
  emailTemplate:  'handlebars',
  smtp:           false,
  storage:        's3',
  stripe:         true,
  fcm:            false,
  sms:            false,
  multiTenancy:   'none',
  docs:           'swagger-scalar',
  testing:        'unit',
  socket:         false,
  docker:         true,
  cicd:           false,
  packageManager: 'pnpm',
};

console.log('\n  Generating project:', config.projectName, '\n');
await generateProject(config);
console.log('\n  Running post-generate steps…\n');
await postGenerate(config);
console.log('\n  Done! \n');
