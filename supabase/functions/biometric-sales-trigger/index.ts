const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const lovableKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableKey) {
      return new Response(JSON.stringify({ error: 'LOVABLE_API_KEY not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json().catch(() => ({}));
    const {
      client_name = 'Sterling',
      alert_type = 'Acute_Fatigue',
      hrv_deficit_pct = 34,
      hrv_current = 32,
      timezone = 'America/New_York',
      recovery_scores = [35, 38, 32],
      deep_sleep_avg = 31,
      preferred_protocol,
    } = body;

    console.log(`[BiometricSales] Client: ${client_name}, Alert: ${alert_type}, HRV Deficit: ${hrv_deficit_pct}%`);

    // Determine protocol based on timezone and alert type
    const isAsiaTimezone = timezone.includes('Asia') || timezone.includes('Japan') || timezone.includes('Tokyo');
    const isEuropeTimezone = timezone.includes('Europe') || timezone.includes('London') || timezone.includes('Zurich');

    let selectedProtocol: { name: string; clinic: string; city: string; programme: string; flight: string; savings: string };

    if (preferred_protocol === 'tokyo' || (!preferred_protocol && isAsiaTimezone)) {
      selectedProtocol = {
        name: 'Tokyo Neural-Reset',
        clinic: 'MUSE Cell Tokyo',
        city: 'Tokyo',
        programme: 'Epigenetic Neural-Sync (48h)',
        flight: 'G650ER from Teterboro',
        savings: '$53,000',
      };
    } else if (preferred_protocol === 'swiss' || (!preferred_protocol && isEuropeTimezone)) {
      selectedProtocol = {
        name: 'Swiss Detox',
        clinic: 'Nescens Genolier',
        city: 'Geneva',
        programme: 'Chenot Method Brain-Reset',
        flight: 'Praetor 600 from Farnborough',
        savings: '$12,000',
      };
    } else {
      // Default: match based on HRV severity
      selectedProtocol = hrv_deficit_pct > 30 ? {
        name: 'Tokyo Neural-Reset',
        clinic: 'Prevention Clinic Tokyo',
        city: 'Tokyo',
        programme: "Don't Die Protocol",
        flight: 'Global 7500 from Teterboro',
        savings: '$53,000',
      } : {
        name: 'Bangkok Green Lung',
        clinic: 'Bumrungrad Longevity',
        city: 'Bangkok',
        programme: 'Green Lung 5-Day Protocol',
        flight: 'G650ER from Farnborough',
        savings: '$18,000',
      };
    }

    // Generate AI-powered personalized Signal message
    const aiRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${lovableKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          {
            role: 'system',
            content: `You are the Peak Performance Liaison for Quantus V2+.
Trigger Condition: Biometric_Alert == '${alert_type}'.
Draft an ultra-personalized Signal message.

Content Requirements:
- Reference the specific metric: '${hrv_deficit_pct}% HRV deficit' (current HRV: ${hrv_current}ms).
- Match with the '${selectedProtocol.name}' (${selectedProtocol.clinic}) based on client timezone (${timezone}).
- Deep sleep average: ${deep_sleep_avg} minutes (declining over 4 days).
- Tone: grounded, supportive, authoritative. No exclamation marks.
- Call to Action: Must be a one-word confirmation ('YES' or 'HELI') to trigger Stripe Phase 10 billing.
- Under 85 words. British English.`,
          },
          {
            role: 'user',
            content: `Draft the biometric intervention message for Mr. ${client_name}.

Pre-secured assets:
- Flight: ${selectedProtocol.flight} (${selectedProtocol.savings} arbitrage saving)
- Clinic: ${selectedProtocol.programme} at ${selectedProtocol.clinic}, ${selectedProtocol.city}
- Recovery trend: ${recovery_scores.join(', ')} over 3 days
- Private car: 20 minutes from current location
- Billing: $20k retainer + success fee will auto-trigger on 'YES'`,
          },
        ],
        max_tokens: 300,
        temperature: 0.65,
      }),
    });

    let outreachMessage = '';
    let aiGenerated = false;

    if (aiRes.ok) {
      const aiData = await aiRes.json();
      outreachMessage = aiData?.choices?.[0]?.message?.content || '';
      aiGenerated = true;
    } else if (aiRes.status === 429) {
      console.warn('[BiometricSales] Rate limited');
    } else if (aiRes.status === 402) {
      console.warn('[BiometricSales] Credits exhausted');
    }

    // Fallback template
    if (!outreachMessage) {
      outreachMessage = `Mr. ${client_name}, your biometric data shows a ${hrv_deficit_pct}% HRV deficit (${hrv_current}ms). Deep sleep has declined to ${deep_sleep_avg} minutes over four days. I have pre-secured a ${selectedProtocol.flight} with ${selectedProtocol.savings} in arbitrage savings, paired with a rare ${selectedProtocol.programme} slot at ${selectedProtocol.clinic}. Your car is 20 minutes away. Reply YES to activate the ${selectedProtocol.name} itinerary.`;
    }

    // Revenue calculation
    const flightValueCents = selectedProtocol.name.includes('Tokyo') ? 5300000 : selectedProtocol.name.includes('Swiss') ? 1850000 : 3800000;
    const clinicValueCents = selectedProtocol.name.includes('Tokyo') ? 2800000 : selectedProtocol.name.includes('Swiss') ? 1500000 : 1800000;
    const aviationFee = Math.max(Math.round(flightValueCents * 0.05), 800000);
    const medicalFee = Math.max(Math.round(clinicValueCents * 0.10), 200000);

    return new Response(JSON.stringify({
      success: true,
      agent: 'peak-performance-liaison',
      alert: {
        type: alert_type,
        hrv_current: hrv_current,
        hrv_deficit_pct,
        deep_sleep_avg,
        recovery_scores,
      },
      protocol: selectedProtocol,
      outreach_message: outreachMessage,
      ai_generated: aiGenerated,
      billing_trigger: {
        confirmation_word: 'YES',
        retainer: '$20,000/mo',
        aviation_fee: `$${(aviationFee / 100).toLocaleString()}`,
        medical_fee: `$${(medicalFee / 100).toLocaleString()}`,
        total_transaction: `$${((aviationFee + medicalFee) / 100).toLocaleString()}`,
        stripe_action: 'trigger-success-fee',
      },
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('[BiometricSales] Error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
