/**
 * Payment Reminders Edge Function
 * 
 * Re-sends payment reminder emails for unpaid invoices every 48 hours.
 * Capped at 5 reminders per invoice.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const db = createClient(supabaseUrl, serviceKey);

    const MAX_REMINDERS = 5;
    const REMINDER_INTERVAL_HOURS = 48;

    // Fetch sent (unpaid) invoices that are due for a reminder
    const cutoff = new Date(Date.now() - REMINDER_INTERVAL_HOURS * 60 * 60 * 1000).toISOString();

    const { data: invoices, error: fetchErr } = await db
      .from("invoices")
      .select("*, deals(deal_number, category)")
      .eq("status", "sent")
      .lt("reminder_count", MAX_REMINDERS)
      .or(`last_reminder_at.is.null,last_reminder_at.lt.${cutoff}`)
      .not("recipient_email", "is", null)
      .order("created_at", { ascending: true });

    if (fetchErr) throw new Error(`Fetch error: ${fetchErr.message}`);
    if (!invoices || invoices.length === 0) {
      return new Response(
        JSON.stringify({ success: true, reminded: 0, message: "No invoices due for reminder" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[payment-reminders] Processing ${invoices.length} invoices`);

    let reminded = 0;

    for (const inv of invoices) {
      try {
        const checkoutUrl = inv.metadata?.checkout_url;
        if (!checkoutUrl) {
          console.log(`[payment-reminders] Skipping ${inv.invoice_number} — no checkout URL`);
          continue;
        }

        const dealLabel = inv.deals
          ? `${inv.deals.deal_number} (${inv.deals.category})`
          : inv.invoice_number;

        const amountFormatted = new Intl.NumberFormat("en-GB", {
          style: "currency",
          currency: inv.currency || "GBP",
        }).format(inv.amount_cents / 100);

        const reminderNum = (inv.reminder_count || 0) + 1;

        await db.functions.invoke("send-transactional-email", {
          body: {
            templateName: "payment-reminder",
            recipientEmail: inv.recipient_email,
            idempotencyKey: `invoice-reminder-${inv.id}-${reminderNum}`,
            templateData: {
              recipientName: inv.recipient_name || "Customer",
              invoiceNumber: inv.invoice_number,
              amount: amountFormatted,
              checkoutUrl,
              dealLabel,
              reminderNumber: reminderNum,
            },
          },
        });

        // Update reminder tracking
        await db
          .from("invoices")
          .update({
            reminder_count: reminderNum,
            last_reminder_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", inv.id);

        reminded++;
        console.log(`[payment-reminders] Reminder #${reminderNum} sent for ${inv.invoice_number}`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[payment-reminders] Failed ${inv.invoice_number}:`, msg);
      }
    }

    console.log(`[payment-reminders] Complete: ${reminded}/${invoices.length} reminded`);

    return new Response(
      JSON.stringify({ success: true, reminded, total: invoices.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("[payment-reminders] Error:", e);
    return new Response(
      JSON.stringify({ error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
