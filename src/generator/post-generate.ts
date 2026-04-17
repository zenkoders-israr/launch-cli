import { execSync, spawnSync } from 'child_process';
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

function run(cmd: string, cwd: string): { ok: boolean; stderr: string } {
  const result = spawnSync(cmd, { cwd, shell: true, encoding: 'utf-8' });
  return { ok: result.status === 0, stderr: result.stderr ?? '' };
}

export async function postGenerate(config: ProjectConfig): Promise<void> {
  const safeName = sanitizeProjectName(config.projectName);
  const projectDir = path.resolve(process.cwd(), safeName);

  if (!ALLOWED_PACKAGE_MANAGERS.includes(config.packageManager as typeof ALLOWED_PACKAGE_MANAGERS[number])) {
    throw new Error(`Invalid package manager: ${config.packageManager}`);
  }

  // ── Step 1: git init FIRST so .gitignore is respected during install ──────
  const gitSpinner = ora('Initialising git...').start();
  const gitResult = run('git init', projectDir);
  if (gitResult.ok) {
    // Set default branch to main
    run('git checkout -q -b main', projectDir);
    gitSpinner.succeed('Git initialised (branch: main)');
  } else {
    gitSpinner.fail('Git init failed — run it manually');
  }

  // ── Step 2: Install dependencies ─────────────────────────────────────────
  const installCmd: Record<string, string> = {
    npm: 'npm install',
    yarn: 'yarn install',
    pnpm: 'pnpm install',
  };

  const installSpinner = ora(`Installing dependencies with ${config.packageManager}...`).start();
  const installResult = run(installCmd[config.packageManager], projectDir);
  if (installResult.ok) {
    installSpinner.succeed('Dependencies installed');
  } else {
    installSpinner.fail('Dependency install failed — run it manually');
  }

  // ── Step 3: Husky setup ───────────────────────────────────────────────────
  const huskySpinner = ora('Setting up Husky hooks...').start();

  // Resolve husky binary from local node_modules (works for npm/yarn/pnpm)
  const huskyBin = path.join(projectDir, 'node_modules', '.bin', 'husky');
  const huskyExists = await fs.pathExists(huskyBin);

  if (huskyExists) {
    const huskyResult = run(`"${huskyBin}" install`, projectDir);
    if (huskyResult.ok) {
      run(`chmod +x .husky/pre-commit .husky/pre-push`, projectDir);
      huskySpinner.succeed('Husky hooks installed (pre-commit, pre-push)');
    } else {
      huskySpinner.fail('Husky install failed — run "npx husky install" manually');
    }
  } else {
    huskySpinner.warn('Husky not found — run "npx husky install" after dependencies are installed');
  }

  // ── Step 4: Initial commit ────────────────────────────────────────────────
  const commitSpinner = ora('Creating initial commit...').start();

  // Configure git user if not set (CI environments often lack this)
  const hasEmail = run('git config user.email', projectDir).ok;
  if (!hasEmail) {
    run('git config user.email "scaffold@launch-cli.dev"', projectDir);
    run('git config user.name "launch-cli"', projectDir);
  }

  const addResult = run('git add -A', projectDir);
  if (!addResult.ok) {
    commitSpinner.fail('git add failed — run it manually');
    return;
  }

  const commitResult = run(
    'git commit --no-verify -m "chore: initial scaffold via launch-cli"',
    projectDir,
  );
  if (commitResult.ok) {
    commitSpinner.succeed('Initial commit created');
  } else {
    commitSpinner.fail('Initial commit failed — run it manually');
  }
}
