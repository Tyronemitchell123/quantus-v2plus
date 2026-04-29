import { spawnSync } from 'node:child_process';

const run = (cmd, args) => spawnSync(cmd, args, { stdio: 'inherit', shell: true });

console.log('== Quantus Completion Step 1: Local environment preflight ==');
run('npm', ['run', 'validate:dev-env']);

console.log('\n== Quantus Completion Step 2: Generate PR-ready validation report ==');
run('npm', ['run', 'report:validation']);

console.log('\n== Quantus Completion Step 3: Next manual actions ==');
console.log('- Open PR and confirm `Supabase Function Tests` workflow is green.');
console.log('- If needed, trigger workflow_dispatch with run_integration=true.');
console.log('- Attach the workflow links + validation report to PR comments.');
