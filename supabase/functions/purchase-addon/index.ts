import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData.user) throw new Error("Unauthorized");
    const user = userData.user;

    const { addon_id } = await req.json();
    if (!addon_id) throw new Error("addon_id is required");

    // Look up the canonical addon price server-side
    const { data: addon, error: addonErr } = await supabase
      .from("addons")
      .select("id, price_cents, name, is_active")
      .eq("id", addon_id)
      .single();

    if (addonErr || !addon) throw new Error("Add-on not found");
    if (!addon.is_active) throw new Error("This add-on is no longer available");

    // Check for existing active purchase
    const { data: existing } = await supabase
      .from("addon_purchases")
      .select("id")
      .eq("user_id", user.id)
      .eq("addon_id", addon_id)
      .eq("status", "active")
      .maybeSingle();

    if (existing) throw new Error("You already have this add-on active");

    // Insert with server-validated price
    const { error: insertErr } = await supabase
      .from("addon_purchases")
      .insert({
        user_id: user.id,
        addon_id: addon.id,
        amount_cents: addon.price_cents,
        status: "active",
      });

    if (insertErr) throw new Error(`Purchase failed: ${insertErr.message}`);

    return new Response(JSON.stringify({ success: true, addon_name: addon.name }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: msg }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
