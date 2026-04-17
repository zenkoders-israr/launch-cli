#!/usr/bin/env node
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
const commander_1 = require("commander");
const p = __importStar(require("@clack/prompts"));
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const questions_js_1 = require("../prompts/questions.js");
const engine_js_1 = require("../generator/engine.js");
const post_generate_js_1 = require("../generator/post-generate.js");
const program = new commander_1.Command();
program
    .name('launch')
    .description('Launch CLI — production-grade NestJS scaffolding')
    .version('1.0.0');
program
    .command('server')
    .description('Scaffold a new NestJS backend project')
    .action(async () => {
    try {
        const config = await (0, questions_js_1.runPrompts)();
        const spinner = (0, ora_1.default)('Generating project...').start();
        await (0, engine_js_1.generateProject)(config);
        spinner.succeed('Project generated');
        await (0, post_generate_js_1.postGenerate)(config);
        p.outro(chalk_1.default.green(`\n✔ ${config.projectName} is ready!\n`) +
            chalk_1.default.dim(`  cd ${config.projectName}\n`) +
            chalk_1.default.dim(`  cp .env.example .env\n`) +
            chalk_1.default.dim(`  make dev\n`));
    }
    catch (err) {
        p.cancel(String(err));
        process.exit(1);
    }
});
program.parse(process.argv);
//# sourceMappingURL=zen.js.map