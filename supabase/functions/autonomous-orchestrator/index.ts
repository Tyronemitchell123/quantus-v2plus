import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Autonomous Orchestrator — runs on a cron schedule.
 * Scans all active deals and auto-advances them through the 8-phase pipeline:
 * intake → sourcing → matching → shortlisted → negotiation → execution → documentation → completed
 *
 * Also auto-publishes draft content and auto-responds to client communications.
 */

const PHASE_ORDER = [
  "intake",
  "sourcing",
  "matching",
  "shortlisted",
  "negotiation",
  "execution",
  "documentation",
  "completed",
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    // Allow service role OR anon key (for cron)
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    if (token !== serviceRoleKey && token !== anonKey) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
        // INTAKE → SOURCING: Auto-trigger sourcing engine
        if (currentPhase === "intake") {
          const { data: existingResults } = await db
            .from("sourcing_results")
            .select("id")
            .eq("deal_id", deal.id)
            .limit(1);

          if (!existingResults || existingResults.length === 0) {
            // Call sourcing engine internally
            const resp = await fetch(`${supabaseUrl}/functions/v1/sourcing-engine`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${serviceRoleKey}`,
              },
              body: JSON.stringify({ deal_id: deal.id }),
            });
            if (resp.ok) actions.push(`Sourced deal ${deal.deal_number}`);
            else console.error(`Sourcing failed for ${deal.deal_number}:`, await resp.text());
          } else {
            // Already sourced, advance
            await db.from("deals").update({ status: "sourcing" }).eq("id", deal.id);
            actions.push(`Advanced ${deal.deal_number} to sourcing`);
          }
        }

        // SOURCING → MATCHING: Auto-trigger vendor outreach
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

        // MATCHING → SHORTLISTED: Auto-select top vendors
        if (currentPhase === "matching") {
          const { data: respondedVendors } = await db
            .from("vendor_outreach")
            .select("*")
            .eq("deal_id", deal.id)
            .eq("status", "responded");

          // If vendors responded or 48h passed, auto-advance
          const dealAge = (Date.now() - new Date(deal.updated_at).getTime()) / 3600000;
          if ((respondedVendors && respondedVendors.length > 0) || dealAge > 48) {
            await db.from("deals").update({ status: "shortlisted" }).eq("id", deal.id);
            actions.push(`Shortlisted vendors for ${deal.deal_number}`);
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

        // SHORTLISTED → NEGOTIATION: Auto-prepare negotiation
        if (currentPhase === "shortlisted") {
          const { data: topVendors } = await db
            .from("vendor_outreach")
            .select("id, negotiation_ready")
            .eq("deal_id", deal.id)
            .in("status", ["responded", "negotiation_ready"])
            .order("vendor_score", { ascending: false })
            .limit(3);

          // Auto-prepare negotiation for top vendors
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
        }

        // NEGOTIATION → EXECUTION: Auto-advance after negotiation prep
        if (currentPhase === "negotiation") {
          const dealAge = (Date.now() - new Date(deal.updated_at).getTime()) / 3600000;
          if (dealAge > 24) {
            // Generate workflow
            await fetch(`${supabaseUrl}/functions/v1/workflow-engine`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${serviceRoleKey}`,
              },
              body: JSON.stringify({ action: "generate", deal_id: deal.id }),
            });
            actions.push(`Execution workflow generated for ${deal.deal_number}`);
          }
        }

        // EXECUTION → DOCUMENTATION: Auto-advance when workflow tasks mostly complete
        if (currentPhase === "execution") {
          const { data: tasks } = await db
            .from("workflow_tasks")
            .select("status")
            .eq("deal_id", deal.id);

          if (tasks && tasks.length > 0) {
            const completed = tasks.filter((t: any) => t.status === "completed").length;
            if (completed / tasks.length >= 0.8) {
              await db.from("deals").update({ status: "documentation" }).eq("id", deal.id);
              actions.push(`Documentation phase for ${deal.deal_number}`);
            }
          }
        }

        // DOCUMENTATION → COMPLETED: Auto-complete
        if (currentPhase === "documentation") {
          const dealAge = (Date.now() - new Date(deal.updated_at).getTime()) / 3600000;
          if (dealAge > 12) {
            await db.from("deals").update({
              status: "completed",
              completed_at: new Date().toISOString(),
            }).eq("id", deal.id);

            // Trigger completion email
            await fetch(`${supabaseUrl}/functions/v1/deal-completion`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${serviceRoleKey}`,
              },
              body: JSON.stringify({ deal_id: deal.id }),
            });
            actions.push(`Completed ${deal.deal_number}`);
          }
        }
      } catch (err) {
        console.error(`Error processing deal ${deal.deal_number}:`, err);
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
      // AI generates a personalized response
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

    console.log(`Orchestrator completed: ${actions.length} actions`, actions);

    return new Response(JSON.stringify({
      success: true,
      actions_taken: actions.length,
      actions,
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Autonomous orchestrator error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
