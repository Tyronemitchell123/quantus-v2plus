import { supabase } from "@/integrations/supabase/client";

type DealPhaseTemplate =
  | "deal-intake-confirmation"
  | "deal-sourcing-update"
  | "deal-vendor-match"
  | "deal-negotiation-progress"
  | "deal-completion-summary";

// Map legacy underscore names to kebab-case
const TEMPLATE_ALIAS: Record<string, DealPhaseTemplate> = {
  deal_intake_confirmation: "deal-intake-confirmation",
  deal_sourcing_update: "deal-sourcing-update",
  deal_vendor_match: "deal-vendor-match",
  deal_negotiation_progress: "deal-negotiation-progress",
  deal_completion_summary: "deal-completion-summary",
};

interface SendDealPhaseEmailParams {
  template: DealPhaseTemplate | string;
  dealId?: string;
  data?: Record<string, any>;
}

/**
 * Sends a deal phase transition email to the current user.
 * Silently fails — deal flow should never be blocked by email errors.
 */
export async function sendDealPhaseEmail({ template, dealId, data }: SendDealPhaseEmailParams) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return;

    const resolvedTemplate = TEMPLATE_ALIAS[template] || template;
    const key = dealId || crypto.randomUUID();

    await supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName: resolvedTemplate,
        recipientEmail: user.email,
        idempotencyKey: `${resolvedTemplate}-${key}`,
        templateData: data || {},
      },
    });
  } catch (err) {
    console.warn("Deal phase email failed (non-blocking):", err);
  }
}
