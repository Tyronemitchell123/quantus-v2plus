

## Plan: Make All Checkout URLs Easily Copyable

### Problem
Checkout URLs are already stored in `invoice.metadata.checkout_url` but there's no easy way to see and copy them all at once — especially for vendors whose emails were suppressed.

### Changes

**File: `src/pages/CommissionPayouts.tsx`**

1. Add a new card section titled "Payment Links Directory" below the Customer Payment Reminders card that lists all invoices with a `checkout_url` in metadata.

2. Each row shows:
   - Vendor name / recipient name
   - Invoice number
   - Amount
   - Recipient email (or "No email" warning)
   - The checkout URL truncated with a **Copy** button next to it
   - A **Copy All Links** button at the top that copies all URLs to clipboard (one per line, with vendor name prefix for identification)

3. The list is derived from the existing `invoices` state — no new data fetching needed. Filter: `invoices.filter(i => i.metadata?.checkout_url)`.

4. Copy uses `navigator.clipboard.writeText()` with a toast confirmation, matching existing UX patterns already in the page.

### No backend changes needed
All checkout URLs are already persisted in the `invoices.metadata.checkout_url` field from when they were created.

