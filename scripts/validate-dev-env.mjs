import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const checks = [];

const denoCheck = spawnSync('deno', ['--version'], { stdio: 'ignore' });
checks.push({
  name: 'Deno runtime available',
  ok: denoCheck.status === 0,
  fix: 'Install Deno or rely on CI for Supabase Function Tests.',
});

checks.push({
  name: '.npmrc present',
  ok: existsSync('.npmrc') || existsSync('.npmrc.example'),
  fix: 'Create .npmrc (or copy from .npmrc.example) for scoped registry config.',
});

checks.push({
  name: 'NPM_TOKEN set (for scoped/private packages)',
  ok: Boolean(process.env.NPM_TOKEN),
  fix: 'Export NPM_TOKEN before running dependency installation in restricted environments.',
});

checks.push({
  name: 'VITE_SUPABASE_URL set (integration tests)',
  ok: Boolean(process.env.VITE_SUPABASE_URL),
  fix: 'Set VITE_SUPABASE_URL to enable integration test execution.',
});

checks.push({
  name: 'VITE_SUPABASE_PUBLISHABLE_KEY set (integration tests)',
  ok: Boolean(process.env.VITE_SUPABASE_PUBLISHABLE_KEY),
  fix: 'Set VITE_SUPABASE_PUBLISHABLE_KEY to enable integration test execution.',
});

let failed = false;
for (const c of checks) {
  const icon = c.ok ? '✅' : '⚠️';
  console.log(`${icon} ${c.name}`);
  if (!c.ok) {
    failed = true;
    console.log(`   ↳ ${c.fix}`);
  }
}

if (failed) {
  console.log('\nSome checks are missing. You can continue with CI-based validation if local setup is restricted.');
}
