

## Analysis: No External API Keys Needed

Your project already has all the API keys it needs:
- **LOVABLE_API_KEY** — powers all AI features (concierge chat, circuit generator, cost optimizer, analytics, NLP tools, etc.)
- **STRIPE_SECRET_KEY** — handles payments and subscriptions

No additional external API keys are required. The AI features use Lovable's built-in AI gateway, which supports multiple models without separate keys.

---

## Broken Links & Non-Functional Elements Found

After analyzing routes, navigation, buttons, and page logic, here are the issues to fix:

### 1. `/modules` route redirects to landing page instead of modules
The public `/modules` route renders `<Index />` (the landing page) instead of showing the module showcase. Should redirect logged-in users to `/dashboard/modules`.

### 2. Footer module links require auth but don't indicate it
Footer links (Aviation, Medical, Staffing, Travel, Logistics) all point to `/dashboard/modules` which is behind `ProtectedRoute`. Unauthenticated users clicking these get redirected to auth with no context.

### 3. Footer "Privacy Policy" and "Terms of Service" are dead `<span>` elements
They are plain text, not links — users cannot click them.

### 4. RecommendationEngine uses only hardcoded mock data
Despite the earlier work to connect modules to live data, this page still renders static arrays. It should query deals/sourcing data from the database to generate live recommendations.

### 5. `DealPhaseTimeline` ref warning
Console error: "Function components cannot be given refs" in `DealPhaseTimeline` — needs `forwardRef` or ref removal.

### 6. `DashboardTopBar` AnimatePresence ref warning
Same ref warning pattern — function component receiving a ref it can't handle.

### 7. Partner Portal uses entirely mock data
The rebuilt Partner Portal renders hardcoded requests, messages, payments, and metrics instead of querying real data.

### 8. DocumentsAIPanel "Send" button does nothing
The send button in the documents AI panel has no `onClick` handler — it's purely visual.

---

## Implementation Plan

### Step 1: Fix `/modules` route
- Redirect authenticated users to `/dashboard/modules`, show landing page `ModuleShowcase` section for unauthenticated users.

### Step 2: Fix Footer dead links
- Make Privacy Policy and Terms of Service actual links (to `/privacy` and `/terms` placeholder pages, or anchor scrolls).
- Add visual indication on module links that they require sign-in.

### Step 3: Fix ref warnings
- Wrap `DealPhaseTimeline` with `React.forwardRef` or remove the ref being passed to it.
- Fix the same issue in `DashboardTopBar`.

### Step 4: Wire RecommendationEngine to live data
- Query `deals`, `sourcing_results`, and `vendor_outreach` tables.
- Generate dynamic recommendations based on deal status, stale deals, and module activity.
- Keep mock data as fallback when no deals exist.

### Step 5: Wire DocumentsAIPanel send button
- Connect to the concierge-chat edge function for document-specific AI queries.

### Step 6: Connect Partner Portal to live data
- Query `contact_submissions` or relevant partner tables for real requests.
- Show actual data where available, graceful empty states where not.

---

## Technical Details

**Files to modify:**
- `src/App.tsx` — fix `/modules` route
- `src/components/Footer.tsx` — fix dead links
- `src/components/deal/DealPhaseTimeline.tsx` — add forwardRef
- `src/components/dashboard/DashboardTopBar.tsx` — fix ref warning
- `src/pages/RecommendationEngine.tsx` — wire to live DB data
- `src/components/documents/DocumentsAIPanel.tsx` — wire send button
- `src/pages/PartnerPortal.tsx` — wire to live data where possible

**No new API keys or secrets needed.**

