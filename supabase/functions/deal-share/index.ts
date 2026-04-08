import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

/**
 * Deal Share Token Management
 * POST — Create a share token for a deal (authenticated)
 * GET ?token=xxx — Retrieve deal progress via share token (public)
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    if (req.method === "GET") {
      const url = new URL(req.url);
      const token = url.searchParams.get("token");
      if (!token) throw new Error("Token is required");

      // Look up token
      const { data: shareToken, error: tokenErr } = await supabase
        .from("deal_share_tokens")
        .select("deal_id, expires_at, is_active")
        .eq("token", token)
        .eq("is_active", true)
        .gt("expires_at", new Date().toISOString())
        .single();

      if (tokenErr || !shareToken) {
        return new Response(JSON.stringify({ error: "Invalid or expired tracking link" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get deal progress (safe subset)
      const { data: deal } = await supabase
        .from("deals")
        .select("deal_number, category, status, created_at, completed_at, updated_at")
        .eq("id", shareToken.deal_id)
        .single();

      // Get documents status
      const { data: docs } = await supabase
        .from("deal_documents")
        .select("title, status, document_type")
        .eq("deal_id", shareToken.deal_id);

      // Get invoice status (safe subset)
      const { data: invoices } = await supabase
        .from("invoices")
        .select("invoice_number, status, amount_cents, currency, created_at, paid_at")
        .eq("deal_id", shareToken.deal_id);

      const phases = ["intake", "sourcing", "matching", "shortlisted", "negotiation", "execution", "completed"];
      const currentPhaseIndex = phases.indexOf(deal?.status || "intake");

      return new Response(JSON.stringify({
        deal: {
          number: deal?.deal_number,
          category: deal?.category,
          status: deal?.status,
          phase: currentPhaseIndex + 1,
          totalPhases: phases.length,
          progressPercent: Math.round(((currentPhaseIndex + 1) / phases.length) * 100),
          started: deal?.created_at,
          completed: deal?.completed_at,
          lastUpdate: deal?.updated_at,
        },
        documents: (docs || []).map(d => ({ title: d.title, status: d.status, type: d.document_type })),
        invoices: (invoices || []).map(i => ({
          number: i.invoice_number,
          status: i.status,
          amount: `${i.currency === "GBP" ? "£" : "$"}${(i.amount_cents / 100).toFixed(2)}`,
          created: i.created_at,
          paid: i.paid_at,
        })),
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST — create share token
    const authHeader = req.headers.get("authorization");
    if (!authHeader) throw new Error("Unauthorized");

    const { data: { user } } = await createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!
    ).auth.getUser(authHeader.replace("Bearer ", ""));

    if (!user) throw new Error("Unauthorized");

    const { dealId, expiresInDays = 30 } = await req.json();
    if (!dealId) throw new Error("dealId is required");

    // Verify user owns the deal
    const { data: deal } = await supabase.from("deals").select("id").eq("id", dealId).eq("user_id", user.id).single();
    if (!deal) throw new Error("Deal not found");

    // Check for existing active token
    const { data: existing } = await supabase
      .from("deal_share_tokens")
      .select("token")
      .eq("deal_id", dealId)
      .eq("is_active", true)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (existing) {
      return new Response(JSON.stringify({ token: existing.token }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: newToken } = await supabase
      .from("deal_share_tokens")
      .insert({
        deal_id: dealId,
        created_by: user.id,
        expires_at: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select("token")
      .single();

    return new Response(JSON.stringify({ token: newToken?.token }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
