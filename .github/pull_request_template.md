## Summary
- Describe what changed and why.

## Validation checklist (required)
- [ ] `Supabase Function Tests` workflow passed for this PR (unit tests).
- [ ] I attached CI run link(s) in this PR description/comments.
- [ ] I ran `npm run validate:dev-env` locally or documented why not.

## Integration validation (recommended before release)
- [ ] Triggered `Supabase Function Tests` with `workflow_dispatch` and `run_integration=true`.
- [ ] Integration run link attached (or explicitly marked deferred).

## Environment notes
- If install/testing required scoped registry auth, confirm `.npmrc` + `NPM_TOKEN` setup was used.
- If local Deno is unavailable, confirm CI-based validation was used.
