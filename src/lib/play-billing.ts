import { supabase } from "@/integrations/supabase/client";

export interface PlayPurchase {
  packageName?: string;
  productId: string;
  purchaseToken: string;
}

export interface VerifyResult {
  success: boolean;
  demo: boolean;
  tier: string;
  billing_cycle: string;
  period_end: string | null;
  order_id: string;
}

/**
 * Verify a Google Play purchase token server-side and sync
 * the entitlement to the subscriptions table.
 */
export async function verifyPlayPurchase(
  purchase: PlayPurchase
): Promise<VerifyResult> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const res = await fetch(
    `https://${projectId}.supabase.co/functions/v1/google-play-verify`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
      body: JSON.stringify(purchase),
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Verification failed");
  return data as VerifyResult;
}
