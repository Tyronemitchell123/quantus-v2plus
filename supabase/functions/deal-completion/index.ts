import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { rateLimit } from "../_shared/rate-limit.ts";
import {
  corsHeaders,
  handleCors,
  jsonResponse,
  errorResponse,
  COMMISSION_RATES,
  edgeLog,
} from "../_shared/supabase-admin.ts";

const UPSELL_CATALOG: Record<string, { title: string; description: string; category: string }[]> = {
  aviation: [
    { title: "Management Comparison", description: "Independent analysis of aircraft management providers to optimize costs and service levels.", category: "aviation" },
    { title: "Charter Revenue Optimization", description: "Maximize charter income through strategic positioning, pricing models, and operator selection.", category: "aviation" },
    { title: "Maintenance Program Review", description: "Evaluate current maintenance programs for cost efficiency and compliance optimization.", category: "aviation" },
    { title: "Upgrade & Replacement Options", description: "Curated analysis of next-generation aircraft aligned with your mission profile.", category: "aviation" },
  ],
  medical: [
    { title: "Annual Executive Health Program", description: "Comprehensive longevity-focused health screening with world-class diagnostics.", category: "medical" },
    { title: "Longevity Optimization", description: "Personalized anti-aging and performance protocols with leading specialists.", category: "medical" },
    { title: "Wellness Retreat Curation", description: "Bespoke wellness experiences at the world's finest medical spas and retreats.", category: "medical" },
  ],
  staffing: [
    { title: "Additional Role Sourcing", description: "Expand your household team with pre-vetted candidates for complementary positions.", category: "staffing" },
    { title: "Household Operations Blueprint", description: "Structured operational framework for multi-property household management.", category: "staffing" },
    { title: "Estate Digital Twin Setup", description: "Digital modeling of estate operations for optimization and succession planning.", category: "staffing" },
  ],
  lifestyle: [
    { title: "Seasonal Travel Planning", description: "Year-round itinerary architecture across your preferred destinations.", category: "lifestyle" },
    { title: "Villa & Yacht Sourcing", description: "Access to off-market properties and vessels for purchase or seasonal charter.", category: "lifestyle" },
    { title: "Experience Curation", description: "Exclusive access to cultural, culinary, and adventure experiences worldwide.", category: "lifestyle" },
  ],
  logistics: [
    { title: "Fleet Optimization", description: "Data-driven analysis of vehicle fleet utilization, costs, and replacement cycles.", category: "logistics" },
    { title: "Compliance Audit", description: "Comprehensive review of regulatory compliance across all operational jurisdictions.", category: "logistics" },
    { title: "Dispatch Subscription", description: "Always-on logistics coordination with real-time tracking and route optimization.", category: "logistics" },
  ],
  partnerships: [
    { title: "Strategic Partnership Expansion", description: "Identify and engage complementary partners to expand your network.", category: "partnerships" },
    { title: "Revenue Share Optimization", description: "Restructure partnership terms for maximum mutual value.", category: "partnerships" },
  ],
};

