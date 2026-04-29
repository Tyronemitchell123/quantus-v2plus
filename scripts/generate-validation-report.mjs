import { spawnSync } from 'node:child_process';

const run = (cmd, args) => spawnSync(cmd, args, { encoding: 'utf8' });

const lines = [];
lines.push('## Validation Report');
lines.push('');

const envCheck = run('node', ['scripts/validate-dev-env.mjs']);
lines.push('### Local Preflight');
lines.push('```');
lines.push((envCheck.stdout || '').trim() || '(no stdout)');
if (envCheck.stderr) lines.push(envCheck.stderr.trim());
lines.push('```');
lines.push('');

const unitHint = 'Unit tests are run in CI via `Supabase Function Tests` workflow.';
const integrationHint = 'Integration tests can be run via workflow_dispatch with run_integration=true.';
lines.push(`- ${unitHint}`);
lines.push(`- ${integrationHint}`);

console.log(lines.join('\n'));
