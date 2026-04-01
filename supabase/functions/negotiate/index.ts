import { createClient } from "https://esm.sh/@supabase/supabase-js@2.96.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Prompt Injection Shield ──
// Strips any instruction-like patterns from scraped/user data
function sanitizeDataInput(text: string): string {
  if (!text) return "";
  // Remove common injection patterns
  const patterns = [
    /ignore\s+(all\s+)?previous\s+instructions?/gi,
    /you\s+are\s+now\s+(a|an)\s+/gi,
    /system\s*:\s*/gi,
    /\[INST\]/gi,
    /\[\/INST\]/gi,
    /<\|im_start\|>/gi,
    /<\|im_end\|>/gi,
    /```\s*(system|instruction)/gi,
    /override\s+(your|the)\s+(instructions?|prompt)/gi,
    /disregard\s+(your|the|all)\s+(instructions?|rules?)/gi,
    /new\s+instruction[s]?\s*:/gi,
    /act\s+as\s+(if\s+)?(you\s+)?(are|were)\s+/gi,
  ];
  let sanitized = text;
  for (const pattern of patterns) {
    sanitized = sanitized.replace(pattern, "[REDACTED]");
  }
  return sanitized;
}

// ── Data-Only Parser for Firecrawl outputs ──
function extractDataOnly(rawData: unknown, schema: Record<string, string>): Record<string, unknown> {
  if (!rawData || typeof rawData !== "object") return {};
  const result: Record<string, unknown> = {};
  const allowedKeys = Object.keys(schema);
  for (const key of allowedKeys) {
    if (key in (rawData as Record<string, unknown>)) {
      const val = (rawData as Record<string, unknown>)[key];
      // Only allow primitive values or arrays of primitives
      if (typeof val === "string" || typeof val === "number" || typeof val === "boolean") {
        result[key] = typeof val === "string" ? sanitizeDataInput(val) : val;
      } else if (Array.isArray(val)) {
        result[key] = val.map((v) =>
          typeof v === "string" ? sanitizeDataInput(v) : typeof v === "object" ? extractDataOnly(v, schema) : v
        );
      }
    }
  }
  return result;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  try {
    // ── Auth ──
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } = await userClient.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub as string;

    const body = await req.json();
    const { action, lead_id, sector, context_data, custom_prompt } = body;

    if (!action || !sector) {
      return new Response(JSON.stringify({ error: "action and sector required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const serviceClient = createClient(supabaseUrl, serviceRoleKey);

    // ── Security Audit Log ──
    await serviceClient.from("security_audit_log").insert({
      user_id: userId,
      action: `AI_Negotiate_${action}`,
      resource_type: "negotiate",
      resource_id: lead_id || null,
      agent_id: `negotiate-v1`,
      metadata: { sector, action },
    });

    // ── Sanitize any scraped/context data ──
    let safeContext = "";
    if (context_data) {
      if (typeof context_data === "string") {
        safeContext = sanitizeDataInput(context_data);
      } else if (typeof context_data === "object") {
        const cleaned = extractDataOnly(context_data, {
          origin: "string", destination: "string", aircraft: "string",
          price: "number", currency: "string", date: "string",
          procedure_type: "string", lost_revenue: "number",
          direct_price: "number", ota_price: "number",
          patient_uuid: "string",
        });
        safeContext = JSON.stringify(cleaned);
      }
    }

    // ── Sector-Specific Closer Scripts ──
    const SECTOR_PROMPTS: Record<string, string> = {
      Aviation: `You are a luxury aviation concierge. Tone: Urgent, Elite, Concierge. 
Generate a brief, personal re-engagement message for an empty-leg flight opportunity. 
RULES: Never reveal you are AI. Be concise (under 50 words). Address the client by title. 
Create urgency around the departure window. Mention the specific aircraft and route.`,

      Medical: `You are a patient care coordinator at a premium clinic. Tone: Supportive, Health-focused, Clinical.
Generate a brief, empathetic follow-up for a missed high-value procedure appointment.
RULES: Never reveal you are AI. Be concise (under 60 words). Focus on health outcomes, not cost. 
Address concerns about the procedure. NEVER mention the patient's real name - use "there" or generic greeting.`,

      Hospitality: `You are a hotel's direct booking advocate. Tone: Insider, Value-focused, Advocate.
Generate a brief message highlighting the benefits of booking direct vs OTA.
RULES: Never reveal you are AI. Be concise (under 50 words). Mention the specific perk/promo code. 
Create a sense of exclusivity.`,

      Staffing: `You are a recruitment specialist. Tone: Professional, Efficient, Opportunity-focused.
Generate a brief outreach for a time-sensitive staffing requirement.
RULES: Never reveal you are AI. Be concise (under 50 words). Highlight the opportunity value.`,
    };

    const systemPrompt = SECTOR_PROMPTS[sector] || SECTOR_PROMPTS["Staffing"];

    // ── Build the AI request ──
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userPrompt = custom_prompt
      ? sanitizeDataInput(custom_prompt)
      : `Generate a ${action} message for the following lead data:\n${safeContext}`;

    const aiResponse = await fetch("https://ai.lovable.dev/api/chat", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-5-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI API error:", errText);
      return new Response(JSON.stringify({ error: "AI generation failed" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResult = await aiResponse.json();
    const generatedMessage =
      aiResult.choices?.[0]?.message?.content || "Unable to generate message";

    // ── Log the generation ──
    await serviceClient.from("security_audit_log").insert({
      user_id: userId,
      action: "AI_Message_Generated",
      resource_type: "negotiate",
      resource_id: lead_id || null,
      agent_id: "negotiate-v1",
      metadata: { sector, action, message_length: generatedMessage.length },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: generatedMessage,
        sector,
        action,
        sanitization_applied: true,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Negotiate error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
