import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ═══════════════════════════════════════════════
//  HOSPITALITY CONCIERGE ORCHESTRATOR
//  Handles BMS calibration, nutritional preload,
//  and partnership-level room prep triggered by
//  aviation events (e.g., landing ETA minus 120m).
// ═══════════════════════════════════════════════

const PARTNERSHIP_PROTOCOLS: Record<string, {
  bms_api: string;
  supports_scent: boolean;
  supports_nutrition: boolean;
  tier: string;
}> = {
  "Aman": {
    bms_api: "aman-bms-gateway",
    supports_scent: true,
    supports_nutrition: true,
    tier: "ultra",
  },
  "Six Senses": {
    bms_api: "sixsenses-iot-bridge",
    supports_scent: true,
    supports_nutrition: true,
    tier: "ultra",
  },
  "One&Only": {
    bms_api: "oneandonly-room-control",
    supports_scent: false,
    supports_nutrition: true,
    tier: "premium",
  },
  "Corinthia": {
    bms_api: "corinthia-smart-room",
    supports_scent: false,
    supports_nutrition: false,
    tier: "premium",
  },
  "The Peninsula": {
    bms_api: "peninsula-digital-concierge",
    supports_scent: true,
    supports_nutrition: true,
    tier: "ultra",
  },
};

const SCENT_PROFILES: Record<string, { description: string; blend: string[] }> = {
  "Magnesium_Vapor": { description: "Calming magnesium-infused ambient diffusion", blend: ["magnesium chloride", "lavender", "eucalyptus"] },
  "Forest_Bath": { description: "Hinoki wood and cedar — Japanese forest bathing", blend: ["hinoki cypress", "cedar", "vetiver"] },
  "Citrus_Cognitive": { description: "Focus-enhancing citrus and rosemary", blend: ["bergamot", "rosemary", "lemon"] },
  "Neutral": { description: "Hypoallergenic neutral air", blend: [] },
};

