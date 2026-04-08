import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

/**
 * Monthly Revenue Report
 * Generates and emails a revenue summary to all admin users on the 1st of each month.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    const monthName = lastMonth.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

    // Get completed deals for last month
    const { data: completedDeals } = await supabase
      .from("deals")
      .select("id, deal_number, category, deal_value_estimate, completed_at")
      .eq("status", "completed")
      .gte("completed_at", lastMonth.toISOString())
      .lte("completed_at", lastMonthEnd.toISOString());

    // Get commissions for last month
    const { data: commissions } = await supabase
      .from("commission_logs")
      .select("commission_cents, status, category")
      .gte("created_at", lastMonth.toISOString())
      .lte("created_at", lastMonthEnd.toISOString());

    // Get paid invoices for last month
    const { data: paidInvoices } = await supabase
      .from("invoices")
      .select("amount_cents")
      .eq("status", "paid")
      .gte("paid_at", lastMonth.toISOString())
      .lte("paid_at", lastMonthEnd.toISOString());

    // Get pipeline deals (active)
    const { data: pipelineDeals } = await supabase
      .from("deals")
      .select("id, deal_value_estimate")
      .neq("status", "completed")
      .neq("status", "intake");

    // Calculate metrics
    const totalDeals = completedDeals?.length || 0;
    const totalCommissions = (commissions || []).reduce((sum, c) => sum + (c.commission_cents || 0), 0);
    const paidCommissions = (commissions || []).filter(c => c.status === "paid").reduce((sum, c) => sum + (c.commission_cents || 0), 0);
    const totalRevenue = (paidInvoices || []).reduce((sum, i) => sum + (i.amount_cents || 0), 0);
    const pipelineValue = (pipelineDeals || []).reduce((sum, d) => sum + (d.deal_value_estimate || 0), 0);

    const formatGBP = (cents: number) => `£${(cents / 100).toLocaleString("en-GB", { minimumFractionDigits: 2 })}`;

    // Category breakdown
    const categoryMap: Record<string, number> = {};
    for (const c of commissions || []) {
      categoryMap[c.category] = (categoryMap[c.category] || 0) + (c.commission_cents || 0);
    }

    const categoryBreakdown = Object.entries(categoryMap)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, cents]) => `${cat}: ${formatGBP(cents)}`)
      .join(" | ");

    // Get admin users
    const { data: adminRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    const adminIds = (adminRoles || []).map(r => r.user_id);

    // Send email to each admin
    for (const adminId of adminIds) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, user_id")
        .eq("user_id", adminId)
        .single();

      // Get admin email from auth (via profiles lookup)
      const { data: { users } } = await supabase.auth.admin.listUsers();
      const adminUser = users?.find(u => u.id === adminId);
      if (!adminUser?.email) continue;

      await supabase.functions.invoke("send-transactional-email", {
        body: {
          template_name: "monthly-revenue-report",
          recipient_email: adminUser.email,
          idempotency_key: `monthly-report-${lastMonth.toISOString().slice(0, 7)}-${adminId}`,
          templateData: {
            customerName: profile?.display_name || "Admin",
            monthName,
            totalDeals: String(totalDeals),
            totalRevenue: formatGBP(totalRevenue),
            totalCommissions: formatGBP(totalCommissions),
            paidCommissions: formatGBP(paidCommissions),
            pipelineValue: formatGBP(pipelineValue * 100), // deal_value_estimate is in whole units
            pipelineDeals: String(pipelineDeals?.length || 0),
            categoryBreakdown: categoryBreakdown || "No data",
          },
        },
      });
    }

    // Log system health
    await supabase.from("system_health").insert({
      function_name: "monthly-revenue-report",
      event_type: "report_generated",
      severity: "info",
      metadata: {
        month: monthName,
        totalDeals,
        totalRevenue: formatGBP(totalRevenue),
        adminsSent: adminIds.length,
      },
    });

    return new Response(JSON.stringify({
      success: true,
      month: monthName,
      metrics: { totalDeals, totalRevenue: formatGBP(totalRevenue), totalCommissions: formatGBP(totalCommissions) },
      adminsSent: adminIds.length,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Monthly report error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
