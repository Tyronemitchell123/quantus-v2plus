import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { rateLimit } from "../_shared/rate-limit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const rateLimited = rateLimit(req, corsHeaders);
    if (rateLimited) return rateLimited;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) throw new Error("Unauthorized");

    const { action, dealId } = await req.json();

    if (action === "complete") {
      // Default commission rates by category
      const DEFAULT_COMMISSION_RATES: Record<string, number> = {
        aviation: 0.025, medical: 0.08, staffing: 0.20,
        lifestyle: 0.10, logistics: 0.05, partnerships: 0.07,
      };

      // Mark deal as completed
      const { data: deal, error: dealErr } = await supabase
        .from("deals")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", dealId)
        .eq("user_id", user.id)
        .select()
        .single();
      if (dealErr) throw dealErr;

      // Determine commission rate: deal custom > vendor custom > category default
      let commissionRate = DEFAULT_COMMISSION_RATES[deal.category] || 0.05;

      if (deal.custom_commission_rate !== null && deal.custom_commission_rate !== undefined) {
        commissionRate = deal.custom_commission_rate / 100; // stored as percentage
      } else {
        // Check if any vendor on this deal has a custom rate
        const { data: vendorOutreach } = await supabase
          .from("vendor_outreach")
          .select("custom_commission_rate")
          .eq("deal_id", dealId)
          .not("custom_commission_rate", "is", null)
          .limit(1);
        if (vendorOutreach && vendorOutreach.length > 0 && vendorOutreach[0].custom_commission_rate !== null) {
          commissionRate = vendorOutreach[0].custom_commission_rate / 100;
        }
      }

      // Auto-create commission log if deal has value
      if (deal.deal_value_estimate && deal.deal_value_estimate > 0) {
        const commissionCents = Math.round(deal.deal_value_estimate * commissionRate * 100);
        await supabase.from("commission_logs").insert({
          deal_id: dealId,
          user_id: user.id,
          category: deal.category,
          deal_value_cents: deal.deal_value_estimate * 100,
          commission_rate: commissionRate,
          commission_cents: commissionCents,
          status: "pending",
        });
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

      return new Response(JSON.stringify({ summary }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "upsells") {
      const { data: deal } = await supabase.from("deals").select("category").eq("id", dealId).eq("user_id", user.id).single();
      if (!deal) throw new Error("Deal not found");

      const upsells = UPSELL_CATALOG[deal.category] || UPSELL_CATALOG.lifestyle;
      const message = "Based on your recent project, we have prepared tailored recommendations that may enhance your upcoming plans.";

      return new Response(JSON.stringify({ upsells, message }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "tier_check") {
      // Check if client should upgrade
      const { count: dealCount } = await supabase.from("deals").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "completed");
      const { data: allCommissions } = await supabase.from("commission_logs").select("commission_cents").eq("user_id", user.id);
      const totalRev = (allCommissions || []).reduce((s: number, c: any) => s + (c.commission_cents || 0), 0);

      const { data: sub } = await supabase.from("subscriptions").select("tier").eq("user_id", user.id).maybeSingle();
      const currentTier = sub?.tier || "free";

      let recommended = null;
      for (const t of TIER_THRESHOLDS) {
        if ((dealCount || 0) >= t.minDeals && totalRev >= t.minRevenue) {
          if (t.tier !== currentTier) recommended = t;
          break;
        }
      }

      return new Response(JSON.stringify({
        currentTier,
        completedDeals: dealCount || 0,
        totalRevenueCents: totalRev,
        recommendation: recommended ? {
          tier: recommended.tier,
          label: recommended.label,
          message: `Your recent activity aligns with our ${recommended.label} Tier benefits. Upgrading would streamline future orchestration and unlock additional privileges.`,
        } : null,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "archive_list") {
      const { data: deals } = await supabase
        .from("deals")
        .select("id, deal_number, category, sub_category, status, deal_value_estimate, budget_currency, completed_at, created_at")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .order("completed_at", { ascending: false });

      return new Response(JSON.stringify({ deals: deals || [] }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    throw new Error("Unknown action");
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
