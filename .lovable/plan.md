

# Full Audit & Modernization Refactor

## Overview

This project has accumulated significant technical debt across 150+ components, 60+ pages, and 35+ edge functions. The refactor addresses four major areas: duplicate/dead code, database inconsistencies, frontend architecture cleanup, and backend consolidation.

---

## Phase 1: Database Consolidation

**Problem**: Two parallel commission systems exist — `commissions` table (used by Sovereign modules) and `commission_logs` table (used by deal pipeline, payouts, and the orchestrator). Same for `leads` vs `deals`.

**Plan**:
- Migrate all `commissions` table references to use `commission_logs` exclusively. The `commissions` table has a different schema (`total_value`, `quantus_cut`, `payout_status`, `lead_id`) that duplicates what `commission_logs` already handles (`deal_value_cents`, `commission_cents`, `status`, `deal_id`).
- Update these files to use `commission_logs`:
  - `src/pages/SovereignVault.tsx`
  - `src/pages/SovereignDashboard.tsx`
  - `src/components/sovereign/SovereignMasterView.tsx`
  - `src/components/sovereign/AviationLiveDeals.tsx`
  - `src/components/sovereign/MedicalLiveDeals.tsx`
- Deprecate the `commissions` table (leave it but stop writing to it).
- Similarly audit `leads` table usage — Sovereign modules use `leads` while the deal pipeline uses `deals`. Determine if `leads` should feed into `deals` or be consolidated.

**Files**: ~7 frontend files, 1 migration

---

## Phase 2: Frontend Code Cleanup

**Problem**: Large monolithic page components (CommissionPayouts: 930 lines, Negotiation: 780 lines, DealCompletion: 544 lines), duplicated dashboard shell patterns, and inconsistent formatting helpers scattered across files.

**Plan**:
- Extract shared utilities:
  - `formatCurrency(cents, currency)` — currently reimplemented in 5+ files with different signatures
  - `statusColor(status)` — duplicated in 4+ files
  - `categoryIcons` map — duplicated across deal pages
- Extract reusable dashboard page wrapper (sidebar + topbar + mobile nav pattern repeated in every dashboard page)
- Break down large pages into sub-components:
  - `CommissionPayouts.tsx` → extract `PayoutPreview`, `CommissionTable`, `ReminderSection`, `CollectPaymentRow`
  - `Negotiation.tsx` → already partially done, continue extraction
- Remove dead/unused imports and components

**Files**: ~15-20 frontend files, 3-4 new shared utility files

---

## Phase 3: App.tsx Route Organization

**Problem**: 75+ lazy imports and 70+ route definitions in a single file. The `dashboardRoutes` array is manually maintained and can drift.

**Plan**:
- Extract route definitions into a `src/routes/` directory:
  - `public-routes.tsx` — marketing, auth, legal pages
  - `dashboard-routes.tsx` — all protected dashboard routes
  - `admin-routes.tsx` — admin-only routes
- Auto-derive `dashboardRoutes` from the route config instead of a manual string array
- Keep `App.tsx` as a thin shell (~30 lines)

**Files**: 4-5 new/modified files

---

## Phase 4: Edge Function Consolidation

**Problem**: Some edge functions share duplicated logic (CORS headers, auth patterns, Supabase client creation). The autonomous orchestrator has grown complex with inline commission logic.

**Plan**:
- Standardize all edge functions to import CORS from `@supabase/supabase-js/cors` (currently many define it manually)
- Extract shared auth + client creation into `_shared/supabase-admin.ts`
- Clean up the `autonomous-orchestrator` to use the same commission rate constants as `deal-completion` (currently duplicated)
- Remove any edge functions that are fully unused

**Files**: ~10 edge function files

---

## Phase 5: Hook & State Optimization

**Problem**: Direct `supabase.auth.getSession()` calls scattered across components instead of using the centralized `useAuth` hook. Multiple `useEffect` data-fetching patterns that should use React Query.

**Plan**:
- Replace manual `supabase.auth.getSession()` calls with `useAuth()` hook (found in CommissionPayouts, FinancialOverview, and others)
- Convert key data-fetching `useEffect` patterns to React Query `useQuery` for:
  - Commission data
  - Deal lists
  - Invoice data
- This provides automatic caching, deduplication, and background refresh

**Files**: ~10 files

---

## Implementation Order

1. Phase 1 (Database) — highest impact, fixes real data confusion
2. Phase 5 (Hooks) — reduces bugs from stale auth state
3. Phase 2 (Frontend cleanup) — improves maintainability
4. Phase 3 (Routes) — improves App.tsx readability
5. Phase 4 (Edge functions) — consistency improvements

## Risk Mitigation

- All database changes use migrations with no destructive operations (old tables left in place)
- Each phase is independently deployable
- No UI/UX changes — purely structural refactoring

