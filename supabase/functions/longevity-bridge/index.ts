const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');

    if (!supabaseUrl || !serviceKey) {
      return new Response(JSON.stringify({ error: 'Missing configuration' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const sb = createClient(supabaseUrl, serviceKey);

    const body = await req.json().catch(() => ({}));
    const { destination_iata, lead_name, flight_details } = body;

    if (!destination_iata) {
      return new Response(JSON.stringify({ error: 'destination_iata is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const iata = destination_iata.toUpperCase();
    console.log(`[LongevityBridge] Checking providers for IATA: ${iata}`);

    // 1. Query matching longevity providers
    const { data: providers, error: provErr } = await sb
      .from('longevity_providers')
      .select('*')
      .filter('is_active', 'eq', true)
      .filter('iata_codes', 'cs', `{${iata}}`);

    if (provErr) {
      console.error('[LongevityBridge] Provider query error:', provErr);
      throw provErr;
    }

    if (!providers || providers.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        match: false,
        message: `No longevity partners found near ${iata}`,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[LongevityBridge] Found ${providers.length} providers near ${iata}`);

    // 2. Firecrawl availability check (if key available)
    const availabilityResults: any[] = [];

    if (firecrawlKey) {
      for (const provider of providers.slice(0, 2)) {
        if (!provider.firecrawl_target_url) continue;

        try {
          console.log(`[LongevityBridge] Scanning: ${provider.clinic_name}`);
          const scrapeRes = await fetch('https://api.firecrawl.dev/v1/scrape', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${firecrawlKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              url: provider.firecrawl_target_url,
              formats: ['markdown'],
              onlyMainContent: true,
              waitFor: 3000,
            }),
          });

          const scrapeData = await scrapeRes.json();
          const markdown = scrapeData?.data?.markdown || scrapeData?.markdown || '';

          availabilityResults.push({
            clinic: provider.clinic_name,
            city: provider.city,
            has_availability_data: markdown.length > 100,
            snippet: markdown.substring(0, 300),
          });
        } catch (e) {
          console.error(`[LongevityBridge] Scrape failed for ${provider.clinic_name}:`, e);
        }
      }
    }

    // 3. Generate AI outreach draft
    const leadDisplay = lead_name || 'the client';
    const topProvider = providers[0];
    const avgPrice = (topProvider.avg_price_cents / 100).toLocaleString('en-US');
    const topSpecialty = topProvider.specialties?.[0] || 'Executive Health Assessment';
    const arrivalInfo = flight_details?.arrival_time || 'tomorrow';

    const outreachDraft = `Mr. ${leadDisplay}, since you're landing in ${topProvider.city} ${arrivalInfo}, I've flagged a rare cancellation at ${topProvider.clinic_name} for their 2026 '${topSpecialty}' on Saturday morning. This usually has a 4-month waitlist. Would you like me to bundle this into your itinerary?`;

    // 4. Calculate dual-commission
    const aviationFee = flight_details?.aviation_fee_cents || 415000;
    const longevityFee = Math.round(topProvider.avg_price_cents * 0.10);
    const totalRevenue = aviationFee + longevityFee;

    return new Response(JSON.stringify({
      success: true,
      match: true,
      destination: iata,
      providers: providers.map(p => ({
        id: p.id,
        clinic_name: p.clinic_name,
        city: p.city,
        country: p.country,
        specialties: p.specialties,
        avg_price: `$${(p.avg_price_cents / 100).toLocaleString('en-US')}`,
      })),
      availability: availabilityResults,
      outreach_draft: outreachDraft,
      commission: {
        aviation_fee_cents: aviationFee,
        longevity_fee_cents: longevityFee,
        total_revenue_cents: totalRevenue,
        aviation_fee: `$${(aviationFee / 100).toLocaleString('en-US')}`,
        longevity_fee: `$${(longevityFee / 100).toLocaleString('en-US')}`,
        total_revenue: `$${(totalRevenue / 100).toLocaleString('en-US')}`,
      },
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[LongevityBridge] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
