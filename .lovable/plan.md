
# Full Platform Productionization

## Current State
- **28 deals** across pipeline stages, **20 vendor outreach** records
- **0 vendors** in the vendors table — nothing to match deals against
- **7 commission_logs** all stuck at "pending" — no payout mechanism triggered
- **11 invoices** (draft/sent) — no payments collected
- **0 Stripe customers** — no real revenue flow
- **1 Stripe Connect account** — payout infrastructure exists but idle

---

## Phase 1: Vendor Seeding & Pipeline Fix (Critical)

**1a. Seed production vendors** across key verticals:
- Aviation (private jet brokers, charter companies)
- Medical (UHNW clinics, longevity centers)
- Lifestyle (luxury concierge, property)
- Hospitality (5-star hotels, yacht charters)
- Insert 15-20 real-format vendor records with proper categories

**1b. Fix the commission→payout flow:**
- Commission status should progress: `expected` → `pending` → `processing` → `paid`
- The `process-commission-payouts` edge function needs actual Stripe balance to transfer
- Add a `commission_logs` UPDATE RLS policy so service role can update status
- Wire the autonomous orchestrator to properly advance commission statuses

**1c. Invoice payment collection:**
- Ensure `invoice-checkout` creates real Stripe sessions with correct amounts
- When payment succeeds (via webhook), mark invoice as `paid` and commission as `paid`

---

## Phase 2: Frontend Polish

**2a. Mobile responsiveness audit** (user is on 360px viewport):
- Verify all dashboard pages render correctly at 360px
- Fix any overflow/truncation issues on deal cards, commission tables
- Ensure bottom navigation doesn't overlap content

**2b. Visual consistency:**
- Apply design tokens consistently (obsidian/gold palette)
- Fix any raw color values in components
- Ensure loading/empty states are styled properly

**2c. Component extraction:**
- Break down remaining monolithic pages (CommissionPayouts, Negotiation)
- Extract reusable status badges, currency formatters

---

## Phase 3: Testing & Reliability

**3a. Edge function testing:**
- Test autonomous-orchestrator, deal-completion, process-commission-payouts via curl
- Verify the full deal lifecycle works end-to-end

**3b. Error boundaries:**
- Ensure all dashboard routes have error boundaries
- Add fallback UI for failed data fetches

**3c. Data validation:**
- Add Zod validation to remaining edge functions
- Ensure all user inputs are sanitized

---

## Phase 4: Performance Optimization

**4a. Bundle analysis:**
- Verify code splitting is working for all lazy routes
- Check Three.js isn't in the main bundle

**4b. Query optimization:**
- Indexes already added (17 indexes from previous migration)
- Add React Query to remaining manual fetch patterns

---

## Implementation Order
1. Phase 1a (seed vendors) — unblocks the entire pipeline
2. Phase 1b-1c (commission/payout fix) — makes revenue real
3. Phase 2a (mobile polish) — user is on mobile
4. Phase 3a (edge function testing) — verify everything works
5. Phase 2b-2c, 3b-3c, 4 (remaining polish)
