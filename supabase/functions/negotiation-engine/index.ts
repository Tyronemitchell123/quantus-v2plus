import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
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

    const body = await req.json();
    const { action } = body;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // ACTION: analyze — Full negotiation readiness analysis for a deal
    if (action === "analyze") {
      const { deal_id } = body;
      if (!deal_id) {
        return new Response(JSON.stringify({ error: "deal_id required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: deal } = await supabase.from("deals").select("*").eq("id", deal_id).single();
      if (!deal) {
        return new Response(JSON.stringify({ error: "Deal not found" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get all outreach with messages
      const { data: outreachList } = await supabase
        .from("vendor_outreach")
        .select("*, vendor_messages(*)")
        .eq("deal_id", deal_id)
        .order("vendor_score", { ascending: false });

      if (!outreachList || outreachList.length === 0) {
        return new Response(JSON.stringify({ error: "No vendor outreach found. Complete Phase 3 first." }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get sourcing results for market context
      const { data: sourcingResults } = await supabase
        .from("sourcing_results")
        .select("*")
        .eq("deal_id", deal_id)
        .order("overall_score", { ascending: false });

      const vendorSummaries = outreachList.map((o: any) => {
        const msgs = (o.vendor_messages as any[]) || [];
        const responses = msgs.filter((m: any) => m.direction === "inbound");
        return `Vendor: ${o.vendor_name} (${o.vendor_company || "N/A"})
Status: ${o.status}, Score: ${o.vendor_score || 0}, Response Time: ${o.response_time_hours || "N/A"}h
Negotiation Ready: ${o.negotiation_ready}
Existing Prep: ${JSON.stringify(o.negotiation_prep || {})}
Messages: ${msgs.map((m: any) => `[${m.direction}] ${m.body.slice(0, 200)}`).join("\n")}
Responses: ${responses.length}`;
      }).join("\n---\n");

      const marketContext = (sourcingResults || []).map((r: any) =>
        `${r.name}: Score ${r.overall_score}, Cost ${r.estimated_cost} ${r.cost_currency}, Risk: ${r.risk_level}`
      ).join("\n");

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
              content: `You are the Negotiation Intelligence Engine for Quantus A.I — an ultra-luxury UHNW deal platform. Analyze vendor engagement data and produce a comprehensive negotiation strategy for the entire deal.

You must evaluate:
1. Each vendor's position (pricing fairness, motivation, flexibility)
2. Market positioning (comparable options, seasonal factors, demand)
3. Client positioning (budget, timeline, non-negotiables)
4. Leverage points per category
5. Recommended negotiation strategies with tone options
6. Simulation of likely outcomes

Be specific, data-driven, and strategically sophisticated. Think like a $2,000/hour negotiation consultant.`,
            },
            {
              role: "user",
              content: `Deal: ${deal.intent || deal.sub_category} (${deal.category})
Budget: ${deal.budget_min || "flex"} - ${deal.budget_max || "flex"} ${deal.budget_currency || "USD"}
Timeline: ${deal.timeline_days ? deal.timeline_days + " days" : "flexible"}
Priority: ${deal.priority_score}
Requirements: ${JSON.stringify(deal.requirements)}
Constraints: ${JSON.stringify(deal.constraints)}

Market Context:
${marketContext}

Vendor Engagement Data:
${vendorSummaries}`,
            },
          ],
          tools: [{
            type: "function",
            function: {
              name: "negotiation_analysis",
              description: "Comprehensive negotiation analysis for the deal",
              parameters: {
                type: "object",
                properties: {
                  deal_assessment: {
                    type: "object",
                    properties: {
                      overall_readiness: { type: "integer", description: "0-100 readiness score" },
                      market_position: { type: "string", enum: ["buyer_advantage", "balanced", "seller_advantage"] },
                      recommended_timeline: { type: "string" },
                      confidence_level: { type: "integer", description: "0-100 confidence of closing" },
                    },
                  },
                  vendor_analyses: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        vendor_name: { type: "string" },
                        position_strength: { type: "integer", description: "0-100" },
                        pricing_fairness: { type: "string", enum: ["below_market", "fair", "above_market", "premium"] },
                        motivation_level: { type: "string", enum: ["low", "medium", "high", "urgent"] },
                        flexibility_indicators: { type: "array", items: { type: "string" } },
                        leverage_points: { type: "array", items: { type: "string" } },
                        risk_flags: { type: "array", items: { type: "string" } },
                        recommended_tone: { type: "string", enum: ["ultra_formal", "discreet", "assertive", "exploratory", "high_urgency", "soft_touch"] },
                        recommended_approach: { type: "string", enum: ["price_reduction", "added_value", "faster_timeline", "bundled_services", "conditional_acceptance", "multi_option_leverage"] },
                        counter_offer_draft: { type: "string", description: "Luxury-grade counter-offer message" },
                        simulation: {
                          type: "object",
                          properties: {
                            likely_response: { type: "string" },
                            acceptance_probability: { type: "integer" },
                            counter_scenarios: { type: "array", items: { type: "string" } },
                            walk_away_threshold: { type: "string" },
                          },
                        },
                      },
                      required: ["vendor_name", "position_strength", "pricing_fairness", "leverage_points", "counter_offer_draft", "simulation"],
                    },
                  },
                  strategy_summary: {
                    type: "object",
                    properties: {
                      primary_strategy: { type: "string" },
                      fallback_strategy: { type: "string" },
                      key_leverage: { type: "array", items: { type: "string" } },
                      things_to_avoid: { type: "array", items: { type: "string" } },
                      things_to_push: { type: "array", items: { type: "string" } },
                      document_checklist: { type: "array", items: { type: "string" } },
                    },
                  },
                },
                required: ["deal_assessment", "vendor_analyses", "strategy_summary"],
              },
            },
          }],
          tool_choice: { type: "function", function: { name: "negotiation_analysis" } },
        }),
      });

      if (!aiResponse.ok) {
        if (aiResponse.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (aiResponse.status === 402) {
          return new Response(JSON.stringify({ error: "Credits exhausted. Please add funds." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error("AI negotiation analysis failed");
      }

      const aiResult = await aiResponse.json();
      const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall) throw new Error("No structured response from AI");

      const analysis = JSON.parse(toolCall.function.arguments);

      // Update deal status to negotiation
      await supabaseAdmin.from("deals").update({ status: "negotiation" }).eq("id", deal_id);

      // Update each vendor's negotiation prep with the new analysis
      for (const va of analysis.vendor_analyses) {
        const matchingOutreach = outreachList.find((o: any) =>
          o.vendor_name.toLowerCase().includes(va.vendor_name.toLowerCase()) ||
          va.vendor_name.toLowerCase().includes(o.vendor_name.toLowerCase())
        );
        if (matchingOutreach) {
          await supabase.from("vendor_outreach").update({
            negotiation_ready: true,
            negotiation_prep: {
              ...va,
              updated_at: new Date().toISOString(),
            },
          }).eq("id", matchingOutreach.id);
        }
      }

      return new Response(JSON.stringify(analysis), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACTION: counter_offer — Draft and optionally send a counter-offer for a specific vendor
    if (action === "counter_offer") {
      const { outreach_id, approved_message, custom_edits } = body;
      if (!outreach_id) {
        return new Response(JSON.stringify({ error: "outreach_id required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: outreach } = await supabase
        .from("vendor_outreach")
        .select("*")
        .eq("id", outreach_id)
        .single();

      if (!outreach) {
        return new Response(JSON.stringify({ error: "Outreach not found" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const messageBody = custom_edits || approved_message || (outreach.negotiation_prep as any)?.counter_offer_draft;
      if (!messageBody) {
        return new Response(JSON.stringify({ error: "No counter-offer message provided" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Insert counter-offer as outbound message
      await supabase.from("vendor_messages").insert({
        outreach_id,
        user_id: user.id,
        direction: "outbound",
        channel: "email",
        subject: `Re: Negotiation — ${outreach.vendor_name}`,
        body: messageBody,
        tone: "assertive",
        ai_generated: !custom_edits,
        metadata: { type: "counter_offer" },
      });

      // Update outreach status
      await supabase.from("vendor_outreach").update({
        status: "negotiation_ready",
      }).eq("id", outreach_id);

      return new Response(JSON.stringify({ success: true, message: "Counter-offer recorded" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACTION: simulate — Run a negotiation simulation for a specific vendor
    if (action === "simulate") {
      const { outreach_id, scenario } = body;
      if (!outreach_id) {
        return new Response(JSON.stringify({ error: "outreach_id required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: outreach } = await supabase
        .from("vendor_outreach")
        .select("*, vendor_messages(*)")
        .eq("id", outreach_id)
        .single();

      if (!outreach) {
        return new Response(JSON.stringify({ error: "Outreach not found" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const msgs = (outreach.vendor_messages as any[]) || [];
      const conversation = msgs.map((m: any) =>
        `[${m.direction === "outbound" ? "SENT" : "RECEIVED"}] ${m.body}`
      ).join("\n---\n");

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
              content: `You are a UHNW deal simulation engine. Predict negotiation outcomes based on conversation history, vendor behavior patterns, and market dynamics. Provide 3 scenarios: best case, likely case, and worst case.`,
            },
            {
              role: "user",
              content: `Vendor: ${outreach.vendor_name} (${outreach.category})
Vendor Score: ${outreach.vendor_score}
Current Prep: ${JSON.stringify(outreach.negotiation_prep)}
${scenario ? `Custom scenario: ${scenario}` : ""}

Conversation:
${conversation}

Simulate the next 2-3 negotiation rounds.`,
            },
          ],
          tools: [{
            type: "function",
            function: {
              name: "simulation_result",
              description: "Negotiation simulation with multiple scenarios",
              parameters: {
                type: "object",
                properties: {
                  scenarios: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        label: { type: "string", enum: ["best_case", "likely_case", "worst_case"] },
                        probability: { type: "integer" },
                        outcome: { type: "string" },
                        final_price_estimate: { type: "string" },
                        rounds_to_close: { type: "integer" },
                        key_concessions: { type: "array", items: { type: "string" } },
                        risks: { type: "array", items: { type: "string" } },
                      },
                      required: ["label", "probability", "outcome", "rounds_to_close"],
                    },
                  },
                  recommended_next_move: { type: "string" },
                  timing_advice: { type: "string" },
                  walk_away_recommendation: { type: "boolean" },
                },
                required: ["scenarios", "recommended_next_move"],
              },
            },
          }],
          tool_choice: { type: "function", function: { name: "simulation_result" } },
        }),
      });

      if (!aiResponse.ok) {
        if (aiResponse.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limited. Try again shortly." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error("AI simulation failed");
      }

      const aiResult = await aiResponse.json();
      const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall) throw new Error("No simulation result");

      const simulation = JSON.parse(toolCall.function.arguments);

      return new Response(JSON.stringify(simulation), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACTION: finalize — Mark negotiation complete and hand off to Phase 5
    if (action === "finalize") {
      const { deal_id } = body;
      if (!deal_id) {
        return new Response(JSON.stringify({ error: "deal_id required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      await supabaseAdmin.from("deals").update({ status: "execution" }).eq("id", deal_id);

      return new Response(JSON.stringify({
        success: true,
        message: "Negotiation complete. Deal advanced to Workflow Orchestration.",
        next_phase: "execution",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("Negotiation engine error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
