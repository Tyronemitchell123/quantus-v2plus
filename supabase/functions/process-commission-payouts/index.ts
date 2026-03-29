/**
 * Process Commission Payouts via Stripe
 * 
 * Creates Stripe PaymentIntents or Transfers for paid commission_logs
 * that haven't been processed yet (no invoice_id linked).
 * 
 * Supports two modes:
 *   - "preview": Returns a summary of commissions to be paid out
 *   - "execute": Creates real Stripe transfers/payments
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

    // Fetch all paid commissions without an invoice (not yet paid out via Stripe)
    const { data: commissions, error: commErr } = await supabase
      .from("commission_logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "paid")
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

    // Calculate totals
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
      logStep("Preview mode — returning summary");
      return new Response(JSON.stringify({
        payouts: summary,
        total: `$${(totalCents / 100).toLocaleString()}`,
        total_cents: totalCents,
        count: commissions.length,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── Execute real Stripe payout ───
    if (action !== "execute") {
      throw new Error("Invalid action. Use 'preview' or 'execute'.");
    }

    logStep("Execute mode — creating Stripe invoice");
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Find or create Stripe customer
    const customers = await stripe.customers.list({ email: user.email!, limit: 1 });
    let customerId: string;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
    }
    logStep("Stripe customer", { customerId });

    // Create a Stripe Invoice with line items for each commission
    const invoice = await stripe.invoices.create({
      customer: customerId,
      collection_method: "send_invoice",
      days_until_due: 0,
      auto_advance: true,
      metadata: {
        type: "commission_payout",
        user_id: user.id,
        commission_count: String(commissions.length),
      },
    });
    logStep("Invoice created", { invoiceId: invoice.id });

    // Add line items
    for (const c of commissions) {
      await stripe.invoiceItems.create({
        customer: customerId,
        invoice: invoice.id,
        amount: c.commission_cents,
        currency: "usd",
        description: `Commission — ${c.category.charAt(0).toUpperCase() + c.category.slice(1)} deal (${((c.commission_rate || 0) * 100).toFixed(1)}% of $${((c.deal_value_cents || 0) / 100).toLocaleString()})`,
        metadata: {
          commission_log_id: c.id,
          deal_id: c.deal_id,
          category: c.category,
        },
      });
    }
    logStep("Invoice items added", { count: commissions.length });

    // Finalize the invoice
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);
    logStep("Invoice finalized", { invoiceId: finalizedInvoice.id, total: finalizedInvoice.total });

    // Create internal invoice record
    const deal = commissions[0];
    const { data: dbInvoice, error: invErr } = await supabase
      .from("invoices")
      .insert({
        deal_id: deal.deal_id,
        user_id: user.id,
        amount_cents: totalCents,
        currency: "USD",
        status: "sent",
        invoice_type: "commission",
        recipient_name: user.user_metadata?.full_name || user.email,
        recipient_email: user.email,
        notes: `Stripe Invoice: ${finalizedInvoice.id}`,
        metadata: {
          stripe_invoice_id: finalizedInvoice.id,
          stripe_invoice_url: finalizedInvoice.hosted_invoice_url,
          commission_count: commissions.length,
        },
      })
      .select()
      .single();

    if (invErr) {
      logStep("WARNING: Failed to create DB invoice", { error: invErr.message });
    }

    // Link all commission_logs to the internal invoice
    if (dbInvoice) {
      for (const c of commissions) {
        await supabase
          .from("commission_logs")
          .update({ invoice_id: dbInvoice.id })
          .eq("id", c.id);
      }
      logStep("Commission logs linked to invoice", { invoiceId: dbInvoice.id });
    }

    return new Response(JSON.stringify({
      success: true,
      stripe_invoice_id: finalizedInvoice.id,
      stripe_invoice_url: finalizedInvoice.hosted_invoice_url,
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
