import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FIRECRAWL_BASE = "https://api.firecrawl.dev/v1";

/**
 * Auto-Scraping Cron
 * Runs weekly to discover new vendors via Firecrawl search
 * and auto-generate outreach drafts for them.
 */

const SEARCH_QUERIES = [
  { query: "private jet charter broker UK 2026", category: "aviation", region: "UK" },
  { query: "luxury property agent London Mayfair", category: "lifestyle", region: "London" },
  { query: "longevity clinic regenerative medicine Europe", category: "medical", region: "Europe" },
  { query: "ultra luxury hotel opening 2026", category: "hospitality", region: "Global" },
  { query: "superyacht charter broker Mediterranean", category: "marine", region: "Mediterranean" },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");
    const supabase = createClient(supabaseUrl, serviceKey);

    if (!firecrawlKey) {
      return new Response(
        JSON.stringify({ error: "Firecrawl API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = {
      vendors_discovered: 0,
      vendors_added: 0,
      outreach_drafts: 0,
      errors: [] as string[],
    };

    for (const searchConfig of SEARCH_QUERIES) {
      try {
        // Use Firecrawl search
        const searchRes = await fetch(`${FIRECRAWL_BASE}/search`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${firecrawlKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: searchConfig.query,
            limit: 5,
            scrapeOptions: { formats: ["markdown"] },
          }),
        });

        if (!searchRes.ok) {
          results.errors.push(`Search failed for ${searchConfig.category}: ${searchRes.status}`);
          continue;
        }

        const searchData = await searchRes.json();
        const searchResults = searchData?.data || [];

        for (const result of searchResults) {
          results.vendors_discovered++;
          const url = result.url || "";
          const title = result.title || "";
          const markdown = (result.markdown || "").substring(0, 2000);

          if (!url || !title || title.length < 3) continue;

          // Extract domain for email
          let domain = "";
          try {
            domain = new URL(url).hostname.replace("www.", "");
          } catch { continue; }

          // Check if vendor already exists
          const { data: existing } = await supabase
            .from("vendors")
            .select("id")
            .or(`website.ilike.%${domain}%,name.ilike.%${title.substring(0, 20)}%`)
            .limit(1)
            .maybeSingle();

          if (existing) continue;

          // Extract contact info
          const emailMatch = markdown.match(/[\w.+-]+@[\w-]+\.[\w.]+/);
          const phoneMatch = markdown.match(/\+?\d[\d\s\-().]{8,}/);

          // Insert vendor
          const { data: vendorRow, error: insertErr } = await supabase
            .from("vendors")
            .insert({
              name: title.substring(0, 100),
              company: title.substring(0, 100),
              email: emailMatch?.[0] || `info@${domain}`,
              phone: phoneMatch?.[0]?.trim() || null,
              category: searchConfig.category,
              description: markdown.substring(0, 300),
              location: searchConfig.region,
              website: url,
              tier: "standard",
              is_active: true,
              is_verified: false,
              metadata: {
                source: "auto_scrape_cron",
                scraped_at: new Date().toISOString(),
                search_query: searchConfig.query,
              },
            })
            .select("id, name, email")
            .single();

          if (insertErr) {
            results.errors.push(`Insert ${title}: ${insertErr.message}`);
            continue;
          }

          results.vendors_added++;

          // Auto-generate outreach draft
          const outreachDraft = `Dear ${title} Team,\n\nI'm reaching out from Quantus — a premium deal orchestration platform connecting UHNW clients with best-in-class service providers.\n\nWe've identified your ${searchConfig.category} services as a strong fit for our client base. Our platform handles deal sourcing, negotiation, and completion with full commission automation.\n\nWould you be open to a brief conversation about partnership opportunities?\n\nBest regards,\nQuantus Concierge`;

          // Check for vendor_outreach table
          await supabase.from("vendor_outreach").insert({
            vendor_id: vendorRow.id,
            vendor_name: vendorRow.name,
            vendor_email: vendorRow.email,
            deal_id: null,
            status: "draft",
            outreach_type: "partnership",
            message_draft: outreachDraft,
            metadata: { auto_generated: true, category: searchConfig.category },
          }).then(() => {
            results.outreach_drafts++;
          }).catch(() => {
            // vendor_outreach table may not exist; skip
          });
        }
      } catch (searchErr) {
        results.errors.push(`${searchConfig.category}: ${searchErr instanceof Error ? searchErr.message : "unknown"}`);
      }
    }

    // Log to system health
    await supabase.from("system_health").insert({
      function_name: "auto-scrape-vendors",
      event_type: "cron_run",
      severity: results.errors.length > 0 ? "warning" : "info",
      metadata: results,
    });

    console.log("Auto-scrape results:", JSON.stringify(results));

    return new Response(JSON.stringify({ success: true, ...results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    console.error("Auto-scrape error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
