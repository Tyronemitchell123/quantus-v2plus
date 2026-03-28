import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { rateLimit } from "../_shared/rate-limit.ts";

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
    const rateLimited = rateLimit(req, corsHeaders);
    if (rateLimited) return rateLimited;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: { user }, error: authErr } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { alert_id } = await req.json();
    if (!alert_id) {
      return new Response(JSON.stringify({ error: "alert_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch the alert
    const { data: alert } = await supabase
      .from("anomaly_alerts")
      .select("*")
      .eq("id", alert_id)
      .eq("user_id", user.id)
      .single();

    if (!alert) {
      return new Response(JSON.stringify({ error: "Alert not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch recent usage context
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: recentUsage } = await supabase
      .from("usage_records")
      .select("feature, quantity, recorded_at")
      .eq("user_id", user.id)
      .gte("recorded_at", thirtyDaysAgo)
      .order("recorded_at", { ascending: false })
      .limit(100);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a data analyst for QUANTUS V2+ platform. Analyze anomaly alerts and explain WHY they happened, what likely caused them, and what the user should do. Be concise but insightful. Use markdown formatting.`,
          },
          {
            role: "user",
            content: `Analyze this anomaly alert and explain what likely caused it:

Alert: ${alert.title}
Description: ${alert.description}
Severity: ${alert.severity}
Metric: ${alert.metric_name} = ${alert.metric_value} (threshold: ${alert.threshold})
Time: ${alert.created_at}

Recent usage context (last 30 days, newest first):
${(recentUsage || []).slice(0, 20).map((r: any) => `${r.recorded_at}: ${r.feature} x${r.quantity}`).join("\n")}

Provide:
1. Root cause analysis (what likely triggered this)
2. Impact assessment (what this means for the user)
3. Recommended action (what they should do)`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "anomaly_narrative",
              description: "Structured anomaly explanation",
              parameters: {
                type: "object",
                properties: {
                  root_cause: { type: "string", description: "What likely caused this anomaly" },
                  impact: { type: "string", description: "What this means for the user" },
                  recommendation: { type: "string", description: "What the user should do" },
                  confidence: { type: "string", enum: ["high", "medium", "low"], description: "Confidence in the analysis" },
                },
                required: ["root_cause", "impact", "recommendation", "confidence"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "anomaly_narrative" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error");
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No narrative generated");

    const narrative = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(narrative), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("anomaly-narratives error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
