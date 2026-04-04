

## Analysis: Why Payments Were Canceled & What's Broken

### Root Causes

**1. Stripe Checkout Sessions Expired**
The 2 canceled payment intents ($21,040 and $80) were from Stripe Checkout sessions that nobody completed within 24 hours (Stripe's default expiry). They were never "rejected" — the customer simply didn't click the link in time, so Stripe auto-canceled them.

**2. Email Queue Is Stuck in an Infinite Loop**
Six old messages (IDs 9, 10, 39, 40, 94, 95) are stuck in the `transactional_emails` queue — retried **12,000+ times** each. They were enqueued before the system started including `idempotency_key` in the payload, so the email API rejects them every 5 seconds with "Missing run_id or idempotency_key". This means **no payment reminder emails are actually being delivered**.

**3. Invoice Data Gaps**
- **36 sent invoices**, but 15 have **no recipient email** (can't send reminders)
- **10 invoices** have **no checkout URL** (can't collect payment)
- **1 draft** and **1 issued** invoice never got activated
- All existing checkout URLs have **expired** (24h Stripe limit)

### Fix Plan (3 steps)

#### Step 1: Flush the Stuck Email Queue
Create a one-time migration or edge function call to move the 6 stuck messages (with 800-12,000+ read counts) to the dead letter queue. This unblocks the email pipeline so future emails actually send.

- Technical: Call `move_to_dlq` for messages 9, 10, 39, 40, 94, 95 in `transactional_emails` queue

#### Step 2: Regenerate All Checkout URLs
Update the `backfill-invoice-emails` edge function to also handle invoices that have **expired** checkout URLs (not just missing ones). Since all existing URLs are 24h+ old, every sent invoice needs a fresh Stripe Checkout session.

- Add logic to check if checkout URL is older than 23 hours → treat as missing
- Generate fresh GBP Stripe Checkout sessions for all 36 sent invoices + the 2 non-sent ones
- Update invoice metadata with new URLs

#### Step 3: Fix the Email Pipeline & Resend Reminders
After flushing stuck messages and regenerating URLs, trigger payment reminder emails for all invoices that have both a recipient email and a fresh checkout URL.

- Emails will now flow correctly since the queue is unblocked
- Invoices without recipient emails will be flagged for manual entry (existing "Manual Email Entry" modal on Commission Payouts page)

### Files to Edit

1. **`supabase/functions/backfill-invoice-emails/index.ts`** — Add expired-URL regeneration logic and queue flush capability
2. **New migration** — SQL to flush the 6 stuck queue messages to DLQ

### What Won't Change
- No UI changes needed (existing Backfill & Send button + Manual Email modal handle the workflow)
- No changes to the email templates or send-transactional-email function
- Invoice amounts, deal data, and commission records remain untouched

