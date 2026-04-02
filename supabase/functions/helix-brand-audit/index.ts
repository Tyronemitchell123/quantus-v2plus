import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { text, mode } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    if (mode === "tone") {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content: `You are the Quantus Helix Brand Enforcer. Audit text against these rules:
1. No exclamation marks
2. No emojis
3. No superlatives (amazing, incredible, best, awesome, revolutionary)
4. No sales language (buy now, limited time, hurry, don't miss)
5. No external brand names (Stripe, Supabase, AWS, Firecrawl, 10Web, Google, OpenAI)
6. Tone must be authoritative yet understated — never sells, only reveals
7. Register: executive boardroom, not marketing collateral
8. Third-person institutional voice preferred

Return a JSON object with a "findings" array. Each finding has "term" (category), "issue" (description), and "severity" ("violation" or "warning"). If text passes all checks, return {"findings":[]}.`,
            },
            { role: "user", content: text },
          ],
          tools: [{
            type: "function",
            function: {
              name: "brand_audit_result",
              description: "Return brand audit findings",
              parameters: {
                type: "object",
                properties: {
                  findings: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        term: { type: "string" },
                        issue: { type: "string" },
                        severity: { type: "string", enum: ["violation", "warning"] },
                      },
                      required: ["term", "issue", "severity"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["findings"],
                additionalProperties: false,
              },
            },
          }],
          tool_choice: { type: "function", function: { name: "brand_audit_result" } },
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "Credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        throw new Error(`AI gateway error: ${response.status}`);
      }

      const result = await response.json();
      const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall?.function?.arguments) {
        const parsed = JSON.parse(toolCall.function.arguments);
        return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      return new Response(JSON.stringify({ findings: [] }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (mode === "narrative") {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content: `You are the Quantus Helix Narrative Engine. Generate a 2-3 sentence brand-aligned narrative following these rules:
- Third-person institutional voice: "Quantus has identified..." not "We found..."
- No exclamation marks, emojis, or superlatives
- Authoritative, understated, calm certainty
- Reference Quantus Lexicon terms: Silent Wealth, Autonomous Systems, Forever Architecture, Sovereign Operations, Compounding Infrastructure
- Executive boardroom register
- Controlled confidence tone
Return ONLY the narrative text, nothing else.`,
            },
            { role: "user", content: `Generate a sovereign narrative for: ${text}` },
          ],
        }),
      });

      if (!response.ok) throw new Error(`AI gateway error: ${response.status}`);
      const result = await response.json();
      const narrative = result.choices?.[0]?.message?.content || "";
      return new Response(JSON.stringify({ narrative }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Invalid mode" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("helix-brand-audit error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
