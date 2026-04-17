#!/usr/bin/env node
import { Command } from 'commander';
import * as p from '@clack/prompts';
import chalk from 'chalk';
import ora from 'ora';
import { runPrompts } from '../prompts/questions.js';
import { generateProject } from '../generator/engine.js';
import { postGenerate } from '../generator/post-generate.js';

const program = new Command();

program
  .name('launch')
  .description('Launch CLI — production-grade NestJS scaffolding')
  .version('1.0.0');

program
  .command('server')
  .description('Scaffold a new NestJS backend project')
  .action(async () => {
    try {
      const config = await runPrompts();

      const spinner = ora('Generating project...').start();
      await generateProject(config);
      spinner.succeed('Project generated');

      await postGenerate(config);

      p.outro(
        chalk.green(`\n✔ ${config.projectName} is ready!\n`) +
        chalk.dim(`  cd ${config.projectName}\n`) +
        chalk.dim(`  cp .env.example .env\n`) +
        chalk.dim(`  make dev\n`),
      );
    } catch (err) {
      p.cancel(String(err));
      process.exit(1);
    }
  });

program.parse(process.argv);
