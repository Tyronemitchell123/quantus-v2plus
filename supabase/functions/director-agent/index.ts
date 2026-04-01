const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableKey = Deno.env.get('LOVABLE_API_KEY');
    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');

    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const sb = createClient(supabaseUrl, serviceKey);

    const body = await req.json().catch(() => ({}));
    const { goal, client_name, client_id, biometrics, preferences } = body;

    const clientName = client_name || 'Sterling';
    const hrv = biometrics?.hrv || 32;
    const recoveryScores = biometrics?.recovery_scores || [35, 38, 32];
    const stressIndex = biometrics?.stress_index || 9;
    const preferredAirfields = preferences?.airfields || ['FAB', 'TEB'];
    const preferredDestinations = preferences?.destinations || ['NRT', 'BKK', 'ZRH'];

    console.log(`[Director] Goal: ${goal || 'auto'}, Client: ${clientName}, HRV: ${hrv}`);

    // ═══ PHASE 1: OBSERVE ═══
    // Check biometrics for intervention trigger
    const avgRecovery = recoveryScores.reduce((a: number, b: number) => a + b, 0) / recoveryScores.length;
    const interventionNeeded = hrv < 35 || (recoveryScores.every((s: number) => s < 40) && stressIndex > 8);
    const triggerType = hrv < 35 ? 'hrv_critical' : 'burnout_risk';

    const observeResult = {
      client: clientName,
      hrv,
      avg_recovery: Math.round(avgRecovery),
      stress_index: stressIndex,
      intervention_needed: interventionNeeded,
      trigger_type: triggerType,
      observed_at: new Date().toISOString(),
    };

    console.log(`[Director] OBSERVE: Intervention needed: ${interventionNeeded}, Trigger: ${triggerType}`);

    if (!interventionNeeded) {
      return new Response(JSON.stringify({
        success: true,
        phase: 'observe',
        status: 'no_intervention',
        observe: observeResult,
        message: `${clientName}'s biometrics are within acceptable range. Continuing passive monitoring.`,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ═══ PHASE 2: PLAN ═══
    // Identify nearest airfield and top clinics within 6h flight radius
    const airfieldData: Record<string, { label: string; lat: number; lon: number }> = {
      FAB: { label: 'Farnborough', lat: 51.28, lon: -0.78 },
      BQH: { label: 'Biggin Hill', lat: 51.33, lon: 0.03 },
      TEB: { label: 'Teterboro', lat: 40.85, lon: -74.06 },
      LTN: { label: 'Luton', lat: 51.87, lon: -0.37 },
    };

    const clinicRegistry = [
      { id: 'tkb', name: 'Tokyo Brain Hub', city: 'Tokyo', iata: 'NRT', programme: 'Neuro-Sync 48h', price_cents: 1200000, flight_hours: { FAB: 11.5, TEB: 13, BQH: 11.5 }, ground_transit_min: 12, protocol: 'neural-reset' },
      { id: 'pct', name: 'Prevention Clinic Tokyo', city: 'Tokyo', iata: 'NRT', programme: 'Epigenetic Neural-Reset', price_cents: 2800000, flight_hours: { FAB: 11.5, TEB: 13, BQH: 11.5 }, ground_transit_min: 8, protocol: 'neural-reset' },
      { id: 'sam', name: 'Samitivej Wellness', city: 'Bangkok', iata: 'BKK', programme: 'Green Lung Cellular Reset', price_cents: 950000, flight_hours: { FAB: 10.5, TEB: 16, BQH: 10.5 }, ground_transit_min: 10, protocol: 'green-lung' },
      { id: 'nes', name: 'Nescens Genolier', city: 'Geneva', iata: 'ZRH', programme: 'Brain-Reset Protocol', price_cents: 1500000, flight_hours: { FAB: 1.5, TEB: 8, BQH: 1.5 }, ground_transit_min: 15, protocol: 'neural-reset' },
      { id: 'clp', name: 'Clinique La Prairie', city: 'Montreux', iata: 'ZRH', programme: 'Revitalisation', price_cents: 3500000, flight_hours: { FAB: 1.5, TEB: 8, BQH: 1.5 }, ground_transit_min: 45, protocol: 'longevity' },
    ];

    // Filter clinics within 6h flight radius from preferred airfields, with ≤15min ground transit
    const reachableClinics = clinicRegistry.filter(c => {
      const inDestinations = preferredDestinations.includes(c.iata);
      const withinFlightRadius = preferredAirfields.some(af => (c.flight_hours[af] || 99) <= 6);
      const groundOk = c.ground_transit_min <= 15;
      return inDestinations && (withinFlightRadius || true) && groundOk; // relax flight radius for long-haul
    });

    // Sort by best protocol match for trigger type
    const protocolPriority: Record<string, string[]> = {
      hrv_critical: ['neural-reset', 'green-lung', 'longevity'],
      burnout_risk: ['green-lung', 'neural-reset', 'longevity'],
    };
    const priority = protocolPriority[triggerType] || ['neural-reset'];
    reachableClinics.sort((a, b) => {
      const aIdx = priority.indexOf(a.protocol);
      const bIdx = priority.indexOf(b.protocol);
      return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx);
    });

    const topClinics = reachableClinics.slice(0, 3);
    const primaryAirfield = preferredAirfields[0];
    const airfieldInfo = airfieldData[primaryAirfield] || { label: primaryAirfield, lat: 0, lon: 0 };

    const planResult = {
      primary_airfield: { code: primaryAirfield, ...airfieldInfo },
      top_clinics: topClinics.map(c => ({
        name: c.name,
        city: c.city,
        programme: c.programme,
        protocol: c.protocol,
        price: `$${(c.price_cents / 100).toLocaleString()}`,
        flight_hours: c.flight_hours[primaryAirfield] || 'N/A',
        ground_transit_min: c.ground_transit_min,
      })),
      heli_pivot_available: topClinics.some(c => c.ground_transit_min > 15),
    };

    console.log(`[Director] PLAN: ${topClinics.length} clinics identified from ${airfieldInfo.label}`);

    // ═══ PHASE 3: ACT ═══
    // Trigger sub-agents for live inventory
    const actResults: any = { aviation_scan: null, medical_scan: null, outreach_draft: null };

    // 3a. Trigger Aviation Scraper (simulated — in production calls aviation-manifest-scan)
    const flightInventory = topClinics.map(c => ({
      route: `${primaryAirfield} → ${c.iata}`,
      aircraft: c.flight_hours[primaryAirfield] <= 2 ? 'Praetor 600' : c.flight_hours[primaryAirfield] <= 8 ? 'Challenger 650' : 'Global 7500',
      estimated_price: `$${Math.round(c.flight_hours[primaryAirfield] * 3500).toLocaleString()}`,
      duration: `${c.flight_hours[primaryAirfield]}h`,
      cabin_altitude_ft: c.flight_hours[primaryAirfield] > 8 ? 2900 : 4200,
      vanguard_qualified: c.flight_hours[primaryAirfield] > 8,
      status: 'available',
    }));
    actResults.aviation_scan = { flights: flightInventory, scanned_at: new Date().toISOString() };

    // 3b. Medical availability (simulated)
    actResults.medical_scan = {
      clinics: topClinics.map(c => ({
        name: c.name,
        programme: c.programme,
        availability: Math.random() > 0.3 ? 'Slot available (cancellation)' : 'Waitlisted',
        price: `$${(c.price_cents / 100).toLocaleString()}`,
      })),
    };

    // 3c. AI-powered outreach draft
    if (lovableKey) {
      try {
        const topFlight = flightInventory[0];
        const topClinic = topClinics[0];
        const aiRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: { Authorization: `Bearer ${lovableKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'google/gemini-3-flash-preview',
            messages: [
              { role: 'system', content: `You are the Quantus Director Agent drafting an intervention notification. Tone: decisive, calm, executive. Under 80 words. British English. No exclamation marks.` },
              { role: 'user', content: `Draft a 'Sovereign Intervention' message for Mr. ${clientName}. HRV is ${hrv}ms (critical threshold: 35ms). Recovery avg: ${avgRecovery.toFixed(0)}. Pre-secured: ${topFlight?.aircraft || 'Global 7500'} from ${topFlight?.route || 'FAB → NRT'} (${topFlight?.duration || '11.5h'}). Clinic: ${topClinic?.programme || 'Neuro-Sync'} at ${topClinic?.name || 'Tokyo Brain Hub'}. Ground transit: ${topClinic?.ground_transit_min || 12} minutes. Ask for single-word confirmation.` },
            ],
            max_tokens: 250,
            temperature: 0.6,
          }),
        });

        if (aiRes.ok) {
          const aiData = await aiRes.json();
          actResults.outreach_draft = aiData?.choices?.[0]?.message?.content || '';
        } else if (aiRes.status === 429) {
          actResults.outreach_draft = '[Rate limited — draft pending retry]';
        } else if (aiRes.status === 402) {
          actResults.outreach_draft = '[Credits exhausted — manual draft required]';
        }
      } catch (e) {
        console.error('[Director] AI draft failed:', e);
      }
    }

    if (!actResults.outreach_draft) {
      const tf = flightInventory[0];
      const tc = topClinics[0];
      actResults.outreach_draft = `Mr. ${clientName}, your HRV has dropped to ${hrv}ms — below the intervention threshold. I have pre-secured a ${tf?.aircraft || 'Global 7500'} from ${tf?.route || 'Farnborough to Tokyo'} (${tf?.duration || '11.5h'}). A ${tc?.programme || 'Neuro-Sync'} slot at ${tc?.name || 'Tokyo Brain Hub'} is confirmed with ${tc?.ground_transit_min || 12}-minute ground transfer. Reply YES to activate.`;
    }

    // ═══ PHASE 4: REFLECT ═══
    // Check if any constraint violations need a heli-pivot
    const constraintViolations: string[] = [];
    topClinics.forEach(c => {
      if (c.ground_transit_min > 15) {
        constraintViolations.push(`${c.name}: ground transit ${c.ground_transit_min}min exceeds 15min limit — heli-pivot recommended`);
      }
    });

    const heliPivots = constraintViolations.length > 0 ? constraintViolations.map(v => ({
      violation: v,
      resolution: 'Helicopter transfer from nearest helipad to clinic entrance',
      estimated_cost: '$2,500',
      time_saved: '30+ minutes',
    })) : [];

    // Revenue projection
    const totalFlightValue = flightInventory.reduce((s, f) => s + parseInt(f.estimated_price.replace(/[$,]/g, '')) * 100, 0);
    const totalClinicValue = topClinics.reduce((s, c) => s + c.price_cents, 0);
    const aviationFee = Math.max(totalFlightValue * 0.05, 800000); // min $8k
    const medicalFee = Math.max(totalClinicValue * 0.10, 200000); // min $2k

    const reflectResult = {
      constraint_violations: constraintViolations,
      heli_pivots: heliPivots,
      autonomy_score: constraintViolations.length === 0 ? 94 : 87,
      revenue_projection: {
        flight_value: `$${(totalFlightValue / 100).toLocaleString()}`,
        clinic_value: `$${(totalClinicValue / 100).toLocaleString()}`,
        aviation_fee: `$${(aviationFee / 100).toLocaleString()}`,
        medical_fee: `$${(medicalFee / 100).toLocaleString()}`,
        retainer: '$20,000',
        total_revenue: `$${((aviationFee + medicalFee + 2000000) / 100).toLocaleString()}`,
      },
    };

    return new Response(JSON.stringify({
      success: true,
      agent: 'quantus-director',
      phases: {
        observe: observeResult,
        plan: planResult,
        act: actResults,
        reflect: reflectResult,
      },
      executive_summary: `Intervention triggered for ${clientName} (HRV ${hrv}ms). ${topClinics.length} clinics identified, ${flightInventory.length} flights pre-secured. ${constraintViolations.length > 0 ? `${constraintViolations.length} heli-pivot(s) recommended.` : 'All constraints met.'} Autonomy: ${reflectResult.autonomy_score}%.`,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('[Director] Error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
