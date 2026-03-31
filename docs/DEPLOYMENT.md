# Quantus V2+ — Deployment & Operations

## Current Deployment

- **Platform:** Lovable (lovable.dev)
- **Published URL:** https://quantus-loom.lovable.app
- **Backend:** Lovable Cloud (Supabase-powered)
- **Edge Functions:** Auto-deployed on push

## Domain Strategy

1. **Current:** `quantus-loom.lovable.app` (Lovable subdomain)
2. **Planned:** Custom IONOS domain (e.g., `quantusv2.com` or `quantus.io`)
3. **Setup:** Lovable Settings → Domains → Connect Domain

## Environment Variables

Auto-managed by Lovable Cloud:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

## Required Secrets (Edge Functions)

| Secret | Purpose |
|--------|---------|
| `RESEND_API_KEY` | Transactional email delivery |
| `STRIPE_SECRET_KEY` | Payment processing |
| `STRIPE_WEBHOOK_SECRET` | Webhook verification |
| `AWS_ACCESS_KEY_ID` | Quantum computing (Braket) |
| `AWS_SECRET_ACCESS_KEY` | Quantum computing (Braket) |
| `AWS_REGION` | Quantum computing region |

## Build & Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## PWA Support

- Service worker: `public/sw.js`
- Manifest: `public/manifest.json`
- Offline indicator component included

## Email Infrastructure

- **Auth Emails:** Custom-branded templates via `auth-email-hook` edge function
- **Transactional:** Template registry with React-rendered HTML
- **Queue:** Batched processing via `process-email-queue`
- **Suppression:** `suppressed_emails` table + unsubscribe tokens

## Monitoring

- **Audit Logs:** All sensitive operations logged to `audit_logs` table
- **Anomaly Detection:** Automated spike detection on key metrics
- **Error Boundaries:** Per-route error capture with fallback UI
- **Observability:** Custom `src/lib/observability.ts` utilities
