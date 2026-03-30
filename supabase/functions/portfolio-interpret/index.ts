import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { portfolio } = await req.json();
    if (!portfolio || !Array.isArray(portfolio)) {
      return new Response(JSON.stringify({ error: "Portfolio data required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const totalValue = portfolio.reduce((s: number, a: any) => s + (a.value || 0), 0);
    const portfolioSummary = portfolio.map((a: any) => 
      `${a.name}: £${(a.value || 0).toLocaleString("en-GB")} (${a.allocation}% allocation, ${a.change >= 0 ? "+" : ""}${a.change}% change)`
    ).join("\n");

    const systemPrompt = `You are the Quantus V2+ Sovereign Wealth Intelligence engine — an ultra-premium AI portfolio analyst serving UHNW clients.

Your tone is:
- Concise, authoritative, zero fluff
- Like a private banker's morning briefing at a Mayfair family office
- Use precise financial language but remain accessible
- Never use emojis or casual language

You must provide:
1. **Portfolio Narrative** (2-3 sentences) — A cinematic summary of the portfolio's current state
2. **Risk Assessment** — Current risk profile with specific concerns
3. **Opportunities** — 2-3 actionable opportunities based on allocation and performance
4. **Compounding Outlook** — How the portfolio compounds over time at current trajectory
5. **Sovereign Recommendation** — One decisive recommendation

Format using markdown headers (##). Keep total response under 400 words.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze this UHNW portfolio (Total: £${totalValue.toLocaleString("en-GB")}):\n\n${portfolioSummary}` },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI analysis unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("portfolio-interpret error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
