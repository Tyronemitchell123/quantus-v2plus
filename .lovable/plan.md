
# Wiring Quantus V2 UI to Live Backend

## Phase 1: Deal Pipeline (Intake → Completion)
**Goal**: Ensure the full 8-phase deal flow works end-to-end with real DB writes and AI classification.

### Audit & Fix:
1. **Intake page** — Verify `intake-classify` edge function is called on submission, deal is created in `deals` table
2. **Sourcing page** — Verify `sourcing-engine` edge function is triggered, results stored in `sourcing_results` 
3. **Shortlisting page** — Verify selections write to DB and advance deal status
4. **Vendor Outreach** — Verify `vendor-outreach` / `outreach-ai` edge functions fire, `vendor_outreach` table populated
5. **Negotiation** — Verify `negotiate` / `negotiation-engine` edge functions work
6. **Deal Completion** — Verify `deal-completion` edge function runs, invoices created
7. **Deal Engine / Dashboard** — Verify deals query from DB, not mock data
8. **Deal Autopilot** — Verify autonomous pipeline reads/writes real deal statuses

## Phase 2: AI Autopilot / Orchestrator
**Goal**: Ensure the autonomous orchestrator advances deals, triggers outreach, auto-publishes.

1. **`autonomous-orchestrator`** edge function — Verify it's deployed and pg_cron triggers it
2. **`director-agent`** — Verify it plans and dispatches tasks
3. **AI Assistant Panel** — Verify it calls `concierge-chat` edge function with real context
4. **Marketing Hub** — Verify `ai-marketing` edge function generates real content saved to `marketing_posts`, `marketing_social`, `marketing_ads`

## Phase 3: Document Vault & Storage
**Goal**: Ensure uploads, downloads, deal-linked documents work with Supabase Storage.

1. **VaultUploadZone** — Verify uploads go to `quantusbucket` with user-scoped paths
2. **Document Vault page** — Verify `useVaultFiles` hook lists real files
3. **Deal Documents** — Verify `deal_documents` table is used for deal-linked docs
4. **Documents Billing** — Verify `document-billing` edge function works

## Phase 4: Vertical Modules
**Goal**: Connect the 9 vertical dashboards to real data.

1. **Aviation** — Wire to `pilot_arbitrage_results`, `aviation-manifest-scan`
2. **Medical** — Wire to `patient_vault`, `medical-noshow-scan`, `longevity_providers`
3. **Lifestyle** — Wire to deals filtered by category
4. **Staffing, Logistics, Partnerships, Marine, Legal, Finance** — Wire to category-filtered deal queries
5. **Module AI Panels** — Verify they call real AI edge functions
6. **Module Live Deals** — Verify they query `deals` table filtered by category

### Approach
- Audit each component file to determine if it uses mock/hardcoded data vs real Supabase queries
- Fix components that aren't wired up
- Verify with edge function curl tests where applicable
