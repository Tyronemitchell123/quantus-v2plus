import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import {
  corsHeaders,
  handleCors,
  jsonResponse,
  errorResponse,
  COMMISSION_RATES,
  edgeLog,
} from "../_shared/supabase-admin.ts";

/**
 * Autonomous Orchestrator — runs on a cron schedule.
 * Scans all active deals and auto-advances them through the pipeline:
 * intake → sourcing → matching → negotiation → execution → completed
 */

const PHASE_ORDER = [
  "intake",
  "sourcing",
  "matching",
  "negotiation",
  "execution",
  "completed",
];

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    // Allow service role OR anon key (for cron)
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    if (token !== serviceRoleKey && token !== anonKey) {
      return errorResponse("Unauthorized", 401);
    }

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
    const db = createClient(supabaseUrl, serviceRoleKey);

    const actions: string[] = [];

    // ═══════════════════════════════════════════════════
    // 1. AUTO-ADVANCE DEALS THROUGH PIPELINE
    // ═══════════════════════════════════════════════════
    const { data: activeDeals } = await db
      .from("deals")
      .select("*")
      .not("status", "in", '("completed","cancelled")')
      .order("priority_score", { ascending: false })
      .limit(20);

    for (const deal of activeDeals || []) {
      const currentPhase = deal.status as string;
      const phaseIndex = PHASE_ORDER.indexOf(currentPhase);
      if (phaseIndex === -1 || phaseIndex >= PHASE_ORDER.length - 1) continue;

      try {
        // INTAKE → SOURCING
        if (currentPhase === "intake") {
          const { data: existingResults } = await db
            .from("sourcing_results")
            .select("id")
            .eq("deal_id", deal.id)
            .limit(1);

          if (!existingResults || existingResults.length === 0) {
            const resp = await fetch(`${supabaseUrl}/functions/v1/sourcing-engine`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${serviceRoleKey}`,
              },
              body: JSON.stringify({ deal_id: deal.id }),
            });
            if (resp.ok) {
              actions.push(`Sourced deal ${deal.deal_number}`);
              edgeLog("info", "orchestrator", "Sourced deal", { deal: deal.deal_number });
            } else {
              const errText = await resp.text();
              edgeLog("error", "orchestrator", "Sourcing failed", { deal: deal.deal_number, err: errText });
            }
          } else {
            await db.from("deals").update({ status: "sourcing" }).eq("id", deal.id);
            actions.push(`Advanced ${deal.deal_number} to sourcing`);
          }
        }

        // SOURCING → MATCHING
        if (currentPhase === "sourcing") {
          const { data: existingOutreach } = await db
            .from("vendor_outreach")
            .select("id")
            .eq("deal_id", deal.id)
            .limit(1);

          if (!existingOutreach || existingOutreach.length === 0) {
            const resp = await fetch(`${supabaseUrl}/functions/v1/vendor-outreach`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${serviceRoleKey}`,
              },
              body: JSON.stringify({ action: "generate", deal_id: deal.id }),
            });
            if (resp.ok) actions.push(`Outreach generated for ${deal.deal_number}`);
          } else {
            await db.from("deals").update({ status: "matching" }).eq("id", deal.id);
            actions.push(`Advanced ${deal.deal_number} to matching`);
          }
        }

        // MATCHING → NEGOTIATION
        if (currentPhase === "matching") {
          const { data: respondedVendors } = await db
            .from("vendor_outreach")
            .select("*")
            .eq("deal_id", deal.id)
            .eq("status", "responded");

          const dealAge = (Date.now() - new Date(deal.updated_at).getTime()) / 3600000;
          if ((respondedVendors && respondedVendors.length > 0) || dealAge > 48) {
            // Auto-prepare negotiation for top vendors
            const { data: topVendors } = await db
              .from("vendor_outreach")
              .select("id, negotiation_ready")
              .eq("deal_id", deal.id)
              .in("status", ["responded", "pending"])
              .order("vendor_score", { ascending: false })
              .limit(3);

            for (const v of topVendors || []) {
              if (!v.negotiation_ready) {
                await fetch(`${supabaseUrl}/functions/v1/vendor-outreach`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${serviceRoleKey}`,
                  },
                  body: JSON.stringify({ action: "prepare_negotiation", outreach_id: v.id }),
                });
              }
            }
            await db.from("deals").update({ status: "negotiation" }).eq("id", deal.id);
            actions.push(`Negotiation started for ${deal.deal_number}`);
          } else {
            // Auto follow-up on pending outreach
            const { data: pending } = await db
              .from("vendor_outreach")
              .select("id, next_follow_up_at, follow_up_count")
              .eq("deal_id", deal.id)
              .eq("status", "pending");

            for (const p of pending || []) {
              if (p.next_follow_up_at && new Date(p.next_follow_up_at) < new Date() && (p.follow_up_count || 0) < 3) {
                await fetch(`${supabaseUrl}/functions/v1/vendor-outreach`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${serviceRoleKey}`,
                  },
                  body: JSON.stringify({ action: "follow_up", outreach_id: p.id }),
                });
                actions.push(`Auto follow-up sent for ${deal.deal_number}`);
              }
            }
          }
        }

        // NEGOTIATION → EXECUTION
        if (currentPhase === "negotiation") {
          const dealAge = (Date.now() - new Date(deal.updated_at).getTime()) / 3600000;
          if (dealAge > 24) {
            await fetch(`${supabaseUrl}/functions/v1/workflow-engine`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${serviceRoleKey}`,
              },
              body: JSON.stringify({ action: "generate", deal_id: deal.id }),
            });
            await db.from("deals").update({ status: "execution" }).eq("id", deal.id);
            actions.push(`Execution started for ${deal.deal_number}`);
          }
        }

        // EXECUTION → COMPLETED (uses shared COMMISSION_RATES)
        if (currentPhase === "execution") {
          const dealAge = (Date.now() - new Date(deal.updated_at).getTime()) / 3600000;
          if (dealAge > 24) {
            const now = new Date().toISOString();
            await db.from("deals").update({
              status: "completed",
              completed_at: now,
            }).eq("id", deal.id);

            // Determine commission rate from shared constants
            let commRate = COMMISSION_RATES[deal.category] ?? COMMISSION_RATES.default;
            if (deal.custom_commission_rate != null) {
              commRate = deal.custom_commission_rate / 100;
            } else {
              const { data: voRate } = await db
                .from("vendor_outreach")
                .select("custom_commission_rate")
                .eq("deal_id", deal.id)
                .not("custom_commission_rate", "is", null)
                .limit(1);
              if (voRate?.[0]?.custom_commission_rate != null) {
                commRate = voRate[0].custom_commission_rate / 100;
              }
            }

            const { data: topVendor } = await db
              .from("vendor_outreach")
              .select("vendor_name")
              .eq("deal_id", deal.id)
              .order("vendor_score", { ascending: false })
              .limit(1);

            if (deal.deal_value_estimate && deal.deal_value_estimate > 0) {
              const dealValueCents = Math.min(Math.round(deal.deal_value_estimate * 100), 2000000000);
              const commCents = Math.round(deal.deal_value_estimate * commRate * 100);

              const { data: commLog } = await db.from("commission_logs").insert({
                deal_id: deal.id,
                user_id: deal.user_id,
                category: deal.category,
                deal_value_cents: dealValueCents,
                commission_rate: commRate,
                commission_cents: commCents,
                status: "pending",
                vendor_name: topVendor?.[0]?.vendor_name || null,
              }).select().single();

              if (commLog) {
                await db.from("invoices").insert({
                  deal_id: deal.id,
                  user_id: deal.user_id,
                  amount_cents: commCents,
                  currency: deal.budget_currency || "USD",
                  status: "draft",
                  invoice_type: "commission",
                  notes: `Auto-generated commission invoice for ${deal.deal_number}`,
                  metadata: {
                    commission_log_id: commLog.id,
                    commission_rate: commRate,
                    auto_generated: true,
                  },
                });
                edgeLog("info", "orchestrator", "Commission created", {
                  deal: deal.deal_number,
                  commCents,
                  rate: commRate,
                });
                actions.push(`Commission $${(commCents / 100).toLocaleString()} + invoice created for ${deal.deal_number}`);
              }
            }

            actions.push(`Completed ${deal.deal_number}`);
          }
        }
      } catch (err) {
        edgeLog("error", "orchestrator", `Deal processing failed`, { deal: deal.deal_number, err: String(err) });
      }
    }

    // ═══════════════════════════════════════════════════
    // 2. AUTO-PUBLISH MARKETING CONTENT
    // ═══════════════════════════════════════════════════
    const { data: draftPosts } = await db
      .from("marketing_posts")
      .select("id, title")
      .eq("status", "draft")
      .order("created_at", { ascending: true })
      .limit(3);

    for (const post of draftPosts || []) {
      await db.from("marketing_posts").update({
        status: "published",
        published_at: new Date().toISOString(),
      }).eq("id", post.id);
      actions.push(`Published: "${post.title}"`);
    }

    const { data: draftSocial } = await db
      .from("marketing_social")
      .select("id, platform")
      .eq("status", "draft")
      .order("created_at", { ascending: true })
      .limit(8);

    for (const social of draftSocial || []) {
      await db.from("marketing_social").update({
        status: "published",
        scheduled_at: new Date().toISOString(),
      }).eq("id", social.id);
      actions.push(`Published social: ${social.platform}`);
    }

    // ═══════════════════════════════════════════════════
    // 3. AUTO-RESPOND TO CLIENT COMMUNICATIONS
    // ═══════════════════════════════════════════════════
    const { data: unreadNotifications } = await db
      .from("contact_submissions")
      .select("*")
      .eq("auto_reply_sent", false)
      .order("created_at", { ascending: true })
      .limit(5);

    for (const submission of unreadNotifications || []) {
      const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
              content: "You are the Quantus V2+ Client Relations AI. Respond to client inquiries with luxury-grade professionalism. Be warm, specific, and action-oriented. Never mention AI or automation.",
            },
            {
              role: "user",
              content: `Client: ${submission.name} (${submission.email})\nCompany: ${submission.company || "N/A"}\nMessage: ${submission.message}\n\nGenerate a brief, professional response acknowledging their inquiry and outlining next steps.`,
            },
          ],
        }),
      });

      if (aiResp.ok) {
        const aiResult = await aiResp.json();
        const reply = aiResult.choices?.[0]?.message?.content || "";
        await db.from("contact_submissions").update({
          auto_reply_sent: true,
          suggested_response: reply,
        }).eq("id", submission.id);
        actions.push(`Auto-replied to ${submission.name}`);
      }
    }

    // ═══════════════════════════════════════════════════
    // 4. AUTO-TRIGGER CONTENT GENERATION (if low on drafts)
    // ═══════════════════════════════════════════════════
    const { count: draftCount } = await db
      .from("marketing_posts")
      .select("id", { count: "exact", head: true })
      .eq("status", "draft");

    if ((draftCount || 0) < 3) {
      await fetch(`${supabaseUrl}/functions/v1/scheduled-content`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({}),
      });
      actions.push("Triggered content generation (low draft pool)");
    }

    edgeLog("info", "orchestrator", "Run complete", { actionsCount: actions.length });

    return jsonResponse({
      success: true,
      actions_taken: actions.length,
      actions,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    edgeLog("error", "orchestrator", "Fatal error", { err: String(e) });
    return errorResponse((e as Error).message, 500);
  }
});
