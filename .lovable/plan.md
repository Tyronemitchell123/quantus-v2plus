

## Email Testing & Send Test Email

### What We'll Build

1. **Add a "Send Test Email" panel** to the existing Admin Dashboard's Email Monitoring tab — a card with a recipient input (pre-filled), template selector, and send button that invokes `send-transactional-email` directly.

2. **Send a test email** to `Tyrone.mitchell76@hotmail.com` using the `contact-confirmation` template to verify the pipeline end-to-end.

### Implementation Steps

**Step 1 — Add Send Test Email UI to EmailMonitoringTab**
- Add a collapsible "Send Test Email" card at the top of `src/components/admin/EmailMonitoringTab.tsx`
- Fields: recipient email input, template dropdown (populated from the existing `TEMPLATES` registry keys), optional `templateData` JSON textarea
- "Send Test" button that calls `supabase.functions.invoke('send-transactional-email', { body: { templateName, recipientEmail, idempotencyKey: \`test-\${Date.now()}\` } })`
- Show success/error toast on completion

**Step 2 — Send the test email**
- Use the edge function curl tool to invoke `send-transactional-email` with:
  - `templateName: "contact-confirmation"`
  - `recipientEmail: "Tyrone.mitchell76@hotmail.com"`
  - `idempotencyKey: "test-tyrone-{timestamp}"`
  - `templateData: { name: "Tyrone" }`

**Step 3 — Fix runtime errors**
- Investigate and resolve the dynamic import failures for `Index.tsx` and `WelcomeTooltips.tsx` (likely transient build cache issues — a rebuild should resolve).

### Technical Details

- No new edge functions needed — uses existing `send-transactional-email`
- No database changes required
- The test email panel is admin-only (already behind the admin dashboard route)
- Template list is hardcoded from known templates: `contact-confirmation`, `deal-intake-confirmation`, `deal-sourcing-update`, `deal-vendor-match`, `deal-negotiation-progress`, `deal-completion-summary`, `payment-reminder`

