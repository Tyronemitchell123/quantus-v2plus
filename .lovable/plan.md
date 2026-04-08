
# Full Feature Implementation Plan

## Phase 1: Security & Trust
1. **Two-Factor Authentication (2FA)** — Email OTP verification for high-value actions (payments >£1000, role changes, API key creation). Create `send-otp` and `verify-otp` edge functions with a new `otp_codes` table.
2. **Session Management UI** — New `/settings/sessions` page showing active sessions with revoke capability using Supabase Auth admin API.

## Phase 2: Revenue & Growth  
3. **Stripe Subscription Webhook Enhancement** — Extend `stripe-connect-webhook` to handle `customer.subscription.updated`, `customer.subscription.deleted` events, auto-syncing tier changes to the `subscriptions` table.
4. **Automated Monthly Revenue Reports** — New `monthly-revenue-report` edge function (cron: 1st of month) that generates and emails a branded PDF summary of commissions, deal completions, and pipeline metrics.
5. **Client-Facing Deal Tracker** — Shareable public link (`/track/:token`) allowing vendors/clients to view deal progress without authentication. New `deal_share_tokens` table with expiring tokens.

## Phase 3: Analytics & Intelligence
6. **Dashboard KPI Widgets with Real Data** — Replace static dashboard feed with live widgets: pipeline value, conversion rate, avg deal completion time, revenue this month — all from real `deals`, `commission_logs`, and `invoices` data.
7. **Email Open/Click Tracking** — Add tracking pixel and click-through redirect via `track-email` edge function. New `email_events` table logging opens/clicks per email.

## Phase 4: Automation
8. **Smart Follow-Up Escalation** — Enhance `deal-auto-progression` to flag vendors with 3+ unanswered emails for phone outreach, creating a notification and updating vendor_outreach status to `escalated`.
9. **Deal Templates** — New `deal_templates` table with pre-filled intake forms for common deal types (private jet, medical, luxury). Template selector on the intake page.

## Phase 5: Mobile & UX
10. **Push Notifications (Service Worker)** — Register a service worker for web push notifications on payment received, deal completion, and critical alerts.
11. **Offline Mode** — Service worker caching strategy for dashboard data, deal list, and critical pages using Cache API.

## Implementation Order
Phases will be built sequentially. Each phase will include database migrations, edge functions, and UI components as needed.
