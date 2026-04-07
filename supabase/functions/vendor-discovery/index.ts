import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const FIRECRAWL_BASE = "https://api.firecrawl.dev/v1";
const CREDIT_EXHAUSTED_CODE = "FIRECRAWL_CREDITS_EXHAUSTED";
const RATE_LIMITED_CODE = "FIRECRAWL_RATE_LIMITED";

type VendorSuggestion = {
  name: string;
  company: string;
  website?: string;
  location?: string;
  description?: string;
};

const parseJsonSafely = (value: string) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const normalizeVendorName = (title?: string, url?: string) => {
  const cleanedTitle = (title || "")
    .trim()
    .split(/\s[|\-–—]\s/)[0]
    ?.replace(/\b(official site|homepage|home)\b/gi, "")
    .trim();

  if (cleanedTitle && cleanedTitle.length >= 3) return cleanedTitle;

  if (url) {
    try {
      const hostname = new URL(url).hostname.replace(/^www\./, "");
      const label = hostname.split(".")[0]?.replace(/[-_]/g, " ").trim();
      if (label) {
        return label.replace(/\b\w/g, (char) => char.toUpperCase());
      }
    } catch {
      return "";
    }
  }

  return "";
};

const buildDiscoveryPayload = ({
  category,
  region,
  queryUsed,
  suggestions,
  sourceResultCount,
  code,
  warning,
}: {
  category: string;
  region?: string;
  queryUsed: string;
  suggestions: VendorSuggestion[];
  sourceResultCount: number;
  code?: string;
  warning?: string;
}) => ({
  success: !code,
  ...(code ? { code, warning } : {}),
  data: {
    category,
    region: region || "Global",
    scanned_at: new Date().toISOString(),
    query_used: queryUsed,
    source_result_count: sourceResultCount,
    suggestions,
  },
});

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

    const body = await req.json().catch(() => null);
    const category = typeof body?.category === "string" ? body.category.trim() : "";
    const region = typeof body?.region === "string" ? body.region.trim() : "";

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
    const queryUsed = `${query}${region ? ` ${region}` : ""}`.trim();

    const searchRes = await fetch(`${FIRECRAWL_BASE}/search`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${firecrawlKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: queryUsed,
        limit: 6,
      }),
    });

    const responseText = await searchRes.text();
    const searchData = parseJsonSafely(responseText);
    const upstreamError = searchData?.error || responseText || "Discovery scan failed";

    if (!searchRes.ok || searchData?.success === false) {
      console.error("Firecrawl search failed:", upstreamError);

      if (searchRes.status === 402 || /insufficient credits/i.test(upstreamError)) {
        return new Response(
          JSON.stringify(buildDiscoveryPayload({
            category,
            region: region || undefined,
            queryUsed,
            suggestions: [],
            sourceResultCount: 0,
            code: CREDIT_EXHAUSTED_CODE,
            warning: "Live vendor discovery is unavailable because scan credits are exhausted. Top up your Firecrawl credits and try again.",
          })),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (searchRes.status === 429) {
        return new Response(
          JSON.stringify(buildDiscoveryPayload({
            category,
            region: region || undefined,
            queryUsed,
            suggestions: [],
            sourceResultCount: 0,
            code: RATE_LIMITED_CODE,
            warning: "Vendor discovery is temporarily rate limited. Please try again again in a moment.",
          })),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Discovery scan failed", details: upstreamError }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = Array.isArray(searchData?.data) ? searchData.data : [];
    const seen = new Set<string>();
    const suggestions: VendorSuggestion[] = [];

    for (const result of results) {
      const website = typeof result?.url === "string" && result.url.startsWith("http")
        ? result.url
        : undefined;
      const name = normalizeVendorName(
        typeof result?.title === "string" ? result.title : undefined,
        website,
      );

      if (
        !name ||
        name.length < 3 ||
        name.length > 80 ||
        /google|search/i.test(name) ||
        (website?.includes("google.com") ?? false)
      ) {
        continue;
      }

      const key = `${name.toLowerCase()}|${website || ""}`;
      if (seen.has(key)) continue;
      seen.add(key);

      suggestions.push({
        name,
        company: name,
        website,
        location: region || undefined,
        description: typeof result?.description === "string" && result.description.trim().length > 0
          ? result.description.trim()
          : `Discovered via ${category} vendor search`,
      });

      if (suggestions.length >= 10) break;
    }

    return new Response(JSON.stringify(buildDiscoveryPayload({
      category,
      region: region || undefined,
      queryUsed,
      suggestions,
      sourceResultCount: results.length,
    })), {
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
