

## Plan: Backfill Invoice Emails and Resend Payment Reminders

### Problem
16 invoices have no `recipient_email`. The `vendor_outreach` table also has no emails for these deals. These are older deals that bypassed the outreach phase. We need a new edge function action to:
1. Look up vendor emails from the `vendors` table (matching by deal category/name) or allow manual backfill
2. Update the invoices with the found emails
3. For the 5 invoices missing checkout URLs, create Stripe Checkout sessions first
4. Send payment reminder emails for all updated invoices

### Approach: New Edge Function `backfill-invoice-emails`

Create a single-purpose edge function that uses service role to:

1. **Find invoices** with `status = 'sent'` and `recipient_email IS NULL`
2. **Attempt email resolution** by joining `invoices` → `deals` → `vendor_outreach` → fall back to `vendors` table (matching on category)
3. **Accept manual overrides** via request body: `{ overrides: { invoice_id: "email@example.com" } }` for invoices where no automated match exists
4. **Update invoices** with resolved emails using service role
5. **Create Stripe Checkout sessions** for the 5 invoices missing checkout URLs (reusing the logic from `activate-invoices`)
6. **Send payment reminders** by invoking `send-transactional-email` for each updated invoice
7. **Return a report** of what was updated, sent, and what still needs manual email entry

### Frontend Addition

Add a "Backfill & Send" button to the Commission Payouts page that:
- Calls the new edge function
- Shows results in a toast (X updated, Y emails sent, Z still need manual entry)
- Refreshes the invoice list after completion

### Files to Create/Edit

1. **Create** `supabase/functions/backfill-invoice-emails/index.ts` — the edge function
2. **Edit** `src/pages/CommissionPayouts.tsx` — add the backfill button

### Technical Details
- Uses `SUPABASE_SERVICE_ROLE_KEY` to update invoices (bypasses RLS)
- Uses `STRIPE_SECRET_KEY` to create checkout sessions for invoices missing URLs
- Reuses existing `send-transactional-email` function with `payment-reminder` template
- Fresh idempotency keys: `backfill-${invoiceId}-${date}`

