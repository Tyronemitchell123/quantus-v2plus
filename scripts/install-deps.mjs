import { existsSync, copyFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const managerArg = args.find((arg) => arg.startsWith('--manager='))?.split('=')[1];

const detectManager = () => {
  if (managerArg) return managerArg;
  if (existsSync('pnpm-lock.yaml')) return 'pnpm';
  if (existsSync('yarn.lock')) return 'yarn';
  if (existsSync('bun.lockb') || existsSync('bun.lock')) return 'bun';
  return 'npm';
};

const manager = detectManager();

if (!existsSync('.npmrc') && existsSync('.npmrc.example')) {
  copyFileSync('.npmrc.example', '.npmrc');
  console.log('Created .npmrc from .npmrc.example');
}

if (!process.env.NPM_TOKEN) {
  console.warn('NPM_TOKEN is not set. Scoped package installs may fail with 403.');
  console.warn('If install fails, export NPM_TOKEN and re-run this command.');
}

const installArgsByManager = {
  npm: ['install'],
  pnpm: ['install'],
  yarn: ['install'],
  bun: ['install'],
};

const fallbackArgsByManager = {
  npm: ['install', '--ignore-scripts', '--omit=optional'],
  pnpm: ['install', '--ignore-scripts', '--no-optional'],
  yarn: ['install', '--ignore-scripts', '--ignore-optional'],
  bun: ['install', '--ignore-scripts'],
};

if (!installArgsByManager[manager]) {
  console.error(`Unsupported manager "${manager}". Use npm, pnpm, yarn, or bun.`);
  process.exit(1);
}

console.log(`Using package manager: ${manager}`);
const install = spawnSync(manager, installArgsByManager[manager], { stdio: 'inherit', shell: true });
if (install.status === 0) process.exit(0);

console.warn(`\nPrimary install failed. Trying fallback: ${manager} ${fallbackArgsByManager[manager].join(' ')}`);
const fallback = spawnSync(manager, fallbackArgsByManager[manager], { stdio: 'inherit', shell: true });
if (fallback.status === 0) process.exit(0);

console.error('\nDependency installation failed. Use CI-based validation as fallback.');
process.exit(fallback.status ?? 1);
