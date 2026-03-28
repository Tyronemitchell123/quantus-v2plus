

## Fix Deal Buttons and Navigation

### Problems Found

1. **Dashboard Feed "Open Deal" buttons are dead** — Active deal cards in `DashboardFeed.tsx` show "Open Deal" as a plain `<span>` with no `<Link>` or click handler. Nothing happens when clicked.

2. **Deal Engine Strip links all go to `/intake`** — The "Open" button on every deal card in `DealEngineStrip.tsx` links to `/intake` instead of the Deal Engine (`/deals`).

3. **DealCard phase link is broken for phases 4+** — `DealEngine.tsx` defines 8 statuses (`shortlisting: 4`) but `DealCard.getPhaseLink()` only has 7 paths (missing `/shortlist`). This causes wrong page navigation for deals in shortlisting, negotiation, workflow, documents, and completion phases.

4. **Phase count mismatch** — `DealPhaseTimeline` uses 7 phases while `DealEngine` uses 8. Deals with status `shortlisting` are not counted in the pipeline view.

5. **Module Live Deals links are generic** — Deal cards in `ModuleLiveDeals.tsx` all link to `/deals` instead of the specific deal's current phase.

### Fix Plan

#### 1. `src/components/dashboard/DashboardFeed.tsx`
- Wrap each active deal card in a `<Link to="/deals">` so "Open Deal" actually navigates

#### 2. `src/components/dashboard/DealEngineStrip.tsx`
- Change the "Open" link from `/intake` to `/deals`

#### 3. `src/components/deal/DealCard.tsx`
- Add `/shortlist` to the `paths` array at index 3 (8 paths total matching 8 phases)
- Update progress calculation from `/6` to `/7`

#### 4. `src/components/deal/DealPhaseTimeline.tsx`
- Sync