import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { rateLimit } from "../_shared/rate-limit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CATEGORIES = ["aviation", "medical", "staffing", "lifestyle", "logistics", "partnerships", "marine", "legal", "finance"] as const;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting
    const rateLimited = rateLimit(req, corsHeaders);
    if (rateLimited) return rateLimited;

    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { message, channel = "web" } = await req.json();
    if (!message || typeof message !== "string" || message.trim().length < 5) {
      return new Response(JSON.stringify({ error: "Message is required (min 5 characters)" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user tier for priority scoring
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("tier")
      .eq("user_id", user.id)
      .single();

    const tierBoost: Record<string, number> = {
      enterprise: 30, professional: 20, teams: 15, starter: 5, free: 0,
    };
    const userTierBoost = tierBoost[sub?.tier || "free"] || 0;

    // AI Classification
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
            content: `You are the intake classification engine for Quantus V2+, an ultra-luxury UHNW orchestration platform. Analyze the client's request and extract structured deal intelligence. Be precise and thorough. For budget, extract numeric values in the currency mentioned (default USD). For timeline, estimate days. For priority scoring: consider deal value, urgency signals, complexity. Score each 0-100.`,
          },
          { role: "user", content: message },
        ],
        tools: [{
          type: "function",
          function: {
            name: "classify_deal",
            description: "Classify and structure an incoming deal request",
            parameters: {
              type: "object",
              properties: {
                category: { type: "string", enum: CATEGORIES, description: "Primary deal category" },
                sub_category: { type: "string", description: "Specific sub-category (e.g. Aircraft Acquisition, Executive Health Screening)" },
                intent: { type: "string", description: "Client's core intent in one phrase" },
                budget_min: { type: "number", description: "Minimum budget estimate (null if not mentioned)" },
                budget_max: { type: "number", description: "Maximum budget estimate" },
                budget_currency: { type: "string", description: "Currency code (USD, GBP, EUR)" },
                timeline_days: { type: "integer", description: "Estimated timeline in days" },
                location: { type: "string", description: "Primary location if mentioned" },
                constraints: { type: "array", items: { type: "string" }, description: "Hard constraints or non-negotiables" },
                preferences: { type: "array", items: { type: "string" }, description: "Soft preferences" },
                requirements: {
                  type: "object",
                  properties: {
                    vendors_needed: { type: "array", items: { type: "string" } },
                    documents_needed: { type: "array", items: { type: "string" } },
                    key_specs: { type: "array", items: { type: "string" } },
                  },
                },
                urgency_score: { type: "integer", description: "0-100 urgency rating" },
                complexity_score: { type: "integer", description: "0-100 complexity rating" },
                probability_score: { type: "integer", description: "0-100 likelihood of closing" },
                deal_value_estimate: { type: "number", description: "Estimated deal value in USD" },
                confirmation_message: { type: "string", description: "A luxury-grade confirmation message in Quantus V2+'s elegant tone, 2-3 sentences acknowledging the request with specifics" },
              },
              required: ["category", "sub_category", "intent", "urgency_score", "complexity_score", "probability_score", "confirmation_message"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "classify_deal" } },
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await aiResponse.text();
      console.error("AI error:", aiResponse.status, t);
      throw new Error("AI classification failed");
    }

    const aiResult = await aiResponse.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No structured response from AI");

    const classified = JSON.parse(toolCall.function.arguments);

    // Calculate priority score
    const rawPriority = Math.round(
      (classified.urgency_score * 0.35) +
      (classified.complexity_score * 0.15) +
      (classified.probability_score * 0.2) +
      (Math.min((classified.deal_value_estimate || 0) / 100000, 30)) +
      userTierBoost
    );
    const priorityScore = Math.min(100, Math.max(0, rawPriority));

    // Route to engine
    const engineMap: Record<string, string> = {
      aviation: "Aviation Engine",
      medical: "Medical Engine",
      staffing: "Staffing Engine",
      lifestyle: "Lifestyle Engine",
      logistics: "Logistics Engine",
      partnerships: "Partnership Engine",
      marine: "Marine Engine",
      legal: "Legal Engine",
      finance: "Finance Engine",
    };

    // Insert deal
    const { data: deal, error: insertError } = await supabase
      .from("deals")
      .insert({
        user_id: user.id,
        raw_input: message.trim().substring(0, 5000),
        input_channel: channel,
        category: classified.category,
        sub_category: classified.sub_category,
        intent: classified.intent,
        budget_min: classified.budget_min || null,
        budget_max: classified.budget_max || null,
        budget_currency: classified.budget_currency || "USD",
        timeline_days: classified.timeline_days || null,
        location: classified.location || null,
        constraints: classified.constraints || [],
        preferences: classified.preferences || [],
        requirements: classified.requirements || {},
        priority_score: priorityScore,
        deal_value_estimate: classified.deal_value_estimate || null,
        complexity_score: classified.complexity_score,
        urgency_score: classified.urgency_score,
        probability_score: classified.probability_score,
        status: "intake",
        routed_engine: engineMap[classified.category] || "General",
        ai_confirmation: classified.confirmation_message,
        ai_classification_raw: classified,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error("Failed to create deal");
    }

    return new Response(JSON.stringify({ deal }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("intake-classify error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Something went wrong" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
