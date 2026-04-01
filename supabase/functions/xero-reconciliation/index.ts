import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Xero Revenue Stream Mapping
const XERO_ACCOUNT_CODES: Record<string, string> = {
  aviation: "200",     // Aviation Revenue
  medical: "210",      // Longevity/Medical Revenue
  longevity: "210",    // Same as medical
  retainer: "220",     // Vanguard Retainer Revenue
  hospitality: "230",  // Hospitality Revenue
  lifestyle: "240",    // Lifestyle Revenue
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const xeroClientId = Deno.env.get("XERO_CLIENT_ID");
  const xeroClientSecret = Deno.env.get("XERO_CLIENT_SECRET");
  const xeroTenantId = Deno.env.get("XERO_TENANT_ID");
  const xeroAccessToken = Deno.env.get("XERO_ACCESS_TOKEN");

  if (!xeroClientId || !xeroClientSecret) {
    return new Response(JSON.stringify({ 
      error: "Xero not configured",
      message: "XERO_CLIENT_ID and XERO_CLIENT_SECRET must be set to enable auto-reconciliation.",
      manual_mode: true,
    }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const sb = createClient(supabaseUrl, serviceKey);

  try {
    const body = await req.json().catch(() => ({}));
    const { action, user_id, period_start, period_end } = body;

    // ACTION: sync-commissions — Push paid commissions to Xero as invoices
    if (action === "sync-commissions") {
      if (!xeroAccessToken || !xeroTenantId) {
        return new Response(JSON.stringify({ 
          error: "Xero access token not available. Complete OAuth flow first.",
        }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const start = period_start || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const end = period_end || new Date().toISOString();

      const { data: paidCommissions } = await sb.from("commission_logs")
        .select("*")
        .eq("status", "paid")
        .gte("paid_at", start)
        .lte("paid_at", end);

      if (!paidCommissions?.length) {
        return new Response(JSON.stringify({ synced: 0, message: "No paid commissions to sync" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Group by category for Xero line items
      const grouped: Record<string, { total_cents: number; count: number }> = {};
      for (const c of paidCommissions) {
        const cat = c.category || "general";
        if (!grouped[cat]) grouped[cat] = { total_cents: 0, count: 0 };
        grouped[cat].total_cents += c.commission_cents || 0;
        grouped[cat].count += 1;
      }

      // Build Xero invoice payload
      const lineItems = Object.entries(grouped).map(([category, data]) => ({
        Description: `Quantus ${category.charAt(0).toUpperCase() + category.slice(1)} Commission Revenue`,
        Quantity: data.count,
        UnitAmount: (data.total_cents / data.count / 100).toFixed(2),
        AccountCode: XERO_ACCOUNT_CODES[category] || "200",
        TaxType: "OUTPUT",
        LineAmount: (data.total_cents / 100).toFixed(2),
      }));

      const xeroInvoice = {
        Type: "ACCREC",
        Contact: { Name: "Quantus Platform Revenue" },
        Date: new Date().toISOString().split("T")[0],
        DueDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
        LineAmountTypes: "Exclusive",
        LineItems: lineItems,
        Reference: `QUANTUS-${new Date().toISOString().slice(0, 7)}`,
        Status: "AUTHORISED",
      };

      // Push to Xero API
      const xeroRes = await fetch("https://api.xero.com/api.xro/2.0/Invoices", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${xeroAccessToken}`,
          "xero-tenant-id": xeroTenantId,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ Invoices: [xeroInvoice] }),
      });

      if (!xeroRes.ok) {
        const errText = await xeroRes.text();
        console.error("Xero API error:", xeroRes.status, errText);
        return new Response(JSON.stringify({ error: "Xero sync failed", details: errText }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const xeroData = await xeroRes.json();

      return new Response(JSON.stringify({
        success: true,
        synced: paidCommissions.length,
        categories: grouped,
        xero_invoice_id: xeroData.Invoices?.[0]?.InvoiceID,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACTION: get-revenue-breakdown
    if (action === "get-revenue-breakdown") {
      const start = period_start || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      
      const { data: commissions } = await sb.from("commission_logs")
        .select("category, commission_cents, status, paid_at")
        .gte("created_at", start);

      const breakdown: Record<string, { pending: number; paid: number; total: number }> = {};
      for (const c of commissions || []) {
        const cat = c.category || "general";
        if (!breakdown[cat]) breakdown[cat] = { pending: 0, paid: 0, total: 0 };
        const amt = c.commission_cents || 0;
        breakdown[cat].total += amt;
        if (c.status === "paid") breakdown[cat].paid += amt;
        else breakdown[cat].pending += amt;
      }

      return new Response(JSON.stringify({
        breakdown,
        xero_configured: !!(xeroClientId && xeroClientSecret),
        account_codes: XERO_ACCOUNT_CODES,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action. Use: sync-commissions, get-revenue-breakdown" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("xero-reconciliation error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
