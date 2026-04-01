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
    const lovableKey = Deno.env.get('LOVABLE_API_KEY');

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
        destination: iata,
        message: `No longevity partners found near ${iata}`,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[LongevityBridge] Found ${providers.length} providers near ${iata}`);

    // 2. Firecrawl availability check
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
            snippet: markdown.substring(0, 500),
          });
        } catch (e) {
          console.error(`[LongevityBridge] Scrape failed for ${provider.clinic_name}:`, e);
        }
      }
    }

    // 3. AI-powered outreach draft via Lovable AI
    const leadDisplay = lead_name || 'the client';
    const topProvider = providers[0];
    const avgPrice = (topProvider.avg_price_cents / 100).toLocaleString('en-US');
    const topSpecialty = topProvider.specialties?.[0] || 'Executive Health Assessment';
    const arrivalInfo = flight_details?.arrival_time || 'tomorrow';
    const aircraft = flight_details?.aircraft || 'G650';
    const route = flight_details?.route || `flight to ${topProvider.city}`;

    let outreachDraft = '';

    if (lovableKey) {
      try {
        console.log('[LongevityBridge] Generating AI draft via Lovable AI');
        const aiRes = await fetch('https://ai.lovable.dev/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              {
                role: 'system',
                content: `You are the Quantus Elite Concierge — a discreet, ultra-premium personal assistant for HNW clients. You write short, elegant cross-sell messages that feel like a personal favor, never a sales pitch. You emphasize exclusivity, waitlist bypass, and time-sensitivity. Keep messages under 80 words. Never use exclamation marks. Use a warm but authoritative British English tone.`,
              },
              {
                role: 'user',
                content: `Draft a cross-sell message for Mr. ${leadDisplay}. Context:
- Confirmed ${aircraft} ${route}, arriving ${arrivalInfo}
- Destination: ${topProvider.city}, ${topProvider.country}
- Longevity partner: ${topProvider.clinic_name}
- Available programme: ${topSpecialty} (avg. $${avgPrice})
- Usually has a 4-month waitlist
- Include: full-body MRI and epigenetic age-mapping if relevant
- Mention bundling into their itinerary
${availabilityResults.length > 0 ? `- Availability data found at ${availabilityResults[0].clinic}` : ''}`,
              },
            ],
            max_tokens: 300,
            temperature: 0.7,
          }),
        });

        const aiData = await aiRes.json();
        outreachDraft = aiData?.choices?.[0]?.message?.content || '';
        console.log('[LongevityBridge] AI draft generated successfully');
      } catch (e) {
        console.error('[LongevityBridge] AI draft failed, using template:', e);
      }
    }

    // Fallback template
    if (!outreachDraft) {
      outreachDraft = `Mr. ${leadDisplay}, your ${aircraft} is confirmed for ${arrivalInfo}. Since you'll be in ${topProvider.city}, I've used the Quantus network to secure a priority diagnostic slot at ${topProvider.clinic_name} for Saturday morning — usually a 4-month wait. This includes a full-body MRI and epigenetic age-mapping. Shall I add this to your itinerary?`;
    }

    // 4. Calculate dual-commission
    const aviationFee = flight_details?.aviation_fee_cents || 415000;
    const longevityFee = Math.round(topProvider.avg_price_cents * 0.10);
    const totalRevenue = aviationFee + longevityFee;

    // Weekly throughput projection (30 seats × avg deal)
    const weeklyTarget = 6500000; // $65,000 in cents
    const currentWeeklyRun = totalRevenue * 3; // simulate 3 deals/week for this lead type

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
        avg_price_cents: p.avg_price_cents,
      })),
      availability: availabilityResults,
      outreach_draft: outreachDraft,
      ai_generated: !!lovableKey && outreachDraft !== '',
      commission: {
        aviation_fee_cents: aviationFee,
        longevity_fee_cents: longevityFee,
        total_revenue_cents: totalRevenue,
        aviation_fee: `$${(aviationFee / 100).toLocaleString('en-US')}`,
        longevity_fee: `$${(longevityFee / 100).toLocaleString('en-US')}`,
        total_revenue: `$${(totalRevenue / 100).toLocaleString('en-US')}`,
      },
      throughput: {
        weekly_target: `$${(weeklyTarget / 100).toLocaleString('en-US')}`,
        weekly_target_cents: weeklyTarget,
        current_run_rate_cents: currentWeeklyRun,
        current_run_rate: `$${(currentWeeklyRun / 100).toLocaleString('en-US')}`,
        pilot_seats: 30,
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
