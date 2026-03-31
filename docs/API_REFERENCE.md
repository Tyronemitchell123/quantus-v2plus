# Quantus V2+ — API & Edge Functions Reference

## Authentication

All protected endpoints require a valid JWT in the `Authorization: Bearer <token>` header.
Some endpoints (marked `verify_jwt = false`) accept the anon key for public access.

## Edge Functions

### Deal Pipeline

| Function | JWT | Description |
|----------|-----|-------------|
| `intake-classify` | No | AI classification of deal requests |
| `sourcing-engine` | No | Vendor/option matching engine |
| `vendor-outreach` | No | Automated vendor communication |
| `negotiation-engine` | No | AI negotiation assistance |
| `workflow-engine` | No | Multi-phase workflow orchestration |
| `deal-completion` | No | Deal finalisation + invoicing |

### AI & Intelligence

| Function | JWT | Description |
|----------|-----|-------------|
| `ai-analytics` | No | Dashboard AI insights |
| `concierge-chat` | No | AI concierge assistant |
| `nlp-tools` | No | Text analysis (sentiment, summary, classify) |
| `anomaly-detection` | No | Metric anomaly detection |
| `anomaly-narratives` | — | Anomaly narrative generation |
| `ai-circuit-generator` | — | Quantum circuit AI generation |
| `portfolio-interpret` | — | Portfolio AI analysis |

### Quantum Computing

| Function | JWT | Description |
|----------|-----|-------------|
| `quantum-jobs` | No | Submit/retrieve quantum circuit jobs |
| `quantum-cost-optimizer` | — | Cost estimation for quantum runs |

### Payments & Billing

| Function | JWT | Description |
|----------|-----|-------------|
| `create-checkout` | — | Stripe checkout session |
| `customer-portal` | — | Stripe customer portal |
| `check-subscription` | — | Verify subscription status |
| `manage-subscription` | — | Upgrade/downgrade/cancel |
| `track-usage` | — | Record usage metrics |
| `purchase-addon` | — | One-time addon purchase |
| `priority-checkout` | — | Priority deal surcharge |
| `process-commission-payouts` | — | Commission disbursement |
| `google-play-verify` | — | Google Play purchase verification |

### Stripe Connect (Marketplace)

| Function | JWT | Description |
|----------|-----|-------------|
| `stripe-connect-accounts` | No | Connected account management |
| `stripe-connect-products` | No | Product CRUD |
| `stripe-connect-checkout` | No | Marketplace checkout |
| `stripe-connect-webhook` | No | Webhook handler |

### Email

| Function | JWT | Description |
|----------|-----|-------------|
| `auth-email-hook` | No | Custom auth email templates |
| `send-transactional-email` | Yes | Send templated emails |
| `process-email-queue` | Yes | Batch email processing |
| `send-welcome-email` | No | Welcome email on signup |
| `handle-email-unsubscribe` | No | Unsubscribe handler |
| `handle-email-suppression` | No | Bounce/complaint handler |
| `preview-transactional-email` | No | Email template preview |

### Other

| Function | JWT | Description |
|----------|-----|-------------|
| `handle-contact` | No | Contact form submission |
| `lead-nurture` | — | Automated drip campaigns |
| `scheduled-content` | — | Scheduled publishing |
| `redeem-referral` | — | Referral code redemption |
| `log-audit` | No | Audit log recording |
| `expire-api-keys` | — | API key expiration |
| `admin-dashboard` | — | Admin analytics |
| `ai-marketing` | — | Marketing content generation |
| `sitemap` | — | Dynamic sitemap generation |
| `truelayer-payments` | No | Open banking payments |

## Database Enums

| Enum | Values |
|------|--------|
| `deal_category` | aviation, marine, legal, finance, lifestyle, medical, staffing, logistics, partnerships |
| `deal_status` | new, classified, sourcing, shortlisted, outreach, negotiation, documents, completed, cancelled |
| `subscription_tier` | free, starter, professional, teams |
| `subscription_status` | active, cancelled, past_due, trialing |
| `payment_status` | pending, completed, failed, refunded |
| `app_role` | admin, moderator, user |

## Webhooks

Users can register webhooks in Settings to receive real-time notifications.
Events are verified via HMAC-SHA256 signatures.
