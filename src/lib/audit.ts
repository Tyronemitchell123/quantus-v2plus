import { supabase } from "@/integrations/supabase/client";

export async function logAudit(
  action: string,
  resourceType: string,
  resourceId?: string | null,
  metadata?: Record<string, string | number | boolean | null>,
) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;

  try {
    await supabase.functions.invoke("log-audit", {
      body: {
        action,
        resource_type: resourceType,
        resource_id: resourceId ?? null,
        metadata: metadata ?? {},
      },
    });
  } catch {
    // Fire-and-forget: don't break the app if audit logging fails
  }
}
