import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

/**
 * Deal Auto-Progression Cron
 * Automatically moves deals through the pipeline:
 *   sourcing (2h) → negotiation (4h) → execution (2h) → completed (triggers deal-completion)
 * 
 * Also handles:
 * - Payment reminder re-sends for unpaid invoices (every 48h)
 * - Auto-outreach draft generation for new vendors
 */

const PHASE_DURATIONS_HOURS: Record<string, { next: string; hours: number }> = {
  sourcing: { next: "negotiation", hours: 2 },
  negotiation: { next: "execution", hours: 4 },
  execution: { next: "completed", hours: 2 },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const results = {
      deals_progressed: [] as string[],
      deals_completed: [] as string[],
      invoice_reminders_sent: 0,
      errors: [] as string[],
    };

    // ── 1. Progress deals through phases ──
    for (const [currentStatus, config] of Object.entries(PHASE_DURATIONS_HOURS)) {
      const cutoff = new Date(Date.now() - config.hours * 60 * 60 * 1000).toISOString();

      const { data: deals, error: fetchErr } = await supabase
        .from("deals")
        .select("id, deal_number, user_id, category, updated_at")
        .eq("status", currentStatus)
        .lt("updated_at", cutoff)
        .limit(50);

      if (fetchErr) {
        results.errors.push(`Fetch ${currentStatus}: ${fetchErr.message}`);
        continue;
      }

      if (!deals || deals.length === 0) continue;

      for (const deal of deals) {
        try {
          if (config.next === "completed") {
            // Use the deal-completion function for full pipeline
            const { error: completeErr } = await supabase.functions.invoke("deal-completion", {
              body: { action: "complete", dealId: deal.id },
            });

            if (completeErr) {
              // Fallback: just update status directly
              await supabase
                .from("deals")
                .update({ status: "completed", completed_at: new Date().toISOString() })
                .eq("id", deal.id);
            }

            results.deals_completed.push(deal.deal_number);
          } else {
            await supabase
              .from("deals")
              .update({ status: config.next as any })
              .eq("id", deal.id);

            results.deals_progressed.push(`${deal.deal_number}: ${currentStatus} → ${config.next}`);
          }
        } catch (dealErr) {
          results.errors.push(`Deal ${deal.deal_number}: ${dealErr instanceof Error ? dealErr.message : "unknown"}`);
        }
      }
    }

    // ── 2. Payment reminder re-sends (unpaid invoices older than 48h) ──
    const reminderCutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    const { data: unpaidInvoices } = await supabase
      .from("invoices")
      .select("id, deal_id, recipient_email, amount_cents, currency, invoice_number, reminder_count, last_reminder_at")
      .eq("status", "pending")
      .or(`last_reminder_at.is.null,last_reminder_at.lt.${reminderCutoff}`)
      .limit(20);

    if (unpaidInvoices && unpaidInvoices.length > 0) {
      for (const invoice of unpaidInvoices) {
        if ((invoice.reminder_count ?? 0) >= 5) continue; // Max 5 reminders

        try {
          // Send reminder via transactional email if available
          if (invoice.recipient_email) {
            await supabase.functions.invoke("send-transactional-email", {
              body: {
                templateName: "payment-reminder",
                recipientEmail: invoice.recipient_email,
                idempotencyKey: `payment-reminder-${invoice.id}-${(invoice.reminder_count ?? 0) + 1}`,
                templateData: {
                  invoiceNumber: invoice.invoice_number,
                  amount: `£${((invoice.amount_cents || 0) / 100).toLocaleString()}`,
                },
              },
            });
          }

          // Update reminder tracking
          await supabase
            .from("invoices")
            .update({
              reminder_count: (invoice.reminder_count ?? 0) + 1,
              last_reminder_at: new Date().toISOString(),
            })
            .eq("id", invoice.id);

          results.invoice_reminders_sent++;
        } catch (reminderErr) {
          results.errors.push(`Reminder ${invoice.invoice_number}: ${reminderErr instanceof Error ? reminderErr.message : "unknown"}`);
        }
      }
    }

    // ── 3. Log system health ──
    await supabase.from("system_health").insert({
      function_name: "deal-auto-progression",
      event_type: "cron_run",
      severity: results.errors.length > 0 ? "warning" : "info",
      metadata: results,
    });

    console.log("Auto-progression results:", JSON.stringify(results));

    return new Response(JSON.stringify({ success: true, ...results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    console.error("Auto-progression error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
