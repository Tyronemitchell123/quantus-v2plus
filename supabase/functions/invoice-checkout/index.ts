/**
 * Invoice Checkout Edge Function
 *
 * Creates a Stripe Checkout session for a specific deal invoice.
 * When the customer pays, the stripe-connect-webhook marks the
 * invoice as paid and commissions as collected.
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) {
    return new Response(
      JSON.stringify({ error: "STRIPE_SECRET_KEY not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    // Authenticate
    const supabaseAnon = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Not authenticated");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authErr } = await supabaseAnon.auth.getUser(token);
    if (authErr || !userData.user) throw new Error("Not authenticated");

    const { invoiceId, dealId } = await req.json();
    if (!invoiceId && !dealId) throw new Error("invoiceId or dealId is required");

    let invoice: any;

    if (invoiceId) {
      const { data, error } = await supabaseAdmin
        .from("invoices")
        .select("*")
        .eq("id", invoiceId)
        .eq("user_id", userData.user.id)
        .single();
      if (error || !data) throw new Error("Invoice not found");
      invoice = data;
    } else {
      // Try to find an existing unpaid invoice for the deal
      const { data: existing } = await supabaseAdmin
        .from("invoices")
        .select("*")
        .eq("deal_id", dealId)
        .eq("user_id", userData.user.id)
        .neq("status", "paid")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (existing) {
        invoice = existing;
      } else {
        // No invoice exists — auto-create one from pending commissions
        const { data: commissions } = await supabaseAdmin
          .from("commission_logs")
          .select("*")
          .eq("deal_id", dealId)
          .eq("user_id", userData.user.id)
          .in("status", ["pending", "expected"])
          .is("invoice_id", null)
          .gt("commission_cents", 0);

        if (!commissions || commissions.length === 0) {
          throw new Error("No pending commissions found for this deal");
        }

        const totalCents = commissions.reduce((s, c) => s + c.commission_cents, 0);
        const { data: deal } = await supabaseAdmin
          .from("deals")
          .select("deal_number, category")
          .eq("id", dealId)
          .single();

        const { data: newInv, error: invErr } = await supabaseAdmin
          .from("invoices")
          .insert({
            deal_id: dealId,
            user_id: userData.user.id,
            amount_cents: totalCents,
            currency: "USD",
            status: "draft",
            invoice_type: "commission",
            recipient_name: userData.user.user_metadata?.full_name || userData.user.email,
            recipient_email: userData.user.email,
            notes: `Auto-generated for ${commissions.length} commission(s)`,
            metadata: {
              commission_count: commissions.length,
              commission_ids: commissions.map(c => c.id),
            },
          })
          .select()
          .single();

        if (invErr || !newInv) throw new Error("Failed to create invoice");

        // Link commissions to the new invoice
        for (const c of commissions) {
          await supabaseAdmin
            .from("commission_logs")
            .update({ invoice_id: newInv.id })
            .eq("id", c.id);
        }

        invoice = newInv;
      }
    }

    if (invoice.status === "paid") {
      throw new Error("This invoice has already been paid");
    }

    // Get deal info for description
    const { data: deal } = await supabaseAdmin
      .from("deals")
      .select("deal_number, category")
      .eq("id", invoice.deal_id)
      .single();

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const origin = req.headers.get("origin") || "https://quantus-loom.lovable.app";

    const dealLabel = deal
      ? `${deal.deal_number} (${deal.category})`
      : invoice.invoice_number;

    const MAX_STRIPE_CENTS = 99999999; // $999,999.99

    // If amount exceeds Stripe limit, split into multiple checkout sessions
    if (invoice.amount_cents > MAX_STRIPE_CENTS) {
      const totalCents = invoice.amount_cents;
      // Split evenly into N parts, each ≤ MAX_STRIPE_CENTS
      const numParts = Math.ceil(totalCents / MAX_STRIPE_CENTS);
      const basePart = Math.floor(totalCents / numParts);
      const remainder = totalCents - basePart * numParts;
      const parts: number[] = [];
      for (let i = 0; i < numParts; i++) {
        // Distribute remainder across the first few parts (1 cent each)
        parts.push(basePart + (i < remainder ? 1 : 0));
      }

      const urls: string[] = [];
      for (let i = 0; i < parts.length; i++) {
        const partLabel = `Part ${i + 1}/${parts.length}`;
        const session = await stripe.checkout.sessions.create({
          line_items: [
            {
              price_data: {
                currency: (invoice.currency || "GBP").toLowerCase(),
                product_data: {
                  name: `Invoice ${invoice.invoice_number} — ${partLabel}`,
                  description: `Payment for deal ${dealLabel} (${partLabel}: ${(invoice.currency || "GBP").toUpperCase()} ${(parts[i] / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })})`,
                },
                unit_amount: parts[i],
              },
              quantity: 1,
            },
          ],
          mode: "payment",
          payment_intent_data: {
            metadata: {
              deal_id: invoice.deal_id,
              invoice_id: invoice.id,
              invoice_number: invoice.invoice_number,
              split_part: `${i + 1}/${parts.length}`,
            },
          },
          success_url: `${origin}/completion?deal=${invoice.deal_id}&payment=success&part=${i + 1}`,
          cancel_url: `${origin}/completion?deal=${invoice.deal_id}&payment=canceled`,
        });
        urls.push(session.url!);
      }

      await supabaseAdmin
        .from("invoices")
        .update({ status: "sent", updated_at: new Date().toISOString() })
        .eq("id", invoice.id);

      return new Response(
        JSON.stringify({
          split: true,
          urls,
          parts: parts.map((c, i) => ({ part: i + 1, amount_cents: c, amount: `${(invoice.currency || "GBP").toUpperCase()} ${(c / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}` })),
          invoiceId: invoice.id,
          total: `${(invoice.currency || "GBP").toUpperCase()} ${(totalCents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Normal single checkout
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: (invoice.currency || "GBP").toLowerCase(),
            product_data: {
              name: `Invoice ${invoice.invoice_number}`,
              description: `Payment for deal ${dealLabel}`,
            },
            unit_amount: invoice.amount_cents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      payment_intent_data: {
        metadata: {
          deal_id: invoice.deal_id,
          invoice_id: invoice.id,
          invoice_number: invoice.invoice_number,
        },
      },
      success_url: `${origin}/completion?deal=${invoice.deal_id}&payment=success`,
      cancel_url: `${origin}/completion?deal=${invoice.deal_id}&payment=canceled`,
    });

    await supabaseAdmin
      .from("invoices")
      .update({ status: "sent", updated_at: new Date().toISOString() })
      .eq("id", invoice.id);

    return new Response(
      JSON.stringify({ url: session.url, invoiceId: invoice.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
