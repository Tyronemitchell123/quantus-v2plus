import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const FIRECRAWL_BASE = "https://api.firecrawl.dev/v1";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Auth check
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");

    if (!firecrawlKey) {
      return new Response(
        JSON.stringify({ error: "Firecrawl API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authHeader = req.headers.get("authorization");
    const supabase = createClient(supabaseUrl, serviceKey);

    // Verify the caller is an admin
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (authError || !user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (!roleData) {
        return new Response(JSON.stringify({ error: "Admin access required" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      return new Response(JSON.stringify({ error: "No auth header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { category, region } = await req.json();
    if (!category) {
      return new Response(JSON.stringify({ error: "Category is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build a search query for the category
    const searchQueries: Record<string, string> = {
      aviation: "private jet charter broker operator AOC certified",
      medical: "private medical clinic UHNW concierge healthcare",
      staffing: "luxury yacht crew staffing private aviation crew",
      hospitality: "luxury hotel resort concierge UHNW travel",
      logistics: "luxury goods logistics high-value transport",
      marine: "superyacht broker charter management",
      legal: "private client law firm UHNW international",
      finance: "family office wealth management UHNW advisory",
      lifestyle: "luxury real estate concierge lifestyle management",
    };

    const query = searchQueries[category.toLowerCase()] || `${category} premium service provider`;
    const regionFilter = region ? ` ${region}` : "";

    // Use Firecrawl /scrape to search for vendors
    const scrapeRes = await fetch(`${FIRECRAWL_BASE}/scrape`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${firecrawlKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: `https://www.google.com/search?q=${encodeURIComponent(query + regionFilter)}`,
        formats: ["markdown"],
        actions: [{ type: "wait", milliseconds: 2000 }],
      }),
    });

    if (!scrapeRes.ok) {
      const errBody = await scrapeRes.text();
      console.error("Firecrawl scrape failed:", errBody);
      return new Response(
        JSON.stringify({ error: "Discovery scan failed", details: errBody }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const scrapeData = await scrapeRes.json();
    const markdown = scrapeData?.data?.markdown || "";

    // Use AI to extract vendor suggestions from the scraped content
    const extractionPrompt = `Extract up to 10 potential vendor/service providers from this search results page. 
For each vendor, provide: name, company, website (if found), location (if found), and a brief description.
Category: ${category}
Region: ${region || "Global"}

Return as JSON array: [{"name":"...","company":"...","website":"...","location":"...","description":"..."}]

Content:
${markdown.substring(0, 8000)}`;

    // Store the raw discovery results
    const discoveredVendors = {
      category,
      region: region || "Global",
      scanned_at: new Date().toISOString(),
      raw_markdown_length: markdown.length,
      query_used: query + regionFilter,
      suggestions: [] as Array<{ name: string; company: string; website?: string; location?: string; description?: string }>,
    };

    // Try to parse vendor names from markdown using simple patterns
    const lines = markdown.split("\n").filter((l: string) => l.trim().length > 10);
    const seen = new Set<string>();

    for (const line of lines) {
      // Look for patterns like company names with links
      const linkMatch = line.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch && !seen.has(linkMatch[1].toLowerCase())) {
        const name = linkMatch[1].trim();
        const url = linkMatch[2];
        if (
          name.length > 3 &&
          name.length < 80 &&
          !name.toLowerCase().includes("google") &&
          !name.toLowerCase().includes("search") &&
          !url.includes("google.com")
        ) {
          seen.add(name.toLowerCase());
          discoveredVendors.suggestions.push({
            name,
            company: name,
            website: url.startsWith("http") ? url : undefined,
            description: `Discovered via ${category} directory scan`,
          });
        }
      }
      if (discoveredVendors.suggestions.length >= 10) break;
    }

    return new Response(JSON.stringify({ success: true, data: discoveredVendors }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    console.error("Vendor discovery error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
