import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const VANGUARD_RETAINER_PRICE = "price_1THX2ZLRzizeTfo4vDvPnpZw";
const AVIATION_SUCCESS_FEE_RATE = 0.05; // 5%
const MEDICAL_SUCCESS_FEE_RATE = 0.10; // 10%

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");

  if (!stripeKey) {
    return new Response(JSON.stringify({ error: "STRIPE_SECRET_KEY not configured" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const sb = createClient(supabaseUrl, serviceKey);
  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

  try {
    const body = await req.json().catch(() => ({}));
    const { action, client_id, user_id, event_type, event_value_cents, event_metadata } = body;

    // ACTION: create-retainer-subscription
    if (action === "create-retainer-subscription") {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) throw new Error("No authorization header");
      const token = authHeader.replace("Bearer ", "");
      const { data: userData } = await sb.auth.getUser(token);
      const user = userData.user;
      if (!user?.email) throw new Error("User not authenticated");

      // Find or create Stripe customer
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      let customerId: string;
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      } else {
        const customer = await stripe.customers.create({ email: user.email });
        customerId = customer.id;
      }

      // Create subscription checkout with USDC/crypto option
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [{ price: VANGUARD_RETAINER_PRICE, quantity: 1 }],
        mode: "subscription",
        payment_method_types: ["card", "crypto"],
        success_url: `${req.headers.get("origin")}/sovereign?billing=success`,
        cancel_url: `${req.headers.get("origin")}/sovereign?billing=cancelled`,
        metadata: {
          client_id: client_id || "",
          tier: "vanguard",
          type: "retainer",
        },
      });

      return new Response(JSON.stringify({ url: session.url, session_id: session.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACTION: trigger-success-fee (Phase 11: minimum $8k aviation, $2k medical)
    if (action === "trigger-success-fee") {
      if (!event_type || !event_value_cents) {
        throw new Error("event_type and event_value_cents required");
      }

      const rate = event_type === "flight_confirmed" ? AVIATION_SUCCESS_FEE_RATE
        : event_type === "clinic_booking" ? MEDICAL_SUCCESS_FEE_RATE
        : 0;

      if (rate === 0) {
        return new Response(JSON.stringify({ error: "Unknown event type" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Phase 11: Enforce minimum success fees
      const AVIATION_MIN_FEE_CENTS = 800000; // $8,000 minimum
      const MEDICAL_MIN_FEE_CENTS = 200000;  // $2,000 minimum
      const minFee = event_type === "flight_confirmed" ? AVIATION_MIN_FEE_CENTS : MEDICAL_MIN_FEE_CENTS;
      const calculatedFee = Math.round(event_value_cents * rate);
      const feeCents = Math.max(calculatedFee, minFee);
      const feeLabel = event_type === "flight_confirmed" ? "Aviation Success Fee (5%)" : "Medical Success Fee (10%)";

      // Log to commission_logs
      if (user_id) {
        const cappedValue = Math.min(event_value_cents, 2000000000);
        await sb.from("commission_logs").insert({
          user_id,
          deal_id: event_metadata?.deal_id || crypto.randomUUID(),
          category: event_type === "flight_confirmed" ? "aviation" : "medical",
          commission_cents: feeCents,
          deal_value_cents: cappedValue,
          commission_rate: rate,
          status: "pending",
          vendor_name: event_metadata?.vendor_name || null,
          notes: `${feeLabel} - Vanguard auto-triggered`,
        });
      }

      // Create one-time invoice for the success fee
      if (event_metadata?.customer_email) {
        const customers = await stripe.customers.list({ email: event_metadata.customer_email, limit: 1 });
        if (customers.data.length > 0) {
          const invoice = await stripe.invoices.create({
            customer: customers.data[0].id,
            auto_advance: true,
            collection_method: "send_invoice",
            days_until_due: 7,
            metadata: {
              type: "vanguard_success_fee",
              event_type,
              deal_id: event_metadata?.deal_id || "",
            },
          });

          // Create invoice item
          await stripe.invoiceItems.create({
            customer: customers.data[0].id,
            invoice: invoice.id,
            amount: feeCents,
            currency: "usd",
            description: feeLabel,
          });

          await stripe.invoices.finalizeInvoice(invoice.id);
        }
      }

      return new Response(JSON.stringify({
        success: true,
        fee_cents: feeCents,
        rate,
        event_type,
        label: feeLabel,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACTION: generate-alpha-report
    if (action === "generate-alpha-report") {
      const lovableKey = Deno.env.get("LOVABLE_API_KEY");
      if (!lovableKey) throw new Error("LOVABLE_API_KEY not configured");

      const targetUserId = user_id;
      if (!targetUserId) throw new Error("user_id required");

      // Gather real data from commission_logs
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const { data: commissions } = await sb.from("commission_logs")
        .select("*")
        .eq("user_id", targetUserId)
        .gte("created_at", monthStart);

      const aviationRevenue = (commissions || [])
        .filter((c: any) => c.category === "aviation")
        .reduce((sum: number, c: any) => sum + (c.commission_cents || 0), 0);
      const medicalRevenue = (commissions || [])
        .filter((c: any) => ["medical", "longevity"].includes(c.category))
        .reduce((sum: number, c: any) => sum + (c.commission_cents || 0), 0);
      const totalSavings = (commissions || [])
        .reduce((sum: number, c: any) => sum + (c.deal_value_cents || 0), 0);

      // Get client profile
      const { data: profile } = await sb.from("profiles")
        .select("display_name")
        .eq("user_id", targetUserId)
        .maybeSingle();

      const clientName = profile?.display_name || "Valued Client";
      const monthName = now.toLocaleString("en-US", { month: "long", year: "numeric" });

      // Generate AI-powered alpha report
      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content: `You are the Quantus V2+ Concierge. Write a premium Monthly Alpha Report for a Vanguard Tier-1 client. 
              Tone: executive, sophisticated, data-driven. Format: plain text suitable for email. 
              Include: monthly savings summary, aviation arbitrage highlights, medical/longevity access secured, 
              productivity hours reclaimed estimate, and a forward-looking note. Keep it under 300 words.
              Do NOT include subject lines or email headers.`,
            },
            {
              role: "user",
              content: `Generate the ${monthName} Alpha Report for ${clientName}.
              Data: Aviation revenue saved: $${(totalSavings / 100).toLocaleString()}. 
              Aviation commissions: $${(aviationRevenue / 100).toLocaleString()}. 
              Medical/Longevity commissions: $${(medicalRevenue / 100).toLocaleString()}.
              Total deals this month: ${(commissions || []).length}.
              Retainer: $20,000/mo processed.`,
            },
          ],
        }),
      });

      if (!aiResponse.ok) {
        const errText = await aiResponse.text();
        console.error("AI gateway error:", aiResponse.status, errText);

        if (aiResponse.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limited, please try again later." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (aiResponse.status === 402) {
          return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error("Failed to generate alpha report");
      }

      const aiData = await aiResponse.json();
      const reportContent = aiData.choices?.[0]?.message?.content || "Report generation failed.";

      return new Response(JSON.stringify({
        success: true,
        client_name: clientName,
        month: monthName,
        report: reportContent,
        financials: {
          aviation_revenue_cents: aviationRevenue,
          medical_revenue_cents: medicalRevenue,
          total_savings_cents: totalSavings,
          retainer_cents: 2000000,
          deals_count: (commissions || []).length,
        },
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACTION: get-billing-summary
    if (action === "get-billing-summary") {
      const targetUserId = user_id;
      if (!targetUserId) throw new Error("user_id required");

      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const { data: commissions } = await sb.from("commission_logs")
        .select("*")
        .eq("user_id", targetUserId)
        .gte("created_at", monthStart);

      const aviationFees = (commissions || [])
        .filter((c: any) => c.category === "aviation")
        .reduce((sum: number, c: any) => sum + (c.commission_cents || 0), 0);
      const medicalFees = (commissions || [])
        .filter((c: any) => ["medical", "longevity"].includes(c.category))
        .reduce((sum: number, c: any) => sum + (c.commission_cents || 0), 0);
      const totalDealValue = (commissions || [])
        .reduce((sum: number, c: any) => sum + (c.deal_value_cents || 0), 0);

      return new Response(JSON.stringify({
        retainer_cents: 2000000,
        aviation_fees_cents: aviationFees,
        medical_fees_cents: medicalFees,
        total_revenue_cents: 2000000 + aviationFees + medicalFees,
        total_deal_value_cents: totalDealValue,
        deals_count: (commissions || []).length,
        month: now.toLocaleString("en-US", { month: "long", year: "numeric" }),
        crypto_enabled: true,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action. Use: create-retainer-subscription, trigger-success-fee, generate-alpha-report, get-billing-summary" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("vanguard-billing error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
