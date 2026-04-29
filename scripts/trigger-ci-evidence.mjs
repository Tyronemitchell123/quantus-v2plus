import { spawnSync } from 'node:child_process';

const run = (cmd, args) => spawnSync(cmd, args, { encoding: 'utf8' });

const ghCheck = run('gh', ['--version']);
if (ghCheck.status !== 0) {
  console.error('GitHub CLI (gh) is not available.');
  console.error('Install gh, authenticate (`gh auth login`), then re-run this script.');
  console.log('\nManual fallback:');
  console.log('- Open GitHub repository Actions tab.');
  console.log('- Run workflow: Supabase Function Tests.');
  console.log('- Optionally run workflow_dispatch with run_integration=true.');
  process.exit(0);
}

const auth = run('gh', ['auth', 'status']);
if (auth.status !== 0) {
  console.error('gh is installed but not authenticated. Run `gh auth login`.');
  console.log('\nManual fallback: trigger workflow from GitHub Actions UI.');
  process.exit(0);
}

const pr = run('gh', ['pr', 'view', '--json', 'number,url', '--jq', '.number']);
if (pr.status !== 0 || !pr.stdout.trim()) {
  console.error('Unable to resolve current PR. Run from a branch with an open PR.');
  console.log('\nManual fallback: trigger workflow from GitHub Actions UI and attach run links to PR.');
  process.exit(0);
}

console.log(`Detected PR #${pr.stdout.trim()}`);

const unit = run('gh', ['workflow', 'run', 'supabase-functions-tests.yml']);
if (unit.status === 0) {
  console.log('Triggered unit workflow run.');
} else {
  console.error('Failed to trigger unit workflow run.');
  console.error(unit.stderr || unit.stdout);
}

const integration = run('gh', ['workflow', 'run', 'supabase-functions-tests.yml', '-f', 'run_integration=true']);
if (integration.status === 0) {
  console.log('Triggered integration workflow run with run_integration=true.');
} else {
  console.error('Failed to trigger integration workflow run.');
  console.error(integration.stderr || integration.stdout);
}

console.log('\nNext:');
console.log('- Open workflow runs: gh run list --workflow supabase-functions-tests.yml --limit 5');
console.log('- Attach successful run links in PR comments and check off the PR template items.');
