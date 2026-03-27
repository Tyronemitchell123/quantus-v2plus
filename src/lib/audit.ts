import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export async function logAudit(
  action: string,
  resourceType: string,
  resourceId?: string | null,
  metadata?: Record<string, string | number | boolean | null>,
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("audit_logs").insert([{
    user_id: user.id,
    action,
    resource_type: resourceType,
    resource_id: resourceId ?? null,
    metadata: (metadata ?? {}) as Json,
  }]);
}
