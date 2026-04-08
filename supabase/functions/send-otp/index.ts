import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const authHeader = req.headers.get("authorization");
    if (!authHeader) throw new Error("Missing authorization header");

    const { data: { user }, error: authErr } = await createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!
    ).auth.getUser(authHeader.replace("Bearer ", ""));

    if (authErr || !user) throw new Error("Unauthorized");

    const { purpose = "high_value_action" } = await req.json();

    // Generate 6-digit OTP
    const code = String(Math.floor(100000 + Math.random() * 900000));

    // Invalidate previous codes
    await supabase.from("otp_codes").delete().eq("user_id", user.id).eq("purpose", purpose).eq("verified", false);

    // Insert new OTP
    await supabase.from("otp_codes").insert({
      user_id: user.id,
      code,
      purpose,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    });

    // Send OTP email
    await supabase.functions.invoke("send-transactional-email", {
      body: {
        template_name: "otp-verification",
        recipient_email: user.email,
        idempotency_key: `otp-${user.id}-${Date.now()}`,
        templateData: {
          customerName: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
          otpCode: code,
          purpose: purpose.replace(/_/g, " "),
          expiresIn: "10 minutes",
        },
      },
    });

    return new Response(JSON.stringify({ success: true, message: "OTP sent to your email" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
