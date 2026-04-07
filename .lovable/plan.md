

## Plan: Add Unified `/automation` Route

### Overview
Create a dedicated Automation Dashboard page that consolidates all Firecrawl-powered scanning tools into a single tabbed interface, and wire it into the existing routing and navigation.

### Changes

**1. Create `src/pages/Automation.tsx`**
- New page with a tabbed layout (using existing `Tabs` UI component)
- Six tabs: **Vendor Discovery**, **Aviation**, **Medical**, **Hospitality**, **Longevity**, **Auto-Scrape**
- Each tab embeds the existing panel component:
  - Vendor Discovery: extract the AI discovery section from `VendorManagementTab` into a standalone `VendorDiscoveryPanel` component
  - Aviation: `<AviationScanPanel />`
  - Medical: `<MedicalScanPanel />`
  - Hospitality: `<HospitalityScanPanel />`
  - Longevity: `<LongevityScanPanel />`
  - Auto-Scrape: a simple trigger button that invokes the `auto-scrape-vendors` edge function with status display
- Page header with title "Automation Hub" and description
- Uses `useDocumentHead` for SEO, wrapped in the dashboard layout pattern

**2. Create `src/components/automation/VendorDiscoveryPanel.tsx`**
- Extract the AI vendor discovery form (category select, region input, discover button, results list with "Add" actions) from `VendorManagementTab` into a reusable panel
- Keep the same Supabase calls (`vendor-discovery` edge function + vendor insert)

**3. Create `src/components/automation/AutoScrapePanel.tsx`**
- Simple panel with a "Run Auto-Scrape" button that invokes `auto-scrape-vendors` edge function
- Displays results: vendors discovered, added, outreach drafts created, errors

**4. Update `src/routes/dashboard-routes.tsx`**
- Add lazy import for `Automation` page
- Add route: `<Route path="/automation" element={<ProtectedRoute><R name="Automation"><Automation /></R></ProtectedRoute>} />`
- Add `"/automation"` to `dashboardRoutePrefixes`

**5. Update `src/components/dashboard/DashboardSidebar.tsx`**
- Add an "Automation" link (using `Radar` or `Zap` icon) to the "Intelligence" or "Operations" nav section

### Technical Notes
- All existing scan panel components are reused as-is with no modifications
- The vendor discovery extraction keeps `VendorManagementTab` intact (it can import the same panel or keep its inline version)
- Protected route ensures only authenticated users access automation tools

