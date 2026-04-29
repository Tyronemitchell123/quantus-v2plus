import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node scripts/run-deno-test.mjs <test-file>');
  process.exit(1);
}

const check = spawnSync('deno', ['--version'], { stdio: 'ignore' });
if (check.status !== 0) {
  console.error('Deno runtime is required but was not found in PATH.');
  console.error('Install Deno or run the GitHub Action "Supabase Function Tests" for CI execution.');
  process.exit(1);
}

const run = spawnSync('deno', ['test', ...args], { stdio: 'inherit' });
process.exit(run.status ?? 1);
