import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const FIRECRAWL_BASE = "https://api.firecrawl.dev/v1";

interface VendorTarget {
  url: string;
  name: string;
  category: string;
  location: string;
  description: string;
  tier: string;
}

const VENDOR_TARGETS: VendorTarget[] = [
  // Private Aviation
  {
    url: "https://www.privatefly.com",
    name: "PrivateFly",
    category: "aviation",
    location: "London, UK",
    description: "Private jet charter broker with global fleet access and empty leg deals",
    tier: "premium",
  },
  {
    url: "https://www.vistajet.com",
    name: "VistaJet",
    category: "aviation",
    location: "London, UK",
    description: "Global business aviation company with a fleet of silver and red long-range jets",
    tier: "premium",
  },
  {
    url: "https://www.flyxo.com",
    name: "XO (Vista Global)",
    category: "aviation",
    location: "New York, USA",
    description: "On-demand private aviation marketplace with crowdsourced and dedicated flights",
    tier: "premium",
  },
  {
    url: "https://www.aircharter.com",
    name: "Air Charter Service",
    category: "aviation",
    location: "London, UK",
    description: "World-leading aircraft charter broker for private, cargo, and group charter",
    tier: "premium",
  },
  // Luxury Real Estate
  {
    url: "https://www.knightfrank.com",
    name: "Knight Frank",
    category: "lifestyle",
    location: "London, UK",
    description: "Global property consultancy specialising in prime residential and commercial real estate",
    tier: "premium",
  },
  {
    url: "https://www.savills.com",
    name: "Savills",
    category: "lifestyle",
    location: "London, UK",
    description: "Global real estate services provider with expertise in residential and commercial property",
    tier: "premium",
  },
  {
    url: "https://www.sothebysrealty.com",
    name: "Sotheby's International Realty",
    category: "lifestyle",
    location: "New York, USA",
    description: "Luxury real estate brand offering fine homes and estates worldwide",
    tier: "premium",
  },
  // Medical / Longevity
  {
    url: "https://www.lanserhof.com",
    name: "Lanserhof",
    category: "medical",
    location: "Tegernsee, Germany",
    description: "Premium health resort specialising in LANS Med Concept for regeneration and longevity",
    tier: "premium",
  },
  {
    url: "https://www.shawellnessclinic.com",
    name: "SHA Wellness Clinic",
    category: "medical",
    location: "Alicante, Spain",
    description: "Integrative wellness clinic combining Eastern and Western medicine for longevity",
    tier: "premium",
  },
  {
    url: "https://www.bfrg.co.uk",
    name: "BFRG (British Functional & Regenerative Group)",
    category: "medical",
    location: "London, UK",
    description: "Functional medicine and regenerative health clinic for preventive longevity care",
    tier: "premium",
  },
  // Luxury Hospitality
  {
    url: "https://www.aman.com",
    name: "Aman Resorts",
    category: "hospitality",
    location: "Global",
    description: "Ultra-luxury hotel and resort group known for minimalist design and holistic wellness",
    tier: "premium",
  },
  {
    url: "https://www.fourseasons.com",
    name: "Four Seasons Hotels & Resorts",
    category: "hospitality",
    location: "Global",
    description: "Luxury hotel chain with world-class concierge services and bespoke guest experiences",
    tier: "premium",
  },
  {
    url: "https://www.rosewoodhotels.com",
    name: "Rosewood Hotels & Resorts",
    category: "hospitality",
    location: "Global",
    description: "Ultra-luxury hotel group with distinctive A Sense of Place philosophy",
    tier: "premium",
  },
  {
    url: "https://www.mandarinoriental.com",
    name: "Mandarin Oriental",
    category: "hospitality",
    location: "Global",
    description: "Luxury hotel group renowned for service excellence and award-winning spas",
    tier: "premium",
  },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");

    if (!firecrawlKey) {
      return new Response(
        JSON.stringify({ error: "Firecrawl API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // Auth check
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No auth header" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const verticals = body.verticals || ["aviation", "lifestyle", "medical", "hospitality"];
    const createDeals = body.createDeals !== false;

    const targets = VENDOR_TARGETS.filter((t) => verticals.includes(t.category));

    const results: Array<{
      vendor: string;
      status: string;
      scraped: boolean;
      vendorId?: string;
      dealId?: string;
      error?: string;
    }> = [];

    for (const target of targets) {
      try {
        console.log(`Scraping ${target.name} at ${target.url}...`);

        // Check if vendor already exists
        const { data: existing } = await supabase
          .from("vendors")
          .select("id")
          .ilike("name", `%${target.name.split(" ")[0]}%`)
          .limit(1)
          .maybeSingle();

        let scrapedData: { contactEmail?: string; phone?: string; extra?: string } = {};

        // Scrape the real website for contact/pricing info
        try {
          const scrapeRes = await fetch(`${FIRECRAWL_BASE}/scrape`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${firecrawlKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              url: target.url,
              formats: ["markdown"],
              onlyMainContent: true,
            }),
          });

          if (scrapeRes.ok) {
            const data = await scrapeRes.json();
            const md = (data?.data?.markdown || data?.markdown || "").substring(0, 4000);
            
            // Extract contact info from scraped content
            const emailMatch = md.match(/[\w.+-]+@[\w-]+\.[\w.]+/);
            const phoneMatch = md.match(/\+?\d[\d\s\-().]{8,}/);
            
            scrapedData = {
              contactEmail: emailMatch?.[0],
              phone: phoneMatch?.[0]?.trim(),
              extra: md.substring(0, 500),
            };
            console.log(`  Scraped ${target.name}: email=${scrapedData.contactEmail || 'none'}`);
          } else {
            console.warn(`  Scrape failed for ${target.name}: ${scrapeRes.status}`);
          }
        } catch (scrapeErr) {
          console.warn(`  Scrape error for ${target.name}:`, scrapeErr);
        }

        let vendorId = existing?.id;

        if (!vendorId) {
          // Insert new vendor
          const { data: vendorRow, error: insertErr } = await supabase
            .from("vendors")
            .insert({
              name: target.name,
              company: target.name,
              email: scrapedData.contactEmail || `enquiries@${new URL(target.url).hostname.replace("www.", "")}`,
              phone: scrapedData.phone || null,
              category: target.category,
              description: target.description,
              location: target.location,
              website: target.url,
              tier: target.tier,
              is_active: true,
              is_verified: true,
              
              metadata: {
                source: "firecrawl_discovery",
                scraped_at: new Date().toISOString(),
                scraped_content_preview: scrapedData.extra?.substring(0, 200),
              },
            })
            .select("id")
            .single();

          if (insertErr) {
            console.error(`  Insert error for ${target.name}:`, insertErr);
            results.push({ vendor: target.name, status: "insert_failed", scraped: !!scrapedData.extra, error: insertErr.message });
            continue;
          }
          vendorId = vendorRow.id;
        }

        let dealId: string | undefined;

        // Create a deal for this vendor
        if (createDeals && vendorId) {
          const budgetRanges: Record<string, [number, number]> = {
            aviation: [40000, 200000],
            lifestyle: [500000, 5000000],
            medical: [10000, 80000],
            hospitality: [5000, 50000],
          };
          const [minBudget, maxBudget] = budgetRanges[target.category] || [10000, 100000];
          const budget = minBudget + Math.floor(Math.random() * (maxBudget - minBudget));

          const dealIntents: Record<string, string[]> = {
            aviation: [
              "Charter a Bombardier Global 7500 London to Dubai for 6 pax next week",
              "Empty leg opportunity LHR-NCE, need competitive pricing from operators",
              "Annual charter contract for quarterly board travel, 12 flights/year",
            ],
            lifestyle: [
              "Acquire prime penthouse in Knightsbridge or Belgravia, budget £3-5M",
              "Source trophy property in Monaco for UHNW client relocating from London",
              "Prime vineyard estate in Tuscany with hospitality conversion potential",
            ],
            medical: [
              "Comprehensive longevity assessment with NAD+ therapy and full blood panel",
              "Executive health screening programme for C-suite team of 8",
              "Regenerative stem cell therapy consultation and treatment package",
            ],
            hospitality: [
              "Private island buyout in Maldives for anniversary celebration, 12 guests",
              "Bespoke 2-week wellness retreat itinerary across Southeast Asia",
              "VIP concierge arrangement for Monaco Grand Prix weekend hospitality",
            ],
          };

          const intents = dealIntents[target.category] || ["Premium service engagement"];
          const intent = intents[Math.floor(Math.random() * intents.length)];

          const { data: dealRow, error: dealErr } = await supabase
            .from("deals")
            .insert({
              user_id: user.id,
              raw_input: intent,
              intent,
              category: target.category as any,
              status: "sourcing",
              budget_min: minBudget,
              budget_max: maxBudget,
              budget_currency: "GBP",
              deal_value_estimate: budget,
              location: target.location,
              input_channel: "firecrawl_discovery",
              priority_score: 80 + Math.floor(Math.random() * 20),
              probability_score: 70 + Math.floor(Math.random() * 25),
              complexity_score: 50 + Math.floor(Math.random() * 40),
            })
            .select("id, deal_number")
            .single();

          if (dealErr) {
            console.error(`  Deal creation error for ${target.name}:`, dealErr);
          } else {
            dealId = dealRow.id;
            console.log(`  Created deal ${dealRow.deal_number} for ${target.name}`);

            // Create a sourcing result linking vendor to deal
            await supabase.from("sourcing_results").insert({
              deal_id: dealId,
              user_id: user.id,
              name: target.name,
              category: target.category,
              description: target.description,
              overall_score: 85 + Math.floor(Math.random() * 15),
              tier: target.tier,
              location: target.location,
              estimated_cost: budget,
              cost_currency: "GBP",
              availability: "available",
              risk_level: "low",
              recommended_next_step: "Send formal enquiry and request proposal",
              vendor_contact: {
                company: target.name,
                email: scrapedData.contactEmail || `enquiries@${new URL(target.url).hostname.replace("www.", "")}`,
                website: target.url,
                phone: scrapedData.phone,
              },
              pros: JSON.stringify(["Verified real vendor", "Scraped from live website", "Industry leader"]),
              cons: JSON.stringify(["Pricing requires direct negotiation"]),
            });
          }
        }

        results.push({
          vendor: target.name,
          status: existing ? "already_exists" : "created",
          scraped: !!scrapedData.extra,
          vendorId,
          dealId,
        });
      } catch (vendorErr) {
        console.error(`Error processing ${target.name}:`, vendorErr);
        results.push({
          vendor: target.name,
          status: "error",
          scraped: false,
          error: vendorErr instanceof Error ? vendorErr.message : "Unknown error",
        });
      }
    }

    const summary = {
      total: results.length,
      created: results.filter((r) => r.status === "created").length,
      existing: results.filter((r) => r.status === "already_exists").length,
      scraped: results.filter((r) => r.scraped).length,
      deals_created: results.filter((r) => r.dealId).length,
      errors: results.filter((r) => r.status === "error" || r.status === "insert_failed").length,
    };

    return new Response(
      JSON.stringify({ success: true, summary, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    console.error("Discovery error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
