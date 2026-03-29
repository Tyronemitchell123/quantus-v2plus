import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NurturePayload {
  action: "check-and-send" | "send-single";
  userId?: string;
  day?: number;
}

const DRIP_SCHEDULE = [
  { day: 1, subject: "Welcome to Quantus V2+ — Your Intelligence Engine Awaits", templateKey: "welcome-drip" },
  { day: 3, subject: "3 Ways Quantus V2+ Saves You Hours Every Week", templateKey: "tips-drip" },
  { day: 7, subject: "Unlock Premium Capabilities — Exclusive Offer Inside", templateKey: "upgrade-drip" },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const body: NurturePayload = await req.json();

    if (body.action === "check-and-send") {
      // Find users who signed up X days ago and haven't received drip yet
      const now = new Date();

      for (const drip of DRIP_SCHEDULE) {
        const targetDate = new Date(now);
        targetDate.setDate(now.getDate() - drip.day);
        const dayStart = new Date(targetDate);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(targetDate);
        dayEnd.setHours(23, 59, 59, 999);

        // Get profiles created on that day
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name, created_at")
          .gte("created_at", dayStart.toISOString())
          .lte("created_at", dayEnd.toISOString());

        if (!profiles || profiles.length === 0) continue;

        for (const profile of profiles) {
          // Check if already sent
          const { data: existing } = await supabase
            .from("email_send_log")
            .select("id")
            .eq("template_name", drip.templateKey)
            .eq("recipient_email", profile.user_id)
            .limit(1);

          if (existing && existing.length > 0) continue;

          // Get user email
          const { data: userData } = await supabase.auth.admin.getUserById(profile.user_id);
          if (!userData?.user?.email) continue;

          // Check suppression
          const { data: suppressed } = await supabase
            .from("suppressed_emails")
            .select("id")
            .eq("email", userData.user.email)
            .limit(1);

          if (suppressed && suppressed.length > 0) continue;

          // Enqueue the email
          const emailPayload = {
            to: userData.user.email,
            subject: drip.subject,
            template_name: drip.templateKey,
            purpose: "transactional",
            data: {
              displayName: profile.display_name || userData.user.email.split("@")[0],
              day: drip.day,
            },
          };

          await supabase.rpc("enqueue_email", {
            queue_name: "transactional_emails",
            payload: emailPayload,
          });

          // Log it
          await supabase.from("email_send_log").insert({
            template_name: drip.templateKey,
            recipient_email: userData.user.email,
            status: "pending",
            message_id: `${drip.templateKey}-${profile.user_id}`,
          });
        }
      }

      return new Response(JSON.stringify({ success: true, message: "Drip check complete" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
