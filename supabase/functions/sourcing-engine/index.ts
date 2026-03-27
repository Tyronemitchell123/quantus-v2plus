import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { rateLimit } from "../_shared/rate-limit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SCORING_MODELS: Record<string, { factors: { name: string; weight: number }[] }> = {
  aviation: {
    factors: [
      { name: "Pedigree & History", weight: 20 },
      { name: "Hours & Cycles", weight: 20 },
      { name: "Maintenance Programs", weight: 15 },
      { name: "Price vs Market", weight: 15 },
      { name: "Location & Logistics", weight: 10 },
      { name: "Seller Reputation", weight: 10 },
      { name: "Deal Complexity", weight: 10 },
    ],
  },
  medical: {
    factors: [
      { name: "Doctor Expertise", weight: 25 },
      { name: "Clinic Reputation", weight: 20 },
      { name: "Treatment Success Rate", weight: 20 },
      { name: "Recovery Environment", weight: 15 },
      { name: "Cost Alignment", weight: 10 },
      { name: "Travel Complexity", weight: 10 },
    ],
  },
  staffing: {
    factors: [
      { name: "Skills Match", weight: 30 },
      { name: "Experience", weight: 20 },
      { name: "Personality Fit", weight: 20 },
      { name: "Background & References", weight: 10 },
      { name: "Salary Alignment", weight: 10 },
      { name: "Availability", weight: 10 },
    ],
  },
  lifestyle: {
    factors: [
      { name: "Luxury Level", weight: 25 },
      { name: "Privacy & Exclusivity", weight: 20 },
      { name: "Location & Season", weight: 15 },
      { name: "Experience Quality", weight: 15 },
      { name: "Cost Alignment", weight: 15 },
      { name: "Risk Level", weight: 10 },
    ],
  },
  logistics: {
    factors: [
      { name: "Route Efficiency", weight: 25 },
      { name: "Safety & Risk", weight: 20 },
      { name: "Vehicle Suitability", weight: 15 },
      { name: "Cost Efficiency", weight: 15 },
      { name: "Time Compliance", weight: 15 },
      { name: "Operational Reliability", weight: 10 },
    ],
  },
  partnerships: {
    factors: [
      { name: "Brand Alignment", weight: 25 },
      { name: "Service Quality", weight: 20 },
      { name: "Revenue Potential", weight: 20 },
      { name: "Reliability Track Record", weight: 15 },
      { name: "Strategic Value", weight: 10 },
      { name: "Exclusivity Potential", weight: 10 },
    ],
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rateLimited = rateLimit(req, corsHeaders);
    if (rateLimited) return rateLimited;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { deal_id } = await req.json();
    if (!deal_id) {
      return new Response(JSON.stringify({ error: "deal_id is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch deal
    const { data: deal, error: dealError } = await supabase
      .from("deals")
      .select("*")
      .eq("id", deal_id)
      .single();

    if (dealError || !deal) {
      return new Response(JSON.stringify({ error: "Deal not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const category = deal.category as string;
    const scoringModel = SCORING_MODELS[category] || SCORING_MODELS.lifestyle;

    // AI Sourcing
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const factorNames = scoringModel.factors.map((f) => `${f.name} (${f.weight}%)`).join(", ");

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
            content: `You are the Sourcing Engine for Quantus A.I, an ultra-luxury UHNW orchestration platform. Given a classified deal profile, generate realistic, detailed sourcing options.

Category: ${category}
Scoring factors: ${factorNames}

Generate exactly 8 options:
- 3 "primary" tier (highest confidence, best match, scores 80-97)
- 3 "secondary" tier (good alternatives, scores 65-82)
- 2 "wildcard" tier (creative/unexpected fits, scores 55-78)

Each option must feel real, detailed, and specific. Use realistic names, locations, specifications. For aviation: real aircraft models with plausible serials. For medical: real clinic-sounding names in known medical hubs. For staffing: realistic candidate profiles. For lifestyle: real destination names with specific properties.

Be specific with costs, locations, availability windows. Include genuine-sounding pros, cons, and risk assessments. The vendor_contact should include plausible contact info and the vendor_prep should include negotiation angles.`,
          },
          {
            role: "user",
            content: `Deal Profile:
- Category: ${category}
- Sub-category: ${deal.sub_category}
- Intent: ${deal.intent}
- Budget: ${deal.budget_min || "flexible"} - ${deal.budget_max || "flexible"} ${deal.budget_currency || "USD"}
- Timeline: ${deal.timeline_days ? deal.timeline_days + " days" : "flexible"}
- Location: ${deal.location || "any"}
- Constraints: ${JSON.stringify(deal.constraints)}
- Preferences: ${JSON.stringify(deal.preferences)}
- Requirements: ${JSON.stringify(deal.requirements)}
- Priority Score: ${deal.priority_score}`,
          },
        ],
        tools: [{
          type: "function",
          function: {
            name: "generate_sourcing_results",
            description: "Generate scored and curated sourcing options for a deal",
            parameters: {
              type: "object",
              properties: {
                options: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      tier: { type: "string", enum: ["primary", "secondary", "wildcard"] },
                      name: { type: "string", description: "Specific name of the option (aircraft reg, clinic name, candidate name, property name)" },
                      description: { type: "string", description: "2-3 sentence detailed description" },
                      overall_score: { type: "integer", description: "0-100 composite score" },
                      score_breakdown: {
                        type: "object",
                        description: "Object with factor names as keys and 0-100 scores as values",
                      },
                      pros: { type: "array", items: { type: "string" }, description: "3-4 specific advantages" },
                      cons: { type: "array", items: { type: "string" }, description: "1-3 specific drawbacks" },
                      risk_level: { type: "string", enum: ["low", "medium", "high"] },
                      estimated_cost: { type: "number", description: "Cost in deal currency" },
                      availability: { type: "string", description: "Availability window or status" },
                      location: { type: "string" },
                      specifications: {
                        type: "object",
                        description: "Category-specific specs (year, hours, beds, skills, rooms, etc.)",
                      },
                      vendor_contact: {
                        type: "object",
                        properties: {
                          company: { type: "string" },
                          contact_name: { type: "string" },
                          email: { type: "string" },
                          phone: { type: "string" },
                          notes: { type: "string" },
                        },
                      },
                      vendor_prep: {
                        type: "object",
                        properties: {
                          negotiation_angle: { type: "string" },
                          pricing_request: { type: "string" },
                          risk_notes: { type: "string" },
                          required_documents: { type: "array", items: { type: "string" } },
                        },
                      },
                      recommended_next_step: { type: "string" },
                    },
                    required: ["tier", "name", "description", "overall_score", "score_breakdown", "pros", "cons", "risk_level", "estimated_cost", "availability", "location", "recommended_next_step"],
                  },
                },
                presentation_message: { type: "string", description: "A luxury-grade message introducing the shortlist, 2-3 sentences, elegant tone" },
              },
              required: ["options", "presentation_message"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "generate_sourcing_results" } },
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
      throw new Error("AI sourcing failed");
    }

    const aiResult = await aiResponse.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No structured response from AI");

    const sourced = JSON.parse(toolCall.function.arguments);

    // Insert sourcing results
    const insertData = sourced.options.map((opt: any) => ({
      deal_id: deal_id,
      user_id: user.id,
      category,
      tier: opt.tier,
      name: opt.name,
      description: opt.description,
      overall_score: opt.overall_score,
      score_breakdown: opt.score_breakdown || {},
      pros: opt.pros || [],
      cons: opt.cons || [],
      risk_level: opt.risk_level || "low",
      estimated_cost: opt.estimated_cost || null,
      cost_currency: deal.budget_currency || "USD",
      availability: opt.availability || null,
      location: opt.location || null,
      specifications: opt.specifications || {},
      vendor_contact: opt.vendor_contact || {},
      vendor_prep: opt.vendor_prep || {},
      recommended_next_step: opt.recommended_next_step || null,
      ai_notes: null,
    }));

    const { data: results, error: insertError } = await supabase
      .from("sourcing_results")
      .insert(insertData)
      .select();

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error("Failed to save sourcing results");
    }

    // Update deal status to sourcing complete
    await supabaseAdmin
      .from("deals")
      .update({ status: "sourcing", ai_confirmation: sourced.presentation_message })
      .eq("id", deal_id);

    return new Response(JSON.stringify({
      results,
      presentation_message: sourced.presentation_message,
      scoring_model: scoringModel,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("sourcing-engine error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Something went wrong" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