const TIER_THRESHOLDS = [
  { tier: "obsidian", label: "Obsidian", minDeals: 10, minRevenue: 50000000 },
  { tier: "black", label: "Black", minDeals: 5, minRevenue: 10000000 },
  { tier: "gold", label: "Gold", minDeals: 3, minRevenue: 1000000 },
  { tier: "silver", label: "Silver", minDeals: 1, minRevenue: 0 },
];

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const rateLimited = rateLimit(req, corsHeaders);
    if (rateLimited) return rateLimited;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    const { data, error: claimsErr } = await supabase.auth.getClaims(token);
    if (claimsErr || !data?.claims) return errorResponse("Unauthorized", 401);
    const userId = data.claims.sub as string;

    const body = await req.json();
    const { action, dealId } = body;

    if (!action || typeof action !== "string") {
      return errorResponse("action is required", 400);
    }

    if (action === "complete") {
      if (!dealId) return errorResponse("dealId is required", 400);

      // Mark deal as completed
      const { data: deal, error: dealErr } = await supabase
        .from("deals")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", dealId)
        .eq("user_id", userId)
        .select()
        .single();
      if (dealErr) throw dealErr;

      // Determine commission rate from shared constants
      let commissionRate = COMMISSION_RATES[deal.category] ?? COMMISSION_RATES.default;

      if (deal.custom_commission_rate !== null && deal.custom_commission_rate !== undefined) {
        commissionRate = deal.custom_commission_rate / 100;
      } else {
        const { data: vendorOutreach } = await supabase
          .from("vendor_outreach")
          .select("custom_commission_rate")
          .eq("deal_id", dealId)
          .not("custom_commission_rate", "is", null)
          .limit(1);
        if (vendorOutreach?.[0]?.custom_commission_rate != null) {
          commissionRate = vendorOutreach[0].custom_commission_rate / 100;
        }
      }

      // Auto-create commission log if deal has value
      if (deal.deal_value_estimate && deal.deal_value_estimate > 0) {
        const dealValueCents = Math.min(Math.round(deal.deal_value_estimate * 100), 2000000000);
        const commissionCents = Math.round(deal.deal_value_estimate * commissionRate * 100);

        // Look up vendor contact from outreach
        const { data: outreach } = await supabase
          .from("vendor_outreach")
          .select("vendor_name, vendor_email, vendor_company, vendor_score")
          .eq("deal_id", dealId)
          .order("vendor_score", { ascending: false })
          .limit(1)
          .maybeSingle();

        const { data: commLog } = await supabase.from("commission_logs").insert({
          deal_id: dealId,
          user_id: userId,
          category: deal.category,
          deal_value_cents: dealValueCents,
          commission_rate: commissionRate,
          commission_cents: commissionCents,
          status: "pending",
          vendor_name: outreach?.vendor_name || null,
        }).select().single();

        edgeLog("info", "deal-completion", "Commission created", { dealId, commissionCents, rate: commissionRate });

        // Auto-create invoice
        if (commLog) {
          const recipientName = outreach?.vendor_name || outreach?.vendor_company || "Customer";
          const recipientEmail = outreach?.vendor_email || null;
          const currency = deal.budget_currency || "GBP";

          const { data: newInvoice } = await supabase.from("invoices").insert({
            deal_id: dealId,
            user_id: userId,
            amount_cents: commissionCents,
            currency,
            status: "draft",
            invoice_type: "commission",
            recipient_name: recipientName,
            recipient_email: recipientEmail,
            notes: `Auto-generated commission invoice for ${deal.deal_number}`,
            metadata: {
              commission_log_id: commLog.id,
              commission_rate: commissionRate,
              auto_generated: true,
            },
          }).select().single();

          // Link commission to invoice
          if (newInvoice) {
            await supabase.from("commission_logs")
              .update({ invoice_id: newInvoice.id })
              .eq("id", commLog.id);

            // Generate Stripe checkout link and send payment email
            const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
            if (stripeKey && recipientEmail && commissionCents > 0) {
              try {
                const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
                const origin = "https://quantus-v2plus.lovable.app";
                const dealLabel = `${deal.deal_number} (${deal.category})`;

                const session = await stripe.checkout.sessions.create({
                  line_items: [{
                    price_data: {
                      currency: currency.toLowerCase(),
                      product_data: {
                        name: `Invoice ${newInvoice.invoice_number}`,
                        description: `Payment for deal ${dealLabel}`,
                      },
                      unit_amount: commissionCents,
                    },
                    quantity: 1,
                  }],
                  mode: "payment",
                  customer_email: recipientEmail,
                  payment_intent_data: {
                    metadata: {
                      deal_id: dealId,
                      invoice_id: newInvoice.id,
                      invoice_number: newInvoice.invoice_number,
                    },
                  },
                  success_url: `${origin}/pay?status=success&invoice=${newInvoice.invoice_number}`,
                  cancel_url: `${origin}/pay?status=canceled&invoice=${newInvoice.invoice_number}`,
                });

                // Update invoice status to sent with payment URL
                await supabase.from("invoices")
                  .update({
                    status: "sent",
                    updated_at: new Date().toISOString(),
                    metadata: {
                      ...newInvoice.metadata as Record<string, unknown>,
                      checkout_url: session.url,
                      checkout_session_id: session.id,
                    },
                  })
                  .eq("id", newInvoice.id);

                // Send payment email via transactional email system
                const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
                const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
                const symbol = currency.toUpperCase() === "GBP" ? "£" : "$";
                const amountFormatted = `${symbol}${(commissionCents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

                await fetch(`${supabaseUrl}/functions/v1/send-transactional-email`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${serviceKey}`,
                  },
                  body: JSON.stringify({
                    template_name: "payment-reminder",
                    to: recipientEmail,
                    purpose: "transactional",
                    idempotency_key: `invoice-${newInvoice.id}`,
                    data: {
                      customerName: recipientName,
                      dealCategory: deal.category,
                      dealNumber: deal.deal_number,
                      amountDue: amountFormatted,
                      paymentUrl: session.url,
                    },
                  }),
                });

                edgeLog("info", "deal-completion", "Invoice sent with payment link", {
                  dealId,
                  invoiceId: newInvoice.id,
                  recipientEmail,
                  amount: amountFormatted,
                });
              } catch (stripeErr: any) {
                edgeLog("error", "deal-completion", "Failed to generate payment link", {
                  dealId,
                  err: stripeErr.message,
                });
              }
            }
          }
        }
      }

      // Generate summary
      const { data: docs } = await supabase.from("deal_documents").select("*").eq("deal_id", dealId);
      const { data: invoices } = await supabase.from("invoices").select("*").eq("deal_id", dealId);
      const { data: commissions } = await supabase.from("commission_logs").select("*").eq("deal_id", dealId);
      const { data: tasks } = await supabase.from("workflow_tasks").select("*").eq("deal_id", dealId);

      const totalRevenue = (commissions || []).reduce((s: number, c: any) => s + (c.commission_cents || 0), 0);
      const paidRevenue = (commissions || []).filter((c: any) => c.status === "paid").reduce((s: number, c: any) => s + (c.commission_cents || 0), 0);

      const summary = {
        deal_number: deal.deal_number,
        category: deal.category,
        sub_category: deal.sub_category,
        deal_value: deal.deal_value_estimate,
        commission_rate: commissionRate,
        total_documents: (docs || []).length,
        signed_documents: (docs || []).filter((d: any) => d.status === "signed").length,
        total_invoices: (invoices || []).length,
        paid_invoices: (invoices || []).filter((i: any) => i.status === "paid").length,
        total_revenue_cents: totalRevenue,
        paid_revenue_cents: paidRevenue,
        outstanding_revenue_cents: totalRevenue - paidRevenue,
        total_tasks: (tasks || []).length,
        completed_tasks: (tasks || []).filter((t: any) => t.status === "completed").length,
        completion_date: deal.completed_at,
      };

      return jsonResponse({ summary });
    }

    if (action === "upsells") {
      if (!dealId) return errorResponse("dealId is required", 400);
      const { data: deal } = await supabase.from("deals").select("category").eq("id", dealId).eq("user_id", userId).single();
      if (!deal) return errorResponse("Deal not found", 404);

      const upsells = UPSELL_CATALOG[deal.category] || UPSELL_CATALOG.lifestyle;
      const message = "Based on your recent project, we have prepared tailored recommendations that may enhance your upcoming plans.";

      return jsonResponse({ upsells, message });
    }

    if (action === "tier_check") {
      const { count: dealCount } = await supabase.from("deals").select("*", { count: "exact", head: true }).eq("user_id", userId).eq("status", "completed");
      const { data: allCommissions } = await supabase.from("commission_logs").select("commission_cents").eq("user_id", userId);
      const totalRev = (allCommissions || []).reduce((s: number, c: any) => s + (c.commission_cents || 0), 0);

      const { data: sub } = await supabase.from("subscriptions").select("tier").eq("user_id", userId).maybeSingle();
      const currentTier = sub?.tier || "free";

      let recommended = null;
      for (const t of TIER_THRESHOLDS) {
        if ((dealCount || 0) >= t.minDeals && totalRev >= t.minRevenue) {
          if (t.tier !== currentTier) recommended = t;
          break;
        }
      }

      return jsonResponse({
        currentTier,
        completedDeals: dealCount || 0,
        totalRevenueCents: totalRev,
        recommendation: recommended ? {
          tier: recommended.tier,
          label: recommended.label,
          message: `Your recent activity aligns with our ${recommended.label} Tier benefits. Upgrading would streamline future orchestration and unlock additional privileges.`,
        } : null,
      });
    }

    if (action === "archive_list") {
      const { data: deals } = await supabase
        .from("deals")
        .select("id, deal_number, category, sub_category, status, deal_value_estimate, budget_currency, completed_at, created_at")
        .eq("user_id", userId)
        .eq("status", "completed")
        .order("completed_at", { ascending: false });

      return jsonResponse({ deals: deals || [] });
    }

    return errorResponse("Unknown action", 400);
  } catch (err: any) {
    edgeLog("error", "deal-completion", "Request failed", { err: err.message });
    return errorResponse(err.message, 400);
  }
});
