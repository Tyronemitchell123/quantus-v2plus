import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, vendor_name, vendor_company, category, deal_context, response_text } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    if (action === "analyze_tone") {
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
              content: "You are a sentiment analysis expert for business communications. Analyze the vendor's response and return structured data.",
            },
            {
              role: "user",
              content: `Analyze this vendor response for sentiment and tone:\n\n"${response_text}"\n\nVendor: ${vendor_name} (${vendor_company || "Unknown company"})`,
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "analyze_sentiment",
                description: "Return sentiment analysis of a vendor response",
                parameters: {
                  type: "object",
                  properties: {
                    sentiment: { type: "string", enum: ["positive", "neutral", "cautious", "negative"] },
                    confidence: { type: "number", description: "Confidence score 0-100" },
                    key_signals: {
                      type: "array",
                      items: { type: "string" },
                      description: "Key phrases or signals that indicate the sentiment",
                    },
                    negotiation_readiness: { type: "string", enum: ["ready", "interested", "hesitant", "unlikely"] },
                    recommended_action: { type: "string", description: "Suggested next step based on the tone" },
                  },
                  required: ["sentiment", "confidence", "key_signals", "negotiation_readiness", "recommended_action"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "analyze_sentiment" } },
        }),
      });

      if (!response.ok) {
        if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded, try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (response.status === 402) return new Response(JSON.stringify({ error: "Usage limit reached." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        throw new Error("AI gateway error");
      }

      const data = await response.json();
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      const result = toolCall ? JSON.parse(toolCall.function.arguments) : null;

      return new Response(JSON.stringify({ analysis: result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "generate_draft") {
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
              content: "You are a luxury concierge communications specialist. Write professional, persuasive outreach messages for high-value deal negotiations. Keep messages concise (3-5 sentences) and formal.",
            },
            {
              role: "user",
              content: `Generate a personalized outreach message for:\n\nVendor: ${vendor_name}\nCompany: ${vendor_company || "N/A"}\nCategory: ${category}\nDeal Context: ${deal_context || "Standard procurement"}\n\nThe message should be tailored to this specific vendor and deal, not generic.`,
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "create_draft",
                description: "Return a personalized outreach draft message",
                parameters: {
                  type: "object",
                  properties: {
                    subject: { type: "string", description: "Email subject line" },
                    body: { type: "string", description: "The outreach message body" },
                    tone: { type: "string", enum: ["formal", "collaborative", "urgent", "consultative"] },
                    personalization_notes: { type: "string", description: "Why this draft is tailored to this vendor" },
                  },
                  required: ["subject", "body", "tone", "personalization_notes"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "create_draft" } },
        }),
      });

      if (!response.ok) {
        if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded, try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (response.status === 402) return new Response(JSON.stringify({ error: "Usage limit reached." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        throw new Error("AI gateway error");
      }

      const data = await response.json();
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      const result = toolCall ? JSON.parse(toolCall.function.arguments) : null;

      return new Response(JSON.stringify({ draft: result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("outreach-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});