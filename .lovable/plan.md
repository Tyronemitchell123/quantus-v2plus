# Full Production Launch Plan — All 4 Priorities

## 1. Get Real Payments In
- **Custom domain**: Connect your IONOS domain (A records → 185.158.133.1) so invoice emails come from your brand, not lovable.app
- **Real invoice emails**: Wire up the existing transactional email system to auto-send branded invoice emails to vendors with Stripe Checkout links when deals complete
- **Payment follow-up**: Add a cron job that re-sends payment reminders for unpaid invoices every 48 hours

## 2. Acquire Real Clients
- **Landing page SEO**: Add JSON-LD, meta tags, and sitemap for all key pages
- **Lead capture upgrade**: Connect the waiting list → auto-nurture email drip → onboarding flow so signups convert to paying users
- **Referral amplification**: Enable the existing referral program with real credit rewards on signup

## 3. Polish the Platform
- **Mobile responsiveness audit**: Fix any layout issues at 360px viewport across all key flows (landing, dashboard, deals, settings)
- **Performance**: Lazy-load heavy pages (Quantum, Wealth, Sovereign dashboards)
- **Error handling**: Ensure all edge function failures show user-friendly toasts, not raw errors

## 4. Automate Everything
- **Deal auto-progression cron**: Scheduled function that moves deals through sourcing → negotiation → execution → completion automatically based on time + conditions
- **Auto-scraping cron**: Run Firecrawl vendor discovery weekly to find new vendors
- **Auto-outreach**: When new vendors are discovered, auto-generate and queue outreach drafts

## Implementation Order
1. Custom domain setup (user action — DNS records)
2. Invoice email pipeline (code + edge function)
3. Deal auto-progression cron (edge function + pg_cron)
4. SEO + landing page polish (code changes)
5. Mobile audit + fixes (code changes)
6. Auto-scraping cron (edge function + pg_cron)

This is a multi-session effort. I'll start with the highest-impact items: **invoice emails** and **deal auto-progression**, since those directly drive revenue.
