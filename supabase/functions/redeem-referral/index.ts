import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { rateLimit } from "../_shared/rate-limit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const rateLimited = rateLimit(req, corsHeaders);
    if (rateLimited) return rateLimited;

    const { referralCode } = await req.json();
    if (!referralCode || typeof referralCode !== "string") {
      return new Response(JSON.stringify({ error: "Missing referral code" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Get the referring user from the JWT
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Look up the referral code
    const { data: codeData, error: codeError } = await adminClient
      .from("referral_codes")
      .select("*")
      .eq("code", referralCode.trim().toUpperCase())
      .eq("is_active", true)
      .maybeSingle();

    if (codeError || !codeData) {
      return new Response(JSON.stringify({ error: "Invalid or expired referral code" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Can't use your own code
    if (codeData.user_id === user.id) {
      return new Response(JSON.stringify({ error: "You cannot use your own referral code" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if already redeemed
    const { data: existing } = await adminClient
      .from("referral_redemptions")
      .select("id")
      .eq("referred_id", user.id)
      .limit(1)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ error: "You have already used a referral code" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check max uses
    if (codeData.max_uses && codeData.uses_count >= codeData.max_uses) {
      return new Response(JSON.stringify({ error: "This referral code has reached its limit" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const credits = codeData.reward_credits || 500;

    // Insert redemption
    const { error: redemptionError } = await adminClient
      .from("referral_redemptions")
      .insert({
        referral_code_id: codeData.id,
        referrer_id: codeData.user_id,
        referred_id: user.id,
        credits_awarded: credits,
      });

    if (redemptionError) throw redemptionError;

    // Update uses count
    await adminClient
      .from("referral_codes")
      .update({ uses_count: codeData.uses_count + 1 })
      .eq("id", codeData.id);

    // Award credits to referrer
    const { data: referrerCredits } = await adminClient
      .from("user_credits")
      .select("*")
      .eq("user_id", codeData.user_id)
      .maybeSingle();

    if (referrerCredits) {
      await adminClient.from("user_credits").update({
        balance: referrerCredits.balance + credits,
        lifetime_earned: referrerCredits.lifetime_earned + credits,
      }).eq("user_id", codeData.user_id);
    } else {
      await adminClient.from("user_credits").insert({
        user_id: codeData.user_id,
        balance: credits,
        lifetime_earned: credits,
      });
    }

    // Award credits to new user too
    const { data: newUserCredits } = await adminClient
      .from("user_credits")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (newUserCredits) {
      await adminClient.from("user_credits").update({
        balance: newUserCredits.balance + credits,
        lifetime_earned: newUserCredits.lifetime_earned + credits,
      }).eq("user_id", user.id);
    } else {
      await adminClient.from("user_credits").insert({
        user_id: user.id,
        balance: credits,
        lifetime_earned: credits,
      });
    }

    return new Response(JSON.stringify({ success: true, credits_awarded: credits }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
