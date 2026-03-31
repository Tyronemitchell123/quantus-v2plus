# Quantus V2+ — Technical Architecture

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript 5, Vite 5 |
| Styling | Tailwind CSS v3, shadcn/ui components |
| Animation | Framer Motion, Three.js (WebGL) |
| State | TanStack React Query, React hooks |
| Routing | React Router v6 (lazy-loaded pages) |
| Backend | Lovable Cloud (Supabase) |
| Database | PostgreSQL with Row-Level Security |
| Auth | Supabase Auth (email/password) |
| Payments | Stripe (Hosted Checkout), Stripe Connect |
| Email | Resend (transactional), custom templates |
| AI | Lovable AI (Gemini, GPT-5 models) |
| Video | Remotion (programmatic video generation) |
| Quantum | AWS Braket integration + local simulator |

## Frontend Architecture

### Page Count: 60+
### Component Count: 150+

All pages are lazy-loaded via `React.lazy()` with `Suspense` fallback. Protected routes require authentication via `<ProtectedRoute>`. Admin routes require `role: 'admin'` verified server-side.

### Key Patterns
- **Error Boundaries:** Global `<ErrorBoundary>` + per-route `<RouteErrorBoundary>`
- **Design Tokens:** All colours defined as HSL CSS variables in `index.css`, consumed via Tailwind
- **Responsive:** Mobile-first with dedicated mobile components (`MobileBottomNav`, `MobileQuickActions`, etc.)
- **SEO:** Custom `useDocumentHead` hook for per-page title, description, canonical, JSON-LD

## Backend Architecture

### Database Tables (30+)
- `profiles` — User display data
- `deals` — Core deal records with AI classification
- `sourcing_results` — Vendor/option matches
- `vendor_outreach` — Outreach tracking
- `deal_documents` — Contract/document management
- `subscriptions` — Stripe-synced subscription state
- `payments` — Payment records
- `commission_logs` — Vertical-specific commission tracking
- `invoices` — Generated invoices
- `quantum_jobs` / `quantum_job_results` — Quantum computing jobs
- `portfolio_assets` — Wealth management data
- `user_roles` — RBAC (admin, moderator, user)
- `audit_logs` — Full audit trail
- `notifications` — In-app notification system
- `chat_messages` — Concierge messaging
- `marketing_posts` / `marketing_social` / `marketing_ads` — Marketing hub
- `nlp_analyses` — NLP tool results
- `usage_records` / `usage_overages` — Usage-based billing
- `referral_codes` / `referral_redemptions` — Referral program

### Edge Functions (35+)
- `intake-classify` — AI deal classification
- `sourcing-engine` — Vendor matching
- `vendor-outreach` — Automated outreach
- `negotiation-engine` — AI negotiation support
- `workflow-engine` — Multi-phase orchestration
- `deal-completion` — Deal finalisation
- `concierge-chat` — AI concierge assistant
- `ai-analytics` — Dashboard intelligence
- `quantum-jobs` — Quantum circuit execution
- `nlp-tools` — Text analysis
- `auth-email-hook` — Custom email templates
- `stripe-connect-*` — Marketplace payments
- `process-email-queue` — Batched email delivery
- `anomaly-detection` — Spike detection
- `lead-nurture` — Automated drip campaigns

### Security
- Row-Level Security (RLS) on all tables
- JWT-based authentication
- `has_role()` SECURITY DEFINER function for admin checks
- API key hashing for programmatic access
- Audit logging on sensitive operations
- HMAC webhook verification

## File Structure

```
src/
├── components/          # 150+ React components
│   ├── ui/              # shadcn/ui primitives
│   ├── dashboard/       # Dashboard shell components
│   ├── deal/            # Deal pipeline components
│   ├── landing/         # Marketing/landing page sections
│   ├── modules/         # Vertical module components
│   ├── mobile/          # Mobile-specific components
│   ├── quantum/         # Quantum computing UI
│   └── ...
├── hooks/               # Custom React hooks
├── pages/               # 60+ page components
├── lib/                 # Utilities and helpers
├── integrations/        # Supabase client + types (auto-generated)
└── assets/              # Static assets

supabase/
├── functions/           # 35+ Edge Functions
│   ├── _shared/         # Shared utilities + email templates
│   └── */index.ts       # Individual function handlers
└── config.toml          # Function configuration

remotion/                # Programmatic video generation
├── src/                 # Video compositions
└── scripts/             # Render scripts
```
