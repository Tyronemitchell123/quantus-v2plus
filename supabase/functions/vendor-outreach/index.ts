import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { rateLimit } from "../_shared/rate-limit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const OUTREACH_TONES: Record<string, string> = {
  aviation: "formal, discreet, and authoritative — referencing technical specifics",
  medical: "compassionate, professional, and confidential — emphasizing patient care",
  staffing: "professional, warm, and evaluative — focusing on credentials and fit",
  lifestyle: "elegant, aspirational, and exclusive — evoking luxury and discretion",
  logistics: "efficient, precise, and operational — emphasizing reliability",
  partnerships: "strategic, collaborative, and visionary — highlighting mutual value",
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

    const body = await req.json();
    const { action } = body;

    // ACTION: generate — Create outreach for all sourcing results of a deal
    if (action === "generate") {
      const { deal_id } = body;
      if (!deal_id) {
        return new Response(JSON.stringify({ error: "deal_id required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Fetch deal and sourcing results
      const { data: deal } = await supabase.from("deals").select("*").eq("id", deal_id).single();
      if (!deal) {
        return new Response(JSON.stringify({ error: "Deal not found" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: results } = await supabase
        .from("sourcing_results")
        .select("*")
        .eq("deal_id", deal_id)
        .order("overall_score", { ascending: false });

      if (!results || results.length === 0) {
        return new Response(JSON.stringify({ error: "No sourcing results found. Run sourcing first." }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const category = deal.category as string;
      const tone = OUTREACH_TONES[category] || OUTREACH_TONES.lifestyle;

      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

      // Generate outreach messages for all results
      const vendorSummaries = results.map((r: any, i: number) => 
        `${i + 1}. ${r.name} (${r.tier} tier, score: ${r.overall_score}) — ${r.vendor_contact?.company || "Unknown"}, Contact: ${r.vendor_contact?.contact_name || "N/A"}, ${r.description?.slice(0, 100)}`
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
              content: `You are the Vendor Outreach Engine for Quantus V2+, an ultra-luxury UHNW orchestration platform. Generate personalized outreach messages for each vendor/option.

Category: ${category}
Required tone: ${tone}

For each vendor, create:
1. An initial outreach message (first contact)
2. An outreach strategy object with negotiation_angle, key_questions, expected_response_time, and documents_to_request
3. A follow-up message template (for use if no response within expected window)

Messages must be:
- Polished, discreet, and professional
- Luxury-grade language without being ostentatious
- Specific to the vendor and what they offer
- Include reference to client requirements without revealing client identity
- Never mention "AI" or "automated" — present as a private advisory office`,
            },
            {
              role: "user",
              content: `Deal: ${deal.intent || deal.sub_category} (${category})
Budget: ${deal.budget_min || "flexible"} - ${deal.budget_max || "flexible"} ${deal.budget_currency || "USD"}
Timeline: ${deal.timeline_days ? deal.timeline_days + " days" : "flexible"}
Location: ${deal.location || "any"}
Requirements: ${JSON.stringify(deal.requirements)}

Vendors to contact:
${vendorSummaries}`,
            },
          ],
          tools: [{
            type: "function",
            function: {
              name: "generate_outreach",
              description: "Generate vendor outreach messages and strategies",
              parameters: {
                type: "object",
                properties: {
                  outreach_items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        vendor_index: { type: "integer", description: "1-based index matching the vendor list" },
                        initial_message_subject: { type: "string" },
                        initial_message_body: { type: "string", description: "Full outreach message, 3-5 paragraphs, luxury tone" },
                        follow_up_message: { type: "string", description: "Follow-up message if no response, elegant and firm" },
                        strategy: {
                          type: "object",
                          properties: {
                            tone: { type: "string", enum: ["formal", "discreet", "urgent", "exploratory"] },
                            negotiation_angle: { type: "string" },
                            key_questions: { type: "array", items: { type: "string" } },
                            expected_response_hours: { type: "integer" },
                            documents_to_request: { type: "array", items: { type: "string" } },
                            risk_notes: { type: "string" },
                          },
                        },
                      },
                      required: ["vendor_index", "initial_message_subject", "initial_message_body", "follow_up_message", "strategy"],
                    },
                  },
                },
                required: ["outreach_items"],
              },
            },
          }],
          tool_choice: { type: "function", function: { name: "generate_outreach" } },
        }),
      });

      if (!aiResponse.ok) {
        if (aiResponse.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const t = await aiResponse.text();
        console.error("AI error:", aiResponse.status, t);
        throw new Error("AI outreach generation failed");
      }

      const aiResult = await aiResponse.json();
      const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall) throw new Error("No structured response from AI");

      const generated = JSON.parse(toolCall.function.arguments);

      // Create outreach records and messages
      const outreachRecords = [];
      for (const item of generated.outreach_items) {
        const resultIndex = (item.vendor_index || 1) - 1;
        const sourcingResult = results[resultIndex];
        if (!sourcingResult) continue;

        const vc = sourcingResult.vendor_contact as Record<string, any> || {};

        // Insert outreach record
        const { data: outreach, error: outErr } = await supabase
          .from("vendor_outreach")
          .insert({
            deal_id,
            sourcing_result_id: sourcingResult.id,
            user_id: user.id,
            vendor_name: vc.contact_name || sourcingResult.name,
            vendor_company: vc.company || null,
            vendor_email: vc.email || null,
            vendor_phone: vc.phone || null,
            category,
            status: "pending",
            outreach_strategy: item.strategy || {},
            documents_requested: item.strategy?.documents_to_request || [],
            next_follow_up_at: new Date(Date.now() + (item.strategy?.expected_response_hours || 48) * 3600000).toISOString(),
          })
          .select()
          .single();

        if (outErr || !outreach) {
          console.error("Outreach insert error:", outErr);
          continue;
        }

        // Insert initial message
        await supabase.from("vendor_messages").insert({
          outreach_id: outreach.id,
          user_id: user.id,
          direction: "outbound",
          channel: "email",
          subject: item.initial_message_subject,
          body: item.initial_message_body,
          tone: item.strategy?.tone || "formal",
          ai_generated: true,
        });

        // Store follow-up as metadata
        await supabase.from("vendor_messages").insert({
          outreach_id: outreach.id,
          user_id: user.id,
          direction: "outbound",
          channel: "email",
          subject: `Follow-up: ${item.initial_message_subject}`,
          body: item.follow_up_message,
          tone: "firm",
          ai_generated: true,
          metadata: { type: "follow_up_template", auto_send: false },
        });

        outreachRecords.push({ ...outreach, messages: [item.initial_message_body] });
      }

      // Update deal status
      await supabaseAdmin
        .from("deals")
        .update({ status: "matching" })
        .eq("id", deal_id);

      return new Response(JSON.stringify({
        outreach: outreachRecords,
        total: outreachRecords.length,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACTION: send_email — Send the initial outreach email to the vendor
    if (action === "send_email") {
      const { outreach_id } = body;
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

      if (!outreach.vendor_email) {
        return new Response(JSON.stringify({ error: "No vendor email on record" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Fetch the initial outbound message
      const { data: msgs } = await supabase
        .from("vendor_messages")
        .select("*")
        .eq("outreach_id", outreach_id)
        .eq("direction", "outbound")
        .is("metadata->type", null)
        .order("created_at", { ascending: true })
        .limit(1);

      const initialMsg = msgs?.[0];
      if (!initialMsg) {
        return new Response(JSON.stringify({ error: "No outreach message found to send" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Build HTML email body
      const emailHtml = buildVendorEmailHtml({
        subject: initialMsg.subject || "Partnership Inquiry — QUANTUS",
        body: initialMsg.body,
        vendorName: outreach.vendor_name,
        company: outreach.vendor_company,
      });

      const messageId = crypto.randomUUID();
      const idempotencyKey = `vendor-outreach-${outreach_id}`;

      // Enqueue via PGMQ for reliable delivery
      const { error: enqueueError } = await supabaseAdmin.rpc("enqueue_email", {
        queue_name: "transactional_emails",
        payload: {
          message_id: messageId,
          to: outreach.vendor_email,
          from: "QUANTUS <noreply@notify.crownprompts.com>",
          sender_domain: "notify.crownprompts.com",
          subject: initialMsg.subject || "Partnership Inquiry — QUANTUS",
          html: emailHtml,
          text: initialMsg.body,
          purpose: "transactional",
          label: "vendor-outreach",
          idempotency_key: idempotencyKey,
          queued_at: new Date().toISOString(),
        },
      });

      if (enqueueError) {
        console.error("Failed to enqueue vendor email:", enqueueError);
        return new Response(JSON.stringify({ error: "Failed to queue email for delivery" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Log pending
      await supabaseAdmin.from("email_send_log").insert({
        message_id: messageId,
        template_name: "vendor-outreach",
        recipient_email: outreach.vendor_email,
        status: "pending",
      });

      // Update outreach status
      await supabase
        .from("vendor_outreach")
        .update({ status: "sent" })
        .eq("id", outreach_id);

      console.log("Vendor outreach email enqueued", {
        outreach_id,
        vendor: outreach.vendor_name,
        email: outreach.vendor_email,
      });

      return new Response(JSON.stringify({
        success: true,
        email_sent_to: outreach.vendor_email,
        vendor: outreach.vendor_name,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACTION: follow_up — Generate a follow-up message and send email
    if (action === "follow_up") {
      const { outreach_id } = body;
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

      const followUpCount = (outreach.follow_up_count || 0) + 1;
      const tones = ["gentle", "firm", "escalation"];
      const tone = tones[Math.min(followUpCount - 1, 2)];

      // Find the follow-up template message
      const messages = (outreach.vendor_messages as any[]) || [];
      const followUpTemplate = messages.find(
        (m: any) => m.direction === "outbound" && m.metadata?.type === "follow_up_template"
      );

      // Send follow-up email if vendor has email
      let emailSent = false;
      if (outreach.vendor_email && followUpTemplate) {
        const emailHtml = buildVendorEmailHtml({
          subject: followUpTemplate.subject || `Follow-up #${followUpCount} — QUANTUS`,
          body: followUpTemplate.body,
          vendorName: outreach.vendor_name,
          company: outreach.vendor_company,
        });

        const messageId = crypto.randomUUID();
        const idempotencyKey = `vendor-followup-${outreach_id}-${followUpCount}`;

        const { error: enqueueError } = await supabaseAdmin.rpc("enqueue_email", {
          queue_name: "transactional_emails",
          payload: {
            message_id: messageId,
            to: outreach.vendor_email,
            from: "QUANTUS <noreply@notify.crownprompts.com>",
            sender_domain: "notify.crownprompts.com",
            subject: followUpTemplate.subject || `Follow-up #${followUpCount} — QUANTUS`,
            html: emailHtml,
            text: followUpTemplate.body,
            purpose: "transactional",
            label: "vendor-follow-up",
            idempotency_key: idempotencyKey,
            queued_at: new Date().toISOString(),
          },
        });

        if (!enqueueError) {
          await supabaseAdmin.from("email_send_log").insert({
            message_id: messageId,
            template_name: "vendor-follow-up",
            recipient_email: outreach.vendor_email,
            status: "pending",
          });
          emailSent = true;
          console.log("Follow-up email enqueued", {
            outreach_id,
            follow_up_count: followUpCount,
            email: outreach.vendor_email,
          });
        } else {
          console.error("Failed to enqueue follow-up email:", enqueueError);
        }
      }

      // Update outreach
      await supabase
        .from("vendor_outreach")
        .update({
          follow_up_count: followUpCount,
          next_follow_up_at: new Date(Date.now() + 24 * 3600000).toISOString(),
        })
        .eq("id", outreach_id);

      return new Response(JSON.stringify({
        success: true,
        follow_up_count: followUpCount,
        tone,
        email_sent: emailSent,
        email_sent_to: emailSent ? outreach.vendor_email : null,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACTION: log_response — Log a vendor response
    if (action === "log_response") {
      const { outreach_id, response_text, pricing, availability, attachments } = body;
      if (!outreach_id || !response_text) {
        return new Response(JSON.stringify({ error: "outreach_id and response_text required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Insert inbound message
      await supabase.from("vendor_messages").insert({
        outreach_id,
        user_id: user.id,
        direction: "inbound",
        channel: "email",
        body: response_text,
        ai_generated: false,
        metadata: { pricing, availability, attachments: attachments || [] },
      });

      // Fetch outreach to calculate response time
      const { data: outreach } = await supabase
        .from("vendor_outreach")
        .select("created_at")
        .eq("id", outreach_id)
        .single();

      const responseTimeHours = outreach
        ? (Date.now() - new Date(outreach.created_at).getTime()) / 3600000
        : null;

      // Calculate vendor score based on response
      let vendorScore = 50;
      if (responseTimeHours && responseTimeHours < 4) vendorScore += 20;
      else if (responseTimeHours && responseTimeHours < 24) vendorScore += 10;
      if (pricing) vendorScore += 10;
      if (availability) vendorScore += 10;

      await supabase
        .from("vendor_outreach")
        .update({
          status: "responded",
          response_time_hours: responseTimeHours ? Math.round(responseTimeHours * 10) / 10 : null,
          vendor_score: vendorScore,
        })
        .eq("id", outreach_id);

      return new Response(JSON.stringify({ success: true, vendor_score: vendorScore }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACTION: prepare_negotiation — Generate negotiation prep from responses
    if (action === "prepare_negotiation") {
      const { outreach_id } = body;
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

      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

      const messages = (outreach.vendor_messages as any[]) || [];
      const conversation = messages.map((m: any) =>
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
              content: `You are a UHNW deal negotiation strategist. Analyze the vendor conversation and prepare a negotiation brief. Be specific, data-driven, and strategic.`,
            },
            {
              role: "user",
              content: `Vendor: ${outreach.vendor_name} (${outreach.vendor_company || "N/A"})
Category: ${outreach.category}
Strategy: ${JSON.stringify(outreach.outreach_strategy)}

Conversation:
${conversation}

Prepare a negotiation brief.`,
            },
          ],
          tools: [{
            type: "function",
            function: {
              name: "negotiation_brief",
              description: "Generate a structured negotiation brief",
              parameters: {
                type: "object",
                properties: {
                  leverage_points: { type: "array", items: { type: "string" } },
                  risk_factors: { type: "array", items: { type: "string" } },
                  suggested_counter_offer: { type: "string" },
                  market_comparison: { type: "string" },
                  recommended_approach: { type: "string" },
                  max_recommended_price: { type: "string" },
                  walk_away_triggers: { type: "array", items: { type: "string" } },
                  next_message_draft: { type: "string" },
                },
                required: ["leverage_points", "risk_factors", "suggested_counter_offer", "recommended_approach", "next_message_draft"],
              },
            },
          }],
          tool_choice: { type: "function", function: { name: "negotiation_brief" } },
        }),
      });

      if (!aiResponse.ok) throw new Error("AI negotiation prep failed");

      const aiResult = await aiResponse.json();
      const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall) throw new Error("No structured response from AI");

      const negotiationPrep = JSON.parse(toolCall.function.arguments);

      await supabase
        .from("vendor_outreach")
        .update({
          negotiation_ready: true,
          negotiation_prep: negotiationPrep,
          status: "negotiation_ready",
        })
        .eq("id", outreach_id);

      return new Response(JSON.stringify({ negotiation_prep: negotiationPrep }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action. Use: generate, follow_up, log_response, prepare_negotiation" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("vendor-outreach error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Something went wrong" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
