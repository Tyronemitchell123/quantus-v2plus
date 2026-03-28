

## E2E Audit Results and Fix Plan

### Findings

**Working correctly:**
- Homepage (`/`) loads with hero video, CTA links to `/auth`
- All navbar links resolve to valid routes (Home, About, Modules, Membership, Docs, Contact)
- Dashboard sidebar links all point to valid routes
- Footer links all resolve to valid routes
- Auth flow (`/auth`, `/reset-password`) registered
- All 8 deal phases have valid routes
- Asset files (images, videos) all exist in `src/assets/`
- `/chat` route is stable with WebGL fallback in place
- Mobile AI Assistant and Messaging now have send handlers (fixed previously)

**Issues found:**

1. **New premium modules have no navigation links** — Wealth (`/wealth`), Calendar (`/calendar`), Compliance (`/compliance`), Network (`/network`) are registered as routes but not linked from the Dashboard sidebar, mobile nav, or any other navigation surface. Users cannot discover them.

2. **Console warnings: "Function components cannot be given refs"** — React dev-mode warnings from `AnimatePresence` wrapping function components in Navbar and App. Non-breaking but indicates improper ref forwarding.

3. **Footer module links are generic** — All 5 module links (Aviation, Medical, Staffing, Travel, Logistics) point to `/dashboard/modules`, which requires auth. Unauthenticated users clicking these get redirected to auth with no context.

### Fix Plan

#### 1. Add premium module links to Dashboard Sidebar
**File**: `src/components/dashboard/DashboardSidebar.tsx`
- Add 4 new entries to `navItems`: Wealth (Wallet icon), Calendar (CalendarDays icon), Compliance (ShieldCheck icon), Network (Users icon)

#### 2. Add premium modules to mobile navigation
**File**: `src/pages/Dashboard.tsx`
- Add the 4 new modules to `mobileNavItems` array

#### 3. Add premium modules to Dashboard quick actions or module shortcuts
**File**: `src/components/dashboard/ModuleShortcuts.tsx` (if exists) or `DashboardFeed.tsx`
- Add card links for the new modules

#### 4. Fix Footer module links for unauthenticated users
**File**: `src/components/Footer.tsx`
- Change module links to `/modules` (the public route that redirects authenticated users to `/dashboard/modules` and shows the landing page to others)

#### 5. Fix AnimatePresence ref warnings
**File**: `src/components/Navbar.tsx`
- Wrap the mobile menu's `motion.div` children properly so AnimatePresence doesn't try to pass refs to function components

### Technical Details
- Sidebar icons: `Wallet` (wealth), `CalendarDays` (calendar), `ShieldCheck` (compliance), `Users` (network) from `lucide-react`
- All 4 new routes already exist in `dashboardRoutes` array and are protected, so they'll render inside the dashboard shell correctly
- Footer fix uses the existing `/modules` route which handles the auth check via `ModulesRedirect`