const LUX_PROFILES: Record<string, { kelvin: number; intensity_pct: number; description: string }> = {
  "Amber_Warm": { kelvin: 2200, intensity_pct: 40, description: "Circadian-friendly amber for post-flight recovery" },
  "Cool_Focus": { kelvin: 4000, intensity_pct: 70, description: "Cool white for cognitive work sessions" },
  "Sunset_Dim": { kelvin: 1800, intensity_pct: 25, description: "Ultra-dim sunset tones for sleep prep" },
  "Daylight_Full": { kelvin: 5500, intensity_pct: 100, description: "Full-spectrum daylight simulation" },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  const sb = createClient(supabaseUrl, serviceKey);

  try {
    const body = await req.json().catch(() => ({}));
    const {
      action,
      module,
      partnerships,
      actions: configActions,
      client_id,
      user_id,
      concierge_id,
    } = body;

    // ACTION: configure — save/update concierge config
    if (action === "configure" || module) {
      const partnerList = partnerships || ["Aman", "Six Senses", "One&Only"];
      const bmsAction = (configActions || []).find((a: any) => a.task === "BMS_Calibration");
      const nutritionAction = (configActions || []).find((a: any) => a.task === "Nutritional_Preload");

      const bmsSettings = bmsAction?.settings || { temp: 18, lux: "Amber_Warm", scent: "Magnesium_Vapor" };
      const nutritionalPreload = nutritionAction ? {
        source: nutritionAction.source || "Biometric_Deficit_Report",
        instruction: nutritionAction.instruction || "",
      } : {};
      const triggerType = bmsAction?.trigger || "Aviation_Landing_Minus_120m";

      // Validate partnerships
      const validPartners = partnerList.filter((p: string) => PARTNERSHIP_PROTOCOLS[p]);
      const unknownPartners = partnerList.filter((p: string) => !PARTNERSHIP_PROTOCOLS[p]);

      // Build protocol summary
      const protocolSummary = validPartners.map((p: string) => {
        const proto = PARTNERSHIP_PROTOCOLS[p];
        return {
          partner: p,
          tier: proto.tier,
          bms_api: proto.bms_api,
          scent_supported: proto.supports_scent,
          nutrition_supported: proto.supports_nutrition,
          bms_config: {
            temperature_c: bmsSettings.temp,
            lighting: LUX_PROFILES[bmsSettings.lux] || LUX_PROFILES["Amber_Warm"],
            scent: proto.supports_scent ? (SCENT_PROFILES[bmsSettings.scent] || SCENT_PROFILES["Neutral"]) : null,
          },
          nutritional_preload: proto.supports_nutrition ? nutritionalPreload : null,
        };
      });

      // Save to database if user_id provided
      let savedId = concierge_id;
      if (user_id) {
        const payload = {
          user_id,
          client_id: client_id || null,
          partnerships: validPartners,
          bms_settings: bmsSettings,
          nutritional_preload: nutritionalPreload,
          trigger_type: triggerType,
          is_active: true,
          metadata: { unknown_partners: unknownPartners, configured_at: new Date().toISOString() },
        };

        if (concierge_id) {
          await sb.from("hospitality_concierge").update(payload).eq("id", concierge_id);
          savedId = concierge_id;
        } else {
          const { data: inserted } = await sb.from("hospitality_concierge").insert(payload).select("id").single();
          savedId = inserted?.id;
        }
      }

      // Log to agent_logs
      await sb.from("agent_logs").insert({
        agent_name: "quantus-hospitality-v1",
        task_type: "Configure",
        status: "Success",
        metadata: { partnerships: validPartners, trigger: triggerType, concierge_id: savedId },
      });

      return new Response(JSON.stringify({
        success: true,
        module: module || "quantus-hospitality-v1",
        concierge_id: savedId,
        partnerships: {
          active: validPartners,
          unknown: unknownPartners,
          protocols: protocolSummary,
        },
        trigger: triggerType,
        bms: {
          temperature_c: bmsSettings.temp,
          lighting: LUX_PROFILES[bmsSettings.lux] || LUX_PROFILES["Amber_Warm"],
          scent: SCENT_PROFILES[bmsSettings.scent] || SCENT_PROFILES["Neutral"],
        },
        nutritional_preload: nutritionalPreload,
        message: `Hospitality concierge configured for ${validPartners.length} partner(s). BMS will activate on ${triggerType}.`,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ACTION: trigger — execute BMS calibration + nutrition prep
    if (action === "trigger") {
      const targetConciergeId = concierge_id;
      const targetClientId = client_id;

      let config: any;

      if (targetConciergeId) {
        const { data } = await sb.from("hospitality_concierge").select("*").eq("id", targetConciergeId).single();
        config = data;
      } else if (targetClientId) {
        const { data } = await sb.from("hospitality_concierge").select("*").eq("client_id", targetClientId).eq("is_active", true).maybeSingle();
        config = data;
      }

      if (!config) {
        return new Response(JSON.stringify({ error: "No active concierge config found" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const results: any[] = [];

      for (const partner of config.partnerships) {
        const proto = PARTNERSHIP_PROTOCOLS[partner];
        if (!proto) continue;

        // Simulate BMS API call
        const bmsResult = {
          partner,
          api: proto.bms_api,
          commands_sent: [
            { system: "HVAC", command: `SET_TEMP ${config.bms_settings.temp}°C`, status: "acknowledged" },
            { system: "Lighting", command: `SET_PROFILE ${config.bms_settings.lux}`, status: "acknowledged" },
          ] as any[],
          timestamp: new Date().toISOString(),
        };

        if (proto.supports_scent && config.bms_settings.scent) {
          bmsResult.commands_sent.push({
            system: "Aromatherapy",
            command: `DIFFUSE ${config.bms_settings.scent}`,
            status: "acknowledged",
          });
        }

        if (proto.supports_nutrition && config.nutritional_preload?.instruction) {
          bmsResult.commands_sent.push({
            system: "F&B_Concierge",
            command: `PRELOAD: ${config.nutritional_preload.instruction}`,
            source: config.nutritional_preload.source,
            status: "dispatched",
          });
        }

        results.push(bmsResult);
      }

      // Generate AI briefing for the guest
      let guestBriefing = "";
      if (lovableKey) {
        try {
          const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: { Authorization: `Bearer ${lovableKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "google/gemini-3-flash-preview",
              messages: [
                {
                  role: "system",
                  content: "You are the Quantus V2+ Hospitality Concierge. Write a brief, elegant arrival notification for a Vanguard client. Under 60 words. British English. Mention the room preparation details subtly.",
                },
                {
                  role: "user",
                  content: `Guest arriving in 120 minutes. Room prepared at ${config.partnerships[0] || "partner hotel"}. Temperature: ${config.bms_settings.temp}°C. Lighting: ${config.bms_settings.lux}. Scent: ${config.bms_settings.scent || "neutral"}. Nutrition: ${config.nutritional_preload?.instruction || "standard minibar"}.`,
                },
              ],
              max_tokens: 150,
              temperature: 0.7,
            }),
          });

          if (aiRes.ok) {
            const aiData = await aiRes.json();
            guestBriefing = aiData?.choices?.[0]?.message?.content || "";
          }
        } catch (e) {
          console.error("[Hospitality] AI briefing failed:", e);
        }
      }

      await sb.from("agent_logs").insert({
        agent_name: "quantus-hospitality-v1",
        task_type: "Trigger",
        status: "Success",
        metadata: {
          concierge_id: config.id,
          partnerships: config.partnerships,
          commands_total: results.reduce((s, r) => s + r.commands_sent.length, 0),
        },
      });

      return new Response(JSON.stringify({
        success: true,
        trigger: config.trigger_type,
        concierge_id: config.id,
        bms_executions: results,
        guest_briefing: guestBriefing || "Your suite has been calibrated to your biometric profile. Welcome.",
        commands_total: results.reduce((s, r) => s + r.commands_sent.length, 0),
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ACTION: list — get all configs for a user
    if (action === "list") {
      const targetUserId = user_id;
      if (!targetUserId) throw new Error("user_id required");

      const { data: configs } = await sb.from("hospitality_concierge")
        .select("*")
        .eq("user_id", targetUserId)
        .order("created_at", { ascending: false });

      return new Response(JSON.stringify({
        success: true,
        configs: (configs || []).map((c: any) => ({
          ...c,
          partnership_details: (c.partnerships || []).map((p: string) => ({
            name: p,
            ...(PARTNERSHIP_PROTOCOLS[p] || { tier: "unknown" }),
          })),
        })),
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({
      error: "Unknown action. Use: configure, trigger, list",
      supported_partnerships: Object.keys(PARTNERSHIP_PROTOCOLS),
      supported_scents: Object.keys(SCENT_PROFILES),
      supported_lighting: Object.keys(LUX_PROFILES),
    }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    console.error("[Hospitality Concierge] Error:", error);

    await sb.from("agent_logs").insert({
      agent_name: "quantus-hospitality-v1",
      task_type: "Execute",
      status: "Failed",
      failure_reason: error instanceof Error ? error.message : "Unknown",
    }).catch(() => {});

    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
