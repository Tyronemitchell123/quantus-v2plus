import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { rateLimit } from "../_shared/rate-limit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const WORKFLOW_TEMPLATES: Record<string, { phases: string[]; description: string }> = {
  aviation: { phases: ["inspection", "documentation", "escrow", "travel", "delivery"], description: "Aircraft acquisition workflow" },
  medical: { phases: ["screening", "travel", "appointment", "treatment", "recovery"], description: "Medical travel workflow" },
  staffing: { phases: ["interview", "background_check", "trial", "contract", "onboarding"], description: "Staffing placement workflow" },
  lifestyle: { phases: ["booking", "travel", "transfers", "experience", "follow_up"], description: "Luxury lifestyle workflow" },
  logistics: { phases: ["dispatch", "routing", "compliance", "tracking", "delivery"], description: "Logistics operations workflow" },
  partnerships: { phases: ["agreement", "onboarding", "integration", "launch", "review"], description: "Partnership activation workflow" },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

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
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // ACTION: generate — Create workflow blueprint for a deal
    if (action === "generate") {
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

      // Get vendor outreach and sourcing results for context
      const { data: outreachList } = await supabase
        .from("vendor_outreach")
        .select("*")
        .eq("deal_id", deal_id)
        .in("status", ["negotiation_ready", "responded"]);

      const { data: sourcingResults } = await supabase
        .from("sourcing_results")
        .select("*")
        .eq("deal_id", deal_id)
        .order("overall_score", { ascending: false })
        .limit(5);

      const category = deal.category as string;
      const template = WORKFLOW_TEMPLATES[category] || WORKFLOW_TEMPLATES.lifestyle;

      const vendorContext = (outreachList || []).map((o: any) =>
        `${o.vendor_name} (${o.vendor_company || "N/A"}) — Status: ${o.status}, Score: ${o.vendor_score}`
      ).join("\n");

      const sourcingContext = (sourcingResults || []).map((r: any) =>
        `${r.name}: Score ${r.overall_score}, Cost ${r.estimated_cost} ${r.cost_currency}, Location: ${r.location}`
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
              content: `You are the Workflow Orchestration Engine for Quantus A.I — an ultra-luxury UHNW platform. Generate a comprehensive workflow blueprint with specific, actionable tasks organized into phases.

Category: ${category}
Workflow template phases: ${template.phases.join(", ")}

Each task must be specific, time-bounded, and actionable. Include:
- Scheduling tasks (appointments, inspections, travel)
- Document tasks (NDAs, contracts, forms)
- Communication tasks (confirmations, updates, reminders)
- Coordination tasks (vendor alignment, logistics)
- Risk monitoring tasks (weather, compliance, delays)

Tasks should feel like a private office team of 12 people working in concert. Use luxury-grade language for all client-facing communications.`,
            },
            {
              role: "user",
              content: `Deal: ${deal.intent || deal.sub_category} (${category})
Deal Number: ${deal.deal_number}
Budget: ${deal.budget_min || "flex"} - ${deal.budget_max || "flex"} ${deal.budget_currency || "USD"}
Timeline: ${deal.timeline_days ? deal.timeline_days + " days" : "flexible"}
Location: ${deal.location || "TBD"}
Requirements: ${JSON.stringify(deal.requirements)}
Constraints: ${JSON.stringify(deal.constraints)}
Preferences: ${JSON.stringify(deal.preferences)}

Engaged Vendors:
${vendorContext || "None yet"}

Top Sourcing Results:
${sourcingContext || "None yet"}

Generate a complete workflow blueprint.`,
            },
          ],
          tools: [{
            type: "function",
            function: {
              name: "workflow_blueprint",
              description: "Generate a structured workflow blueprint",
              parameters: {
                type: "object",
                properties: {
                  workflow_name: { type: "string" },
                  estimated_duration_days: { type: "integer" },
                  tasks: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        phase: { type: "string", description: "Workflow phase this task belongs to" },
                        task_type: { type: "string", enum: ["scheduling", "document", "communication", "coordination", "risk_monitoring", "verification", "payment"] },
                        title: { type: "string" },
                        description: { type: "string" },
                        priority: { type: "integer", description: "1-100" },
                        assigned_to: { type: "string", description: "Who handles this (vendor name, client, system, etc.)" },
                        due_days_offset: { type: "integer", description: "Days from workflow start" },
                        dependencies: { type: "array", items: { type: "integer" }, description: "Indices of tasks this depends on (0-based)" },
                        risk_level: { type: "string", enum: ["low", "medium", "high"] },
                        risk_notes: { type: "string" },
                        client_message: { type: "string", description: "Luxury-grade message to send to client when this task completes" },
                        vendor_message: { type: "string", description: "Message to send to vendor for this task" },
                      },
                      required: ["phase", "task_type", "title", "description", "priority", "due_days_offset"],
                    },
                  },
                  risk_assessment: {
                    type: "object",
                    properties: {
                      overall_risk: { type: "string", enum: ["low", "medium", "high"] },
                      key_risks: { type: "array", items: { type: "string" } },
                      mitigation_strategies: { type: "array", items: { type: "string" } },
                      contingency_plans: { type: "array", items: { type: "string" } },
                    },
                  },
                  client_summary: { type: "string", description: "Luxury-grade summary message for the client about the workflow" },
                },
                required: ["workflow_name", "estimated_duration_days", "tasks", "client_summary"],
              },
            },
          }],
          tool_choice: { type: "function", function: { name: "workflow_blueprint" } },
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
        throw new Error("AI workflow generation failed");
      }

      const aiResult = await aiResponse.json();
      const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall) throw new Error("No structured response from AI");

      const blueprint = JSON.parse(toolCall.function.arguments);

      // Insert workflow tasks
      const now = new Date();
      const insertedTasks = [];
      for (const task of blueprint.tasks) {
        const dueAt = new Date(now.getTime() + (task.due_days_offset || 0) * 86400000);
        const { data: inserted, error: insertErr } = await supabase
          .from("workflow_tasks")
          .insert({
            deal_id,
            user_id: user.id,
            phase: task.phase,
            task_type: task.task_type,
            title: task.title,
            description: task.description,
            priority: task.priority || 50,
            assigned_to: task.assigned_to || "system",
            due_at: dueAt.toISOString(),
            dependencies: task.dependencies || [],
            risk_level: task.risk_level || "low",
            risk_notes: task.risk_notes || null,
            metadata: {
              client_message: task.client_message,
              vendor_message: task.vendor_message,
            },
          })
          .select()
          .single();

        if (inserted) insertedTasks.push(inserted);
      }

      // Update deal status
      await supabaseAdmin.from("deals").update({ status: "execution" }).eq("id", deal_id);

      return new Response(JSON.stringify({
        workflow_name: blueprint.workflow_name,
        estimated_duration_days: blueprint.estimated_duration_days,
        tasks_created: insertedTasks.length,
        risk_assessment: blueprint.risk_assessment,
        client_summary: blueprint.client_summary,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACTION: update_task — Update a workflow task status
    if (action === "update_task") {
      const { task_id, status, notes } = body;
      if (!task_id || !status) {
        return new Response(JSON.stringify({ error: "task_id and status required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const updateData: any = { status };
      if (status === "completed") updateData.completed_at = new Date().toISOString();
      if (notes) updateData.metadata = { notes };

      await supabase.from("workflow_tasks").update(updateData).eq("id", task_id);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACTION: send_communication — Send a workflow communication
    if (action === "send_communication") {
      const { task_id, deal_id, recipient, message_type } = body;

      const { data: task } = await supabase.from("workflow_tasks").select("*").eq("id", task_id).single();
      if (!task) {
        return new Response(JSON.stringify({ error: "Task not found" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const meta = task.metadata as Record<string, any> || {};
      const messageBody = message_type === "client" ? meta.client_message : meta.vendor_message;

      if (!messageBody) {
        return new Response(JSON.stringify({ error: "No message template found for this task" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      await supabase.from("workflow_communications").insert({
        workflow_task_id: task_id,
        deal_id: deal_id || task.deal_id,
        user_id: user.id,
        direction: "outbound",
        recipient: recipient || task.assigned_to || "client",
        channel: "email",
        subject: task.title,
        body: messageBody,
        tone: "luxury",
        ai_generated: true,
        sent_at: new Date().toISOString(),
      });

      return new Response(JSON.stringify({ success: true, message: "Communication sent" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACTION: risk_check — Run a risk assessment on the current workflow
    if (action === "risk_check") {
      const { deal_id } = body;
      if (!deal_id) {
        return new Response(JSON.stringify({ error: "deal_id required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: tasks } = await supabase
        .from("workflow_tasks")
        .select("*")
        .eq("deal_id", deal_id)
        .order("due_at", { ascending: true });

      if (!tasks || tasks.length === 0) {
        return new Response(JSON.stringify({ error: "No workflow tasks found" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: deal } = await supabase.from("deals").select("*").eq("id", deal_id).single();

      const taskSummary = tasks.map((t: any) =>
        `[${t.status}] ${t.title} — Due: ${t.due_at}, Risk: ${t.risk_level}, Assigned: ${t.assigned_to}`
      ).join("\n");

      const overdue = tasks.filter((t: any) => t.status !== "completed" && new Date(t.due_at) < new Date());
      const highRisk = tasks.filter((t: any) => t.risk_level === "high" && t.status !== "completed");

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
              content: "You are a risk management engine for UHNW deals. Analyze workflow status and identify risks, delays, and suggest mitigations.",
            },
            {
              role: "user",
              content: `Deal: ${deal?.intent || "Unknown"} (${deal?.category})
Location: ${deal?.location || "TBD"}
Overdue tasks: ${overdue.length}
High-risk tasks: ${highRisk.length}

All tasks:
${taskSummary}

Provide a risk assessment.`,
            },
          ],
          tools: [{
            type: "function",
            function: {
              name: "risk_assessment",
              description: "Workflow risk assessment",
              parameters: {
                type: "object",
                properties: {
                  overall_status: { type: "string", enum: ["on_track", "at_risk", "delayed", "critical"] },
                  completion_percentage: { type: "integer" },
                  bottlenecks: { type: "array", items: { type: "string" } },
                  overdue_actions: { type: "array", items: { type: "string" } },
                  risk_alerts: { type: "array", items: {
                    type: "object",
                    properties: {
                      severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
                      description: { type: "string" },
                      mitigation: { type: "string" },
                    },
                  }},
                  recommended_actions: { type: "array", items: { type: "string" } },
                  eta_adjustment_days: { type: "integer" },
                },
                required: ["overall_status", "completion_percentage", "recommended_actions"],
              },
            },
          }],
          tool_choice: { type: "function", function: { name: "risk_assessment" } },
        }),
      });

      if (!aiResponse.ok) throw new Error("Risk assessment failed");

      const aiResult = await aiResponse.json();
      const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall) throw new Error("No risk assessment result");

      const riskResult = JSON.parse(toolCall.function.arguments);

      return new Response(JSON.stringify(riskResult), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACTION: finalize — Mark workflow complete, hand off to Phase 6
    if (action === "finalize") {
      const { deal_id } = body;
      if (!deal_id) {
        return new Response(JSON.stringify({ error: "deal_id required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Mark all pending tasks as completed
      await supabase
        .from("workflow_tasks")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("deal_id", deal_id)
        .neq("status", "completed");

      await supabaseAdmin.from("deals").update({ status: "completed" }).eq("id", deal_id);

      return new Response(JSON.stringify({
        success: true,
        message: "Workflow complete. Advancing to Documentation & Billing.",
        next_phase: "documentation_billing",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("Workflow engine error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
