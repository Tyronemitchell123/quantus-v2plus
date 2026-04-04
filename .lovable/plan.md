

## Plan: Add Bulk "Resend Payment Reminders" Button

### What it does
Adds a new button to the Commission Payouts page that bulk-resends payment reminder emails for all invoices with status "sent" that either failed delivery (suppressed) or were never successfully emailed. It re-invokes the existing `send-transactional-email` edge function for each eligible invoice using the checkout URL already stored in invoice metadata.

### Changes

**File: `src/pages/CommissionPayouts.tsx`**

1. Add new state: `bulkResendLoading` (boolean)
2. Add a `bulkResendReminders` async function that:
   - Queries all `sent` invoices (from the already-loaded `invoices` state) that have a `recipient_email` and a `checkout_url` in metadata
   - For each, calls `supabase.functions.invoke("send-transactional-email")` with the `payment-reminder` template, passing the checkout URL, amount, and recipient details
   - Tracks success/failure counts and shows a toast summary
3. Add a new button in the Reminders card (lines ~396-416), below the existing "Send Reminders" button, styled with a `RefreshCw` icon and labeled "Resend All Payment Links". The button is disabled when no eligible invoices exist or while loading.
4. Show a count of eligible invoices (sent status with email + checkout URL) next to the button.

### Technical details
- Reuses the existing `send-transactional-email` function and `payment-reminder` template — no backend changes needed
- Uses a fresh idempotency key per resend (`resend-{invoiceId}-{date}`) to bypass dedup
- Formats amount from `invoice.amount_cents` and `invoice.currency`
- Pulls checkout URL from `invoice.metadata.checkout_url`

