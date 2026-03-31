/**
 * Process Commission Payouts via Stripe
 * 
 * Modes:
 *   - "preview": Returns a summary of commissions to be paid out
 *   - "execute": Creates a real Stripe Payout from balance to bank account
 *   - "balance": Returns current Stripe balance info
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: unknown) => {
  const d = details ? ` — ${JSON.stringify(details)}` : "";
  console.log(`[COMMISSION-PAYOUT] ${step}${d}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData.user) throw new Error("Unauthorized");
    const user = userData.user;
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { action = "preview" } = await req.json();
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // ─── Balance check ───
    if (action === "balance") {
      const balance = await stripe.balance.retrieve();
      const available = balance.available.map((b) => ({
        amount: b.amount,
        currency: b.currency,
        display: `${(b.amount / 100).toFixed(2)} ${b.currency.toUpperCase()}`,
      }));
      const pending = balance.pending.map((b) => ({
        amount: b.amount,
        currency: b.currency,
        display: `${(b.amount / 100).toFixed(2)} ${b.currency.toUpperCase()}`,
      }));
      return new Response(JSON.stringify({ available, pending }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch all paid commissions without an invoice (not yet paid out)
    const { data: commissions, error: commErr } = await supabase
      .from("commission_logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .is("invoice_id", null)
      .gt("commission_cents", 0)
      .order("created_at", { ascending: true });

    if (commErr) throw new Error(`Failed to fetch commissions: ${commErr.message}`);
    if (!commissions || commissions.length === 0) {
      return new Response(JSON.stringify({ message: "No pending payouts", payouts: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    logStep("Found commissions to process", { count: commissions.length });

    const totalCents = commissions.reduce((sum, c) => sum + c.commission_cents, 0);
    const summary = commissions.map((c) => ({
      id: c.id,
      deal_id: c.deal_id,
      category: c.category,
      deal_value: `$${((c.deal_value_cents || 0) / 100).toLocaleString()}`,
      commission_rate: `${((c.commission_rate || 0) * 100).toFixed(1)}%`,
      commission: `$${(c.commission_cents / 100).toLocaleString()}`,
      commission_cents: c.commission_cents,
      vendor_name: c.vendor_name,
    }));

    if (action === "preview") {
      // Also check available balance
      const balance = await stripe.balance.retrieve();
      const usdAvailable = balance.available.find((b) => b.currency === "usd");
      const gbpAvailable = balance.available.find((b) => b.currency === "gbp");

      return new Response(JSON.stringify({
        payouts: summary,
        total: `$${(totalCents / 100).toLocaleString()}`,
        total_cents: totalCents,
        count: commissions.length,
        stripe_balance: {
          usd_available_cents: usdAvailable?.amount || 0,
          gbp_available_cents: gbpAvailable?.amount || 0,
          sufficient_funds: (usdAvailable?.amount || 0) >= totalCents,
        },
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── Execute real Stripe Payout ───
    if (action !== "execute") {
      throw new Error("Invalid action. Use 'preview', 'execute', or 'balance'.");
    }

    logStep("Execute mode — creating Stripe Payout");

    // Check available balance
    const balance = await stripe.balance.retrieve();
    const usdAvailable = balance.available.find((b) => b.currency === "usd");
    const availableCents = usdAvailable?.amount || 0;

    if (availableCents < totalCents) {
      // Insufficient balance — provide clear guidance
      const gbpAvailable = balance.available.find((b) => b.currency === "gbp");
      return new Response(JSON.stringify({
        error: "Insufficient Stripe balance for payout",
        required_cents: totalCents,
        required: `$${(totalCents / 100).toFixed(2)}`,
        available_usd_cents: availableCents,
        available_usd: `$${(availableCents / 100).toFixed(2)}`,
        available_gbp: `£${((gbpAvailable?.amount || 0) / 100).toFixed(2)}`,
        guidance: "Payouts transfer money from your Stripe balance to your bank account. Your balance is funded by customer payments processed through Stripe. Once customers pay, the balance will be available for payout.",
        payouts: summary,
        total: `$${(totalCents / 100).toLocaleString()}`,
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create Stripe Payout (balance → bank account)
    let payout;
    try {
      payout = await stripe.payouts.create({
        amount: totalCents,
        currency: "usd",
        description: `Commission payout — ${commissions.length} deal(s), $${(totalCents / 100).toLocaleString()}`,
        metadata: {
          type: "commission_payout",
          user_id: user.id,
          commission_count: String(commissions.length),
          commission_ids: commissions.map((c) => c.id).join(","),
        },
      });
    } catch (stripeErr) {
      const msg = stripeErr instanceof Error ? stripeErr.message : String(stripeErr);
      logStep("Stripe payout creation FAILED", { error: msg });
      return new Response(JSON.stringify({
        error: `Stripe payout failed: ${msg}`,
        payouts: summary,
        total: `$${(totalCents / 100).toLocaleString()}`,
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    logStep("Payout created", { payoutId: payout.id, amount: payout.amount, status: payout.status });

    // Verify the payout was accepted by Stripe (status should be "pending", "in_transit", or "paid")
    const validStatuses = ["pending", "in_transit", "paid"];
    if (!validStatuses.includes(payout.status)) {
      logStep("Payout rejected by Stripe", { status: payout.status });
      return new Response(JSON.stringify({
        error: `Stripe payout was not accepted (status: ${payout.status}). Commissions remain pending.`,
        stripe_payout_id: payout.id,
        stripe_payout_status: payout.status,
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Only now create the invoice and mark commissions — Stripe confirmed the transfer
    const deal = commissions[0];
    const { data: dbInvoice, error: invErr } = await supabase
      .from("invoices")
      .insert({
        deal_id: deal.deal_id,
        user_id: user.id,
        amount_cents: totalCents,
        currency: "USD",
        status: payout.status === "paid" ? "paid" : "sent",
        invoice_type: "commission",
        recipient_name: user.user_metadata?.full_name || user.email,
        recipient_email: user.email,
        notes: `Stripe Payout: ${payout.id}`,
        paid_at: payout.status === "paid" ? new Date().toISOString() : null,
        metadata: {
          stripe_payout_id: payout.id,
          stripe_payout_status: payout.status,
          stripe_payout_arrival: payout.arrival_date,
          commission_count: commissions.length,
        },
      })
      .select()
      .single();

    if (invErr) {
      logStep("WARNING: Failed to create DB invoice", { error: invErr.message });
    }

    // Link commissions and set status based on confirmed Stripe payout state
    const commissionStatus = payout.status === "paid" ? "paid" : "processing";
    if (dbInvoice) {
      for (const c of commissions) {
        await supabase
          .from("commission_logs")
          .update({
            invoice_id: dbInvoice.id,
            status: commissionStatus,
            paid_at: payout.status === "paid" ? new Date().toISOString() : null,
          })
          .eq("id", c.id);
      }
      logStep(`Commission logs marked as '${commissionStatus}'`, { invoiceId: dbInvoice.id });
    }

    return new Response(JSON.stringify({
      success: true,
      stripe_payout_id: payout.id,
      stripe_payout_status: payout.status,
      estimated_arrival: payout.arrival_date
        ? new Date(payout.arrival_date * 1000).toISOString()
        : null,
      total: `$${(totalCents / 100).toLocaleString()}`,
      total_cents: totalCents,
      count: commissions.length,
      payouts: summary,
      internal_invoice_id: dbInvoice?.id,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
