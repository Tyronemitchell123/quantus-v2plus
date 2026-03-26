import { supabase } from "@/integrations/supabase/client";

type DealPhaseTemplate =
  | "deal_intake_confirmation"
  | "deal_sourcing_update"
  | "deal_vendor_match"
  | "deal_negotiation_progress"
  | "deal_completion_summary";

interface SendDealPhaseEmailParams {
  template: DealPhaseTemplate;
  data?: Record<string, any>;
}

/**
 * Sends a deal phase transition email to the current user.
 * Silently fails — deal flow should never be blocked by email errors.
 */
export async function sendDealPhaseEmail({ template, data }: SendDealPhaseEmailParams) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return;

    await supabase.functions.invoke("send-transactional-email", {
      body: {
        template,
        to: user.email,
        data: data || {},
      },
    });
  } catch (err) {
    console.warn("Deal phase email failed (non-blocking):", err);
  }
}
