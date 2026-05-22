import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs-extra';
import ora from 'ora';
import type { ProjectConfig } from '../types/config.types.js';

const ALLOWED_PACKAGE_MANAGERS = ['npm', 'yarn', 'pnpm'] as const;

function sanitizeProjectName(name: string): string {
  if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
    throw new Error(
      `Invalid project name: "${name}". Only letters, numbers, hyphens and underscores are allowed.`,
    );
  }
  return name;
}

/**
 * Run a shell command asynchronously — the event loop stays free so ora
 * spinners keep animating while long-running commands (npm install) execute.
 * Never throws; callers receive { ok, output } and decide how to handle failures.
 */
function run(cmd: string, cwd: string): Promise<{ ok: boolean; output: string }> {
  return new Promise((resolve) => {
    const child = spawn(cmd, {
      cwd,
      shell: true,
      stdio: 'pipe',
      env: { ...process.env },
    });

    const chunks: Buffer[] = [];
    child.stdout?.on('data', (d: Buffer) => chunks.push(d));
    child.stderr?.on('data', (d: Buffer) => chunks.push(d));

    const timer = setTimeout(() => {
      child.kill();
      resolve({ ok: false, output: 'Timed out after 5 minutes' });
    }, 5 * 60 * 1000);

    child.on('close', (code) => {
      clearTimeout(timer);
      const output = Buffer.concat(chunks).toString('utf-8').trim();
      resolve({ ok: code === 0, output });
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      resolve({ ok: false, output: err.message });
    });
  });
}

/**
 * Resolve the absolute path to the chosen package manager binary.
 * npm always lives next to the Node.js binary, so we derive it from
 * process.execPath — reliable even inside nvm / fnm / volta environments
 * where child shells don't inherit the full user PATH.
 */
function resolvePackageManagerBin(pm: string): string {
  const nodeBinDir = path.dirname(process.execPath);
  const ext = process.platform === 'win32' ? '.cmd' : '';
  const candidate = path.join(nodeBinDir, `${pm}${ext}`);
  if (fs.existsSync(candidate)) return `"${candidate}"`;
  return pm; // fallback — hope it's on PATH
}

export async function postGenerate(config: ProjectConfig): Promise<void> {
  const safeName = sanitizeProjectName(config.projectName);
  const projectDir = path.resolve(process.cwd(), safeName);

  if (!ALLOWED_PACKAGE_MANAGERS.includes(config.packageManager as typeof ALLOWED_PACKAGE_MANAGERS[number])) {
    throw new Error(`Invalid package manager: ${config.packageManager}`);
  }

  // ── Step 1: git init ──────────────────────────────────────────────────────
  const gitSpinner = ora('Initialising git...').start();
  const gitInit = await run('git init', projectDir);
  if (gitInit.ok) {
    await run('git checkout -q -b main', projectDir);
    gitSpinner.succeed('Git initialised (branch: main)');
  } else {
    gitSpinner.fail(`Git init failed — run it manually\n  ${gitInit.output}`);
  }

  // ── Step 2: Patch packageManager field (required by Corepack / pnpm) ──────
  const pmBin = resolvePackageManagerBin(config.packageManager);
  const versionResult = await run(`${pmBin} --version`, projectDir);
  if (versionResult.ok) {
    const version = versionResult.output.trim().split('\n').pop()?.trim() ?? '';
    if (version) {
      const pkgJsonPath = path.join(projectDir, 'package.json');
      try {
        const pkg = await fs.readJson(pkgJsonPath);
        pkg.packageManager = `${config.packageManager}@${version}`;
        await fs.writeJson(pkgJsonPath, pkg, { spaces: 2 });
      } catch {
        // Non-fatal
      }
    }
  }

  // ── Step 3: Install dependencies ─────────────────────────────────────────
  // (prisma generate runs after install, step 4.5)
  const installCmd = `${pmBin} install`;
  const installSpinner = ora(`Installing dependencies with ${config.packageManager}...`).start();
  const installResult = await run(installCmd, projectDir);

  if (installResult.ok) {
    installSpinner.succeed('Dependencies installed');
  } else {
    const preview = installResult.output.split('\n').slice(0, 15).join('\n  ');
    installSpinner.fail(
      `Dependency install failed.\n\n  Command: cd ${safeName} && ${installCmd}\n\n  Error:\n  ${preview || '(no output captured)'}\n`,
    );
    return; // Husky + commit depend on node_modules — skip
  }

  // ── Step 3.5: Prisma generate (must run after install, before build) ──────
  if (config.orm === 'prisma') {
    const prismaSpinner = ora('Running prisma generate...').start();
    const prismaBin = path.join(projectDir, 'node_modules', '.bin', 'prisma');
    const prismaResult = await run(`"${prismaBin}" generate`, projectDir);
    if (prismaResult.ok) {
      prismaSpinner.succeed('Prisma client generated');
    } else {
      prismaSpinner.warn(`prisma generate failed — run "npx prisma generate" manually\n  ${prismaResult.output.split('\n')[0]}`);
    }
  }

  // ── Step 4: Husky setup ───────────────────────────────────────────────────
  const huskySpinner = ora('Setting up Husky hooks...').start();
  const huskyBin = path.join(projectDir, 'node_modules', '.bin', 'husky');
  const huskyExists = await fs.pathExists(huskyBin);

  if (huskyExists) {
    await run(`"${huskyBin}"`, projectDir);
    await run('chmod +x .husky/pre-commit .husky/pre-push', projectDir);
    huskySpinner.succeed('Husky hooks ready (pre-commit, pre-push)');
  } else {
    huskySpinner.warn('Husky not found — run "npx husky" manually');
  }

  // ── Step 5: Initial commit ────────────────────────────────────────────────
  const commitSpinner = ora('Creating initial commit...').start();

  const hasEmail = (await run('git config user.email', projectDir)).ok;
  if (!hasEmail) {
    await run('git config user.email "scaffold@launch-cli.dev"', projectDir);
    await run('git config user.name "launch-cli"', projectDir);
  }

  const addResult = await run('git add -A', projectDir);
  if (!addResult.ok) {
    commitSpinner.fail(`git add failed — run it manually\n  ${addResult.output}`);
    return;
  }

  const commitResult = await run(
    'git commit --no-verify -m "chore: initial scaffold via launch-cli"',
    projectDir,
  );
  if (commitResult.ok) {
    commitSpinner.succeed('Initial commit created');
  } else {
    commitSpinner.fail(`Initial commit failed — run it manually\n  ${commitResult.output}`);
  }
}
