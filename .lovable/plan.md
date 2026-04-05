

## End-to-End Testing Audit

### Current State

The platform has **8 frontend test files** with unit/integration-level coverage:

| Test File | Coverage Area |
|-----------|--------------|
| `integration.test.ts` | Auth flows, subscription checks, deal pipeline CRUD, commission payouts, marketplace checkout |
| `components.test.tsx` | ErrorBoundary, input validation, tier access control, commission rate calculation |
| `observability.test.ts` | Error tracking, retry logic, performance measurement |
| `page-seo.test.ts` | SEO metadata for all pages |
| `chat-messages.test.ts` | Chat hook initialization |
| `vault-files.test.ts` | Vault hook initialization |
| `supabase-mock.test.ts` | Supabase client mock structure |
| `example.test.ts` | Placeholder |

**Zero edge function tests exist** — none of the 35+ Supabase functions have Deno test files.

### What's NOT Tested

1. **Edge Functions** — No server-side tests for any of the 35+ functions (intake-classify, deal-completion, workflow-engine, invoice-checkout, process-commission-payouts, etc.)
2. **Real API round-trips** — All frontend tests use mocked Supabase; no tests hit the deployed functions
3. **Critical payment flows** — Stripe checkout creation, webhook handling, and payout execution are only tested with mocks
4. **Email pipeline** — No tests for queue processing, template rendering, or delivery
5. **Autonomous orchestrator** — The cron-based deal advancement has no automated tests
6. **UI interaction flows** — No component interaction tests (form submissions, navigation, modal flows)
7. **RLS policy enforcement** — No tests verifying that row-level security actually blocks unauthorized access

### Recommended Plan

**Phase 1 — Edge Function Smoke Tests (highest value)**
Create Deno test files for the 5 most critical functions:
- `check-subscription` — Validates subscription state
- `intake-classify` — Deal intake pipeline entry point
- `invoice-checkout` — Payment link generation
- `process-commission-payouts` — Revenue collection
- `backfill-invoice-emails` — Email delivery

Each test would hit the deployed function via `fetch()` and verify response shape and status codes.

**Phase 2 — Frontend Integration Tests**
- Add component render tests for Auth, Dashboard, Intake pages
- Add form submission flow tests (intake → result card)
- Add navigation/routing tests for protected routes

**Phase 3 — Live Smoke Test (browser-based)**
- Walk through the critical user journey in the browser: landing → auth → dashboard → intake → deal flow → invoice → payment link

### Technical Details

- Edge function tests use `Deno.test()` with the `supabase--test_edge_functions` tool
- Frontend tests use Vitest + React Testing Library (already configured)
- Browser tests use the browser automation tools for live verification
- All tests load env vars from `.env` via Deno dotenv

### Summary

The platform is **structurally complete** but has **minimal automated test coverage** — mostly mocked unit tests. The highest-risk gap is the lack of any edge function tests, meaning the entire backend pipeline (intake → sourcing → completion → payment → email) has never been verified by automated tests against the live deployment.

