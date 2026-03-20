import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticateRequest } from "../_shared/api-key-auth.ts";

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
    const { type } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = "";
    let userPrompt = "";
    const tools: any[] = [];
    let tool_choice: any = undefined;

    if (type === "dashboard-insights") {
      systemPrompt = `You are NEXUS AI's autonomous analytics engine. Generate realistic, data-driven business intelligence insights. Return structured data using the provided tool.`;
      userPrompt = `Generate a comprehensive real-time analytics snapshot for a premium AI platform business. Include:
1. 4 KPI metrics with current values, percentage changes, and trend direction
2. Revenue data for the last 8 months (realistic growth trajectory)
3. User engagement data for each day of the week
4. 3 AI-generated predictive insights about the business
5. 2 anomaly detections with severity levels
6. A market sentiment score (0-100) with brief analysis`;

      tools.push({
        type: "function",
        function: {
          name: "generate_dashboard",
          description: "Generate complete dashboard analytics data",
          parameters: {
            type: "object",
            properties: {
              metrics: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    label: { type: "string" },
                    value: { type: "string" },
                    change: { type: "string" },
                    trend: { type: "string", enum: ["up", "down", "stable"] },
                    icon: { type: "string", enum: ["dollar", "users", "trending", "activity"] },
                  },
                  required: ["id", "label", "value", "change", "trend", "icon"],
                },
              },
              revenue: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    month: { type: "string" },
                    value: { type: "number" },
                    predicted: { type: "number" },
                  },
                  required: ["month", "value"],
                },
              },
              engagement: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    day: { type: "string" },
                    sessions: { type: "number" },
                    aiQueries: { type: "number" },
                  },
                  required: ["day", "sessions", "aiQueries"],
                },
              },
              predictions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    confidence: { type: "number" },
                    impact: { type: "string", enum: ["high", "medium", "low"] },
                  },
                  required: ["title", "description", "confidence", "impact"],
                },
              },
              anomalies: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    severity: { type: "string", enum: ["critical", "warning", "info"] },
                    timestamp: { type: "string" },
                  },
                  required: ["title", "description", "severity"],
                },
              },
              marketSentiment: {
                type: "object",
                properties: {
                  score: { type: "number" },
                  label: { type: "string" },
                  analysis: { type: "string" },
                },
                required: ["score", "label", "analysis"],
              },
            },
            required: ["metrics", "revenue", "engagement", "predictions", "anomalies", "marketSentiment"],
          },
        },
      });
      tool_choice = { type: "function", function: { name: "generate_dashboard" } };
    } else if (type === "analyze-contact") {
      systemPrompt = `You are NEXUS AI's autonomous contact analysis engine. Analyze incoming messages and generate intelligent auto-responses and classifications.`;
      userPrompt = `Generate a sample contact form analysis showing the AI's ability to:
1. Classify message intent (inquiry, support, partnership, sales)
2. Extract key entities (company name, budget range, timeline)
3. Generate priority score (1-10)
4. Suggest automated response
Return via the provided tool.`;

      tools.push({
        type: "function",
        function: {
          name: "analyze_contact",
          description: "Analyze a contact submission and generate response",
          parameters: {
            type: "object",
            properties: {
              classification: { type: "string" },
              priority: { type: "number" },
              entities: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: { type: "string" },
                    value: { type: "string" },
                  },
                  required: ["type", "value"],
                },
              },
              suggestedResponse: { type: "string" },
              sentiment: { type: "string", enum: ["positive", "neutral", "negative"] },
            },
            required: ["classification", "priority", "entities", "suggestedResponse", "sentiment"],
          },
        },
      });
      tool_choice = { type: "function", function: { name: "analyze_contact" } };
    } else if (type === "recommend-services") {
      systemPrompt = `You are NEXUS AI's recommendation engine. Generate personalized AI service recommendations.`;
      userPrompt = `Generate 3 personalized AI service recommendations for a visitor browsing a premium AI platform. Each should feel tailored and intelligent. Use the provided tool.`;

      tools.push({
        type: "function",
        function: {
          name: "recommend_services",
          description: "Generate personalized service recommendations",
          parameters: {
            type: "object",
            properties: {
              recommendations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    reason: { type: "string" },
                    matchScore: { type: "number" },
                    estimatedROI: { type: "string" },
                  },
                  required: ["title", "reason", "matchScore", "estimatedROI"],
                },
              },
              profileSummary: { type: "string" },
            },
            required: ["recommendations", "profileSummary"],
          },
        },
      });
      tool_choice = { type: "function", function: { name: "recommend_services" } };
    } else {
      return new Response(
        JSON.stringify({ error: "Unknown analysis type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: any = {
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      tools,
      tool_choice,
    };

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      return new Response(
        JSON.stringify({ error: "No structured response from AI" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-analytics error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
