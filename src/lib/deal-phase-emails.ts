import { supabase } from "@/integrations/supabase/client";

type DealPhaseTemplate =
  | "deal-intake-confirmation"
  | "deal-sourcing-update"
  | "deal-vendor-match"
  | "deal-negotiation-progress"
  | "deal-completion-summary";

interface SendDealPhaseEmailParams {
  template: DealPhaseTemplate;
  dealId: string;
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

    await supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName: template,
        recipientEmail: user.email,
        idempotencyKey: `${template}-${dealId}`,
        templateData: data || {},
      },
    });
  } catch (err) {
    console.warn("Deal phase email failed (non-blocking):", err);
  }
}
