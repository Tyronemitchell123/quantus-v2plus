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
    const { client_id, client_name, recovery_scores, calendar_stress_index, preferred_destinations, preferred_airports, deep_sleep_scores, mental_readiness_scores, trigger_mode } = body;

    // Defaults for simulation
    const scores = recovery_scores || [35, 38, 32];
    const stressIndex = calendar_stress_index || 9;
    const destinations = preferred_destinations || ['NRT', 'BKK', 'ZRH'];
    const airports = preferred_airports || ['FAB', 'TEB'];
    const name = client_name || 'Sterling';
    const deepSleep = deep_sleep_scores || [42, 38, 35, 31]; // minutes of deep sleep over 4 days
    const mentalReadiness = mental_readiness_scores || [55, 48, 42, 38]; // 0-100 scale over 4 days

    // 1. Check bio-recovery trigger condition (original burnout)
    const avgRecovery = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
    const allBelow40 = scores.every((s: number) => s < 40);
    const burnoutTriggered = allBelow40 && scores.length >= 3 && stressIndex > 8;

    // 1b. Cognitive Fatigue trigger (Phase 11 - Pacific Vitality)
    const avgDeepSleep = deepSleep.reduce((a: number, b: number) => a + b, 0) / deepSleep.length;
    const avgMentalReadiness = mentalReadiness.reduce((a: number, b: number) => a + b, 0) / mentalReadiness.length;
    const deepSleepDeclining = deepSleep.length >= 4 && deepSleep[deepSleep.length - 1] < deepSleep[0] * 0.8;
    const mentalReadinessLow = mentalReadiness.length >= 4 && mentalReadiness.every((m: number) => m < 60);
    const cognitiveFatigueTriggered = deepSleepDeclining && mentalReadinessLow && avgMentalReadiness < 50;

    const triggered = burnoutTriggered || (trigger_mode === 'cognitive_fatigue' && cognitiveFatigueTriggered);
    const triggerType = cognitiveFatigueTriggered ? 'cognitive_fatigue' : 'burnout_risk';

    console.log(`[Vanguard] Client: ${name}, Avg Recovery: ${avgRecovery}, Stress: ${stressIndex}, Trigger: ${triggerType}, Deep Sleep Avg: ${avgDeepSleep.toFixed(0)}min, Mental Readiness Avg: ${avgMentalReadiness.toFixed(0)}, Triggered: ${triggered}`);

    if (!triggered) {
      return new Response(JSON.stringify({
        success: true,
        triggered: false,
        biometrics: {
          recovery_scores: scores, avg_recovery: avgRecovery, stress_index: stressIndex,
          deep_sleep: { scores: deepSleep, avg_minutes: Math.round(avgDeepSleep), declining: deepSleepDeclining },
          mental_readiness: { scores: mentalReadiness, avg_score: Math.round(avgMentalReadiness), all_below_60: mentalReadinessLow },
        },
        message: 'Biometric levels within acceptable range. No intervention required.',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Build escape manifest with ULR cabin altitude filtering
    const escapeManifest: any = { flights: [], clinics: [], trigger_type: triggerType };

    // ULR aircraft with cabin altitude data (Phase 11: only flag <4000ft cabin altitude)
    const ulrAircraft: Record<string, { cabin_altitude_ft: number; fresh_air: boolean }> = {
      'Global 7500': { cabin_altitude_ft: 2900, fresh_air: true },
      'G650ER': { cabin_altitude_ft: 3000, fresh_air: true },
      'G700': { cabin_altitude_ft: 2916, fresh_air: true },
      'G800': { cabin_altitude_ft: 2916, fresh_air: true },
      'Falcon 10X': { cabin_altitude_ft: 3000, fresh_air: true },
      'Challenger 350': { cabin_altitude_ft: 4850, fresh_air: false },
      'Gulfstream G650': { cabin_altitude_ft: 4100, fresh_air: false },
    };

    // Simulated flight options with cabin altitude filtering
    const allFlightOptions = [
      { route: `${airports[0]} → NRT`, aircraft: 'Global 7500', price_cents: 4200000, departure: '5 hours', duration: '11h 40m', type: 'Empty Leg' },
      { route: `${airports[0]} → BKK`, aircraft: 'G650ER', price_cents: 3800000, departure: '8 hours', duration: '10h 30m', type: 'Empty Leg' },
      { route: `${airports[1]} → ZRH`, aircraft: 'Challenger 350', price_cents: 1850000, departure: '3 hours', duration: '1h 45m', type: 'Repositioning' },
      { route: `${airports[0]} → NRT`, aircraft: 'G700', price_cents: 5300000, departure: '6 hours', duration: '11h 20m', type: 'Repositioning' },
      { route: `${airports[1]} → BKK`, aircraft: 'Falcon 10X', price_cents: 4600000, departure: '12 hours', duration: '12h 10m', type: 'Empty Leg' },
    ];

    // Filter: destinations match + cabin altitude <4000ft for Vanguard premium
    const flightOptions = allFlightOptions
      .filter(f => destinations.some(d => f.route.includes(d)))
      .map(f => {
        const spec = ulrAircraft[f.aircraft];
        return { ...f, cabin_altitude_ft: spec?.cabin_altitude_ft || 5000, fresh_air_system: spec?.fresh_air || false, vanguard_qualified: (spec?.cabin_altitude_ft || 5000) < 4000 };
      });

    escapeManifest.flights = flightOptions;

    // Simulated clinic options (Phase 11: added Neural-Reset and Green Lung protocols)
    const clinicOptions = [
      { clinic: 'Tokyo Brain Hub', city: 'Tokyo', programme: 'Neuro-Sync 48h Reset', price_cents: 1200000, availability: 'Tomorrow AM', waitlist: '3 months', protocol: 'neural-reset' },
      { clinic: 'Prevention Clinic Tokyo', city: 'Tokyo', programme: 'Epigenetic Neural-Reset', price_cents: 2800000, availability: '2 days', waitlist: '6 months', protocol: 'neural-reset' },
      { clinic: 'Samitivej Wellness', city: 'Bangkok', programme: 'Green Lung Cellular Reset', price_cents: 950000, availability: 'Day after tomorrow', waitlist: '6 weeks', protocol: 'green-lung' },
      { clinic: 'Bumrungrad Longevity', city: 'Bangkok', programme: 'Green Lung 5-Day Protocol', price_cents: 1800000, availability: '3 days', waitlist: '2 months', protocol: 'green-lung' },
      { clinic: 'Nescens Genolier', city: 'Geneva', programme: 'Brain-Reset Protocol', price_cents: 1500000, availability: 'Saturday 09:00', waitlist: '4 months', protocol: 'neural-reset' },
    ].filter(c => destinations.some(d => {
      const cityMap: Record<string, string> = { NRT: 'Tokyo', BKK: 'Bangkok', ZRH: 'Geneva' };
      return cityMap[d] === c.city;
    }));

    // For cognitive fatigue, prioritize Neural-Reset and Green Lung protocols
    if (triggerType === 'cognitive_fatigue') {
      clinicOptions.sort((a, b) => {
        const order: Record<string, number> = { 'neural-reset': 0, 'green-lung': 1 };
        return (order[a.protocol] ?? 2) - (order[b.protocol] ?? 2);
      });
    }

    escapeManifest.clinics = clinicOptions;

    // 3. Firecrawl availability scan (if available)
    if (firecrawlKey && destinations.includes('ZRH')) {
      try {
        console.log('[Vanguard] Scanning Nescens for live availability');
        const scrapeRes = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${firecrawlKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: 'https://www.nescens.com/en/clinique-de-genolier/check-up-programmes',
            formats: ['markdown'],
            onlyMainContent: true,
            waitFor: 3000,
          }),
        });
        const scrapeData = await scrapeRes.json();
        const markdown = scrapeData?.data?.markdown || '';
        if (markdown.length > 100) {
          escapeManifest.firecrawl_intel = { source: 'Nescens Genolier', data_available: true, snippet: markdown.substring(0, 400) };
        }
      } catch (e) {
        console.error('[Vanguard] Firecrawl scan failed:', e);
      }
    }

    // 4. AI outreach draft
    let outreachDraft = '';
    const topFlight = flightOptions[0];
    const topClinic = clinicOptions[0];

    if (lovableKey && topFlight && topClinic) {
      try {
        console.log('[Vanguard] Generating AI Sovereign Push notification');
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
                content: `You are the Quantus Vanguard Concierge — the highest tier of autonomous personal intelligence. You write proactive, biometric-driven travel notifications for UHNW clients. Your tone is calm, decisive, and discreetly urgent. You present pre-secured options as fait accompli. Never use exclamation marks. Keep under 90 words. British English.`,
              },
              {
                role: 'user',
                content: `Draft a 'Sovereign Push' WhatsApp for Mr. ${name}. Context:
- Biometric trend: recovery scores [${scores.join(', ')}] over 3 days (avg ${avgRecovery.toFixed(0)})
- Calendar stress index: ${stressIndex}/10 — classified as 'Burnout Risk'
- Pre-secured flight: ${topFlight.aircraft} from ${topFlight.route}, departing in ${topFlight.departure} ($${(topFlight.price_cents / 100).toLocaleString()} arbitrage)
- Pre-secured clinic: ${topClinic.programme} at ${topClinic.clinic} (${topClinic.availability}, usually ${topClinic.waitlist} waitlist)
- Private car is 20 minutes away
- Ask if they want to confirm the 'Bio-Reset' itinerary`,
              },
            ],
            max_tokens: 300,
            temperature: 0.7,
          }),
        });

        const aiData = await aiRes.json();
        outreachDraft = aiData?.choices?.[0]?.message?.content || '';
      } catch (e) {
        console.error('[Vanguard] AI draft failed:', e);
      }
    }

    if (!outreachDraft) {
      outreachDraft = `Mr. ${name}, your biometric trend shows a 'Burnout Risk' profile. I have pre-secured a ${topFlight?.aircraft || 'Global 7500'} from ${topFlight?.route || 'Farnborough to Tokyo'} departing in ${topFlight?.departure || '5 hours'} ($${topFlight ? (topFlight.price_cents / 100).toLocaleString() : '42,000'} arbitrage). I've also snagged a cancelled ${topClinic?.programme || '2-day Neuro-Sync'} slot at the ${topClinic?.clinic || 'Tokyo Brain Hub'}. Your car is 20 minutes away. Should I confirm the 'Bio-Reset' itinerary?`;
    }

    // 5. Commission calculation
    const totalAssetValue = (topFlight?.price_cents || 0) + (topClinic?.price_cents || 0);
    const successFee = Math.round(totalAssetValue * 0.05);
    const retainer = 2000000; // $20,000/mo

    return new Response(JSON.stringify({
      success: true,
      triggered: true,
      biometrics: {
        recovery_scores: scores,
        avg_recovery: Math.round(avgRecovery),
        stress_index: stressIndex,
        status: triggerType,
        deep_sleep: { scores: deepSleep, avg_minutes: Math.round(avgDeepSleep), declining: deepSleepDeclining },
        mental_readiness: { scores: mentalReadiness, avg_score: Math.round(avgMentalReadiness), all_below_60: mentalReadinessLow },
      },
      escape_manifest: escapeManifest,
      outreach_draft: outreachDraft,
      ai_generated: !!lovableKey,
      ledger: {
        retainer_cents: retainer,
        retainer: `$${(retainer / 100).toLocaleString()}`,
        total_asset_value_cents: totalAssetValue,
        total_asset_value: `$${(totalAssetValue / 100).toLocaleString()}`,
        success_fee_cents: successFee,
        success_fee: `$${(successFee / 100).toLocaleString()}`,
        total_revenue_cents: retainer + successFee,
        total_revenue: `$${((retainer + successFee) / 100).toLocaleString()}`,
      },
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[Vanguard] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
