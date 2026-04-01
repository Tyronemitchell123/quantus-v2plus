const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Hub prioritization for London-Swiss corridor
const HUB_CONFIG: Record<string, { priority: 'high' | 'standard' | 'excluded'; label: string; min_delta_pct?: number }> = {
  FAB: { priority: 'high', label: 'Farnborough' },
  BQH: { priority: 'high', label: 'Biggin Hill' },
  LCY: { priority: 'standard', label: 'London City' },
  STN: { priority: 'standard', label: 'Stansted' },
  LTN: { priority: 'excluded', label: 'Luton', min_delta_pct: 75 },
};

const SWISS_LONGEVITY_IATA = ['GVA', 'ZRH', 'BRN', 'LUG'];

const PARTNER_CLINICS: Record<string, string[]> = {
  GVA: ['Clinique La Prairie (Montreux)', 'Nescens (Geneva)'],
  ZRH: ['Chenot Palace (Weggis)', 'Paracelsus Recovery (Zurich)'],
  BRN: ['Inselspital Longevity Centre'],
  LUG: ['Clinica Sant\'Anna'],
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
    const { destination_iata, origin_iata, lead_name, flight_details, mode } = body;

    // Geneva Power-Play mode: scan the full London-Swiss corridor
    if (mode === 'geneva-corridor') {
      console.log('[LongevityBridge] Geneva Power-Play corridor scan initiated');

      const corridorResults: any[] = [];

      // Check each high-priority London hub
      for (const [iata, config] of Object.entries(HUB_CONFIG)) {
        if (config.priority === 'excluded') {
          console.log(`[LongevityBridge] Skipping ${config.label} (${iata}) — excluded unless delta >75%`);
          continue;
        }

        for (const dest of SWISS_LONGEVITY_IATA) {
          const clinics = PARTNER_CLINICS[dest] || [];
          corridorResults.push({
            origin: iata,
            origin_label: config.label,
            destination: dest,
            priority: config.priority,
            partner_clinics: clinics,
            clinic_count: clinics.length,
          });
        }
      }

      // Firecrawl scan for cancellation slots at top clinics
      const availabilityScans: any[] = [];
      if (firecrawlKey) {
        const { data: providers } = await sb
          .from('longevity_providers')
          .select('*')
          .filter('is_active', 'eq', true)
          .or('iata_codes.cs.{GVA},iata_codes.cs.{ZRH}');

        if (providers && providers.length > 0) {
          for (const provider of providers.slice(0, 3)) {
            if (!provider.firecrawl_target_url) continue;
            try {
              console.log(`[LongevityBridge] Scanning ${provider.clinic_name} for cancellation slots`);
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
              const md = scrapeData?.data?.markdown || scrapeData?.markdown || '';
              availabilityScans.push({
                clinic: provider.clinic_name,
                city: provider.city,
                has_slots: md.toLowerCase().includes('available') || md.toLowerCase().includes('cancellation') || md.toLowerCase().includes('opening'),
                snippet: md.substring(0, 400),
              });
            } catch (e) {
              console.error(`[LongevityBridge] Scan failed for ${provider.clinic_name}:`, e);
            }
          }
        }
      }

      // Generate executive outreach draft
      let corridorDraft = '';
      if (lovableKey) {
        try {
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
                  content: `You are the Quantus Elite Concierge. Your tone is Executive, Urgent, Bio-Aware. Write short, powerful cross-sell messages (under 60 words). British English. No exclamation marks. Mention specific aircraft, time savings, and waitlist bypass. The style should feel like a trusted advisor, not a pitch.`,
                },
                {
                  role: 'user',
                  content: `Draft a Geneva Power-Play outreach for the London-Swiss longevity corridor. Context:
- Aircraft: Praetor 600 out of Farnborough
- Destination: Weggis, Switzerland
- Clinic: Chenot Method opening this Monday
- Total travel-to-treatment: under 3 hours
- Savings: $12k in logistics, 4 months of wait-listing bypassed
- End with: "Reply 'YES' to authorize."`,
                },
              ],
              max_tokens: 200,
              temperature: 0.6,
            }),
          });
          const aiData = await aiRes.json();
          corridorDraft = aiData?.choices?.[0]?.message?.content || '';
        } catch (e) {
          console.error('[LongevityBridge] AI draft failed:', e);
        }
      }

      if (!corridorDraft) {
        corridorDraft = `I have synchronised a Praetor 600 out of Farnborough with a rare "Chenot Method" opening in Weggis for this Monday. Total travel-to-treatment time is under 3 hours. This saves $12k in logistics and 4 months of wait-listing. Reply "YES" to authorise.`;
      }

      return new Response(JSON.stringify({
        success: true,
        mode: 'geneva-corridor',
        corridor: {
          routes: corridorResults,
          total_routes: corridorResults.length,
          high_priority_hubs: Object.entries(HUB_CONFIG).filter(([, c]) => c.priority === 'high').map(([k, c]) => ({ iata: k, label: c.label })),
          excluded_hubs: Object.entries(HUB_CONFIG).filter(([, c]) => c.priority === 'excluded').map(([k, c]) => ({ iata: k, label: c.label, reason: `Delta must exceed ${c.min_delta_pct}%` })),
        },
        availability: availabilityScans,
        outreach_draft: corridorDraft,
        commission_model: {
          aviation_fee_example: '$4,150',
          longevity_fee_example: '$1,500 (10% of $15k programme)',
          total_per_interaction: '$5,650',
          weekly_target: '$65,000 across 30 pilot seats',
        },
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Standard single-destination bridge (existing logic)
    if (!destination_iata) {
      return new Response(JSON.stringify({ error: 'destination_iata is required (or use mode: "geneva-corridor")' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const iata = destination_iata.toUpperCase();
    const origin = (origin_iata || '').toUpperCase();

    // Check origin hub exclusion
    if (origin && HUB_CONFIG[origin]?.priority === 'excluded') {
      const hubConfig = HUB_CONFIG[origin];
      const delta = flight_details?.delta_pct || 0;
      if (delta < (hubConfig.min_delta_pct || 75)) {
        return new Response(JSON.stringify({
          success: true,
          match: false,
          excluded: true,
          reason: `${hubConfig.label} (${origin}) excluded — arbitrage delta ${delta}% below ${hubConfig.min_delta_pct}% threshold. 2026 infrastructure fatigue.`,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    console.log(`[LongevityBridge] Checking providers for IATA: ${iata}`);

    const { data: providers, error: provErr } = await sb
      .from('longevity_providers')
      .select('*')
      .filter('is_active', 'eq', true)
      .filter('iata_codes', 'cs', `{${iata}}`);

    if (provErr) throw provErr;

    if (!providers || providers.length === 0) {
      return new Response(JSON.stringify({
        success: true, match: false, destination: iata,
        message: `No longevity partners found near ${iata}`,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[LongevityBridge] Found ${providers.length} providers near ${iata}`);

    const availabilityResults: any[] = [];
    if (firecrawlKey) {
      for (const provider of providers.slice(0, 2)) {
        if (!provider.firecrawl_target_url) continue;
        try {
          const scrapeRes = await fetch('https://api.firecrawl.dev/v1/scrape', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${firecrawlKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: provider.firecrawl_target_url, formats: ['markdown'], onlyMainContent: true, waitFor: 3000 }),
          });
          const scrapeData = await scrapeRes.json();
          const markdown = scrapeData?.data?.markdown || scrapeData?.markdown || '';
          availabilityResults.push({
            clinic: provider.clinic_name, city: provider.city,
            has_availability_data: markdown.length > 100, snippet: markdown.substring(0, 500),
          });
        } catch (e) {
          console.error(`[LongevityBridge] Scrape failed for ${provider.clinic_name}:`, e);
        }
      }
    }

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
        const aiRes = await fetch('https://ai.lovable.dev/api/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${lovableKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: `You are the Quantus Elite Concierge — discreet, ultra-premium. Write short elegant cross-sell messages (under 80 words). British English. No exclamation marks. Executive, Urgent, Bio-Aware tone.` },
              { role: 'user', content: `Draft for Mr. ${leadDisplay}. ${aircraft} ${route}, arriving ${arrivalInfo}. Destination: ${topProvider.city}, ${topProvider.country}. Partner: ${topProvider.clinic_name}. Programme: ${topSpecialty} ($${avgPrice}). 4-month waitlist bypass. Include full-body MRI and epigenetic age-mapping.` },
            ],
            max_tokens: 300, temperature: 0.7,
          }),
        });
        const aiData = await aiRes.json();
        outreachDraft = aiData?.choices?.[0]?.message?.content || '';
      } catch (e) {
        console.error('[LongevityBridge] AI draft failed:', e);
      }
    }
    if (!outreachDraft) {
      outreachDraft = `Mr. ${leadDisplay}, your ${aircraft} is confirmed for ${arrivalInfo}. Since you'll be in ${topProvider.city}, I've secured a priority slot at ${topProvider.clinic_name} — usually a 4-month wait. Full-body MRI and epigenetic age-mapping included. Shall I add this to your itinerary?`;
    }

    const aviationFee = flight_details?.aviation_fee_cents || 415000;
    const longevityFee = Math.round(topProvider.avg_price_cents * 0.10);

    return new Response(JSON.stringify({
      success: true, match: true, destination: iata,
      origin_hub: origin ? { iata: origin, ...(HUB_CONFIG[origin] || { priority: 'standard', label: origin }) } : null,
      providers: providers.map(p => ({
        id: p.id, clinic_name: p.clinic_name, city: p.city, country: p.country,
        specialties: p.specialties, avg_price: `$${(p.avg_price_cents / 100).toLocaleString('en-US')}`,
      })),
      availability: availabilityResults,
      outreach_draft: outreachDraft,
      commission: {
        aviation_fee: `$${(aviationFee / 100).toLocaleString('en-US')}`,
        longevity_fee: `$${(longevityFee / 100).toLocaleString('en-US')}`,
        total_revenue: `$${((aviationFee + longevityFee) / 100).toLocaleString('en-US')}`,
      },
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('[LongevityBridge] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
