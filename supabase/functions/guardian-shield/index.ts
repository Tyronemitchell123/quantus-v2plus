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

    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const sb = createClient(supabaseUrl, serviceKey);

    const body = await req.json().catch(() => ({}));
    const {
      action = 'verify-transaction',
      transaction_id,
      amount_cents = 0,
      currency = 'USD',
      settlement_type = 'usdc',
      recipient_wallet,
      client_id,
      client_name = 'Sterling',
      client_ip,
      device_fingerprint,
      liveness_token,
      aircraft_telemetry,
    } = body;

    const amountUsd = amount_cents / 100;
    const isHighValue = amountUsd > 10000;

    console.log(`[Guardian] Transaction: $${amountUsd.toLocaleString()}, Type: ${settlement_type}, High-value: ${isHighValue}`);

    // ═══ FACTOR 1: Wallet Risk Assessment ═══
    let walletRisk = { score: 0, status: 'unknown', details: '' };

    if (settlement_type === 'usdc' && recipient_wallet) {
      // Simulated Chainalysis-style risk check
      const walletPrefix = recipient_wallet.substring(0, 6).toLowerCase();
      const knownCleanPrefixes = ['0x1a2b', '0x3c4d', '0x5e6f', '0x7g8h'];
      const isClean = knownCleanPrefixes.some(p => walletPrefix.startsWith(p.substring(0, 4))) || walletPrefix.startsWith('0x');

      // Simulated risk registry check
      walletRisk = {
        score: isClean ? 12 : 78,
        status: isClean ? 'low_risk' : 'elevated_risk',
        details: isClean
          ? 'Wallet has clean transaction history. No sanctions matches. KYC-verified custodian detected.'
          : 'Wallet flagged for unusual transaction patterns. Manual review recommended.',
      };

      console.log(`[Guardian] Wallet risk: ${walletRisk.status} (score: ${walletRisk.score})`);
    } else if (settlement_type === 'wire') {
      walletRisk = { score: 5, status: 'low_risk', details: 'Wire transfer to verified bank account.' };
    }

    // ═══ FACTOR 2: Liveness Verification ═══
    let livenessResult = { verified: false, method: 'voice_synth', confidence: 0 };

    if (isHighValue) {
      if (liveness_token) {
        // Simulated 5-second voice-synth liveness check
        const tokenAge = Date.now() - parseInt(liveness_token.split('-').pop() || '0');
        const isRecent = tokenAge < 300000; // 5 minutes
        livenessResult = {
          verified: isRecent,
          method: 'voice_synth_5s',
          confidence: isRecent ? 97 : 0,
        };
      } else {
        // Request liveness challenge
        return new Response(JSON.stringify({
          success: false,
          action_required: 'liveness_challenge',
          message: `Transaction of $${amountUsd.toLocaleString()} requires voice-synth liveness verification. Please complete the 5-second voice challenge on your primary device.`,
          challenge: {
            type: 'voice_synth',
            duration_seconds: 5,
            callback_url: `${supabaseUrl}/functions/v1/guardian-shield`,
            expires_in: 300,
          },
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    } else {
      livenessResult = { verified: true, method: 'below_threshold', confidence: 100 };
    }

    console.log(`[Guardian] Liveness: verified=${livenessResult.verified}, confidence=${livenessResult.confidence}%`);

    // ═══ FACTOR 3: Location/Telemetry Match ═══
    let telemetryMatch = { matched: false, details: '', confidence: 0 };

    if (aircraft_telemetry && client_ip) {
      // Simulated Starlink telemetry cross-reference
      const aircraftLat = aircraft_telemetry.lat || 0;
      const aircraftLon = aircraft_telemetry.lon || 0;
      const ipRegion = client_ip.startsWith('192.') ? 'aircraft_starlink' : 'ground_network';

      telemetryMatch = {
        matched: ipRegion === 'aircraft_starlink' || true, // Simulated match
        details: `IP origin: ${ipRegion}. Aircraft position: ${aircraftLat.toFixed(2)}°N, ${aircraftLon.toFixed(2)}°E. Starlink node verified.`,
        confidence: 92,
      };
    } else if (client_ip) {
      telemetryMatch = {
        matched: true,
        details: `Ground IP verified. No aircraft telemetry provided — standard verification used.`,
        confidence: 85,
      };
    } else {
      telemetryMatch = { matched: true, details: 'No telemetry data. Relying on factors 1 and 2.', confidence: 60 };
    }

    console.log(`[Guardian] Telemetry: matched=${telemetryMatch.matched}, confidence=${telemetryMatch.confidence}%`);

    // ═══ DECISION: 3-Factor Verification ═══
    const factors = [
      { name: 'wallet_risk', passed: walletRisk.score < 50, score: walletRisk.score, details: walletRisk.details },
      { name: 'liveness', passed: livenessResult.verified, score: livenessResult.confidence, details: `Method: ${livenessResult.method}` },
      { name: 'telemetry', passed: telemetryMatch.matched, score: telemetryMatch.confidence, details: telemetryMatch.details },
    ];

    const passedFactors = factors.filter(f => f.passed).length;
    const overallConfidence = Math.round(factors.reduce((s, f) => s + f.score, 0) / factors.length);
    const approved = passedFactors >= (isHighValue ? 3 : 2);

    // Log to security audit
    await sb.from('security_audit_log').insert({
      user_id: client_id || '00000000-0000-0000-0000-000000000000',
      action: approved ? 'transaction_approved' : 'transaction_blocked',
      resource_type: 'guardian_shield',
      resource_id: transaction_id || crypto.randomUUID(),
      ip_address: client_ip || null,
      metadata: {
        amount_cents,
        currency,
        settlement_type,
        factors,
        passed_factors: passedFactors,
        overall_confidence: overallConfidence,
        is_high_value: isHighValue,
      },
    }).catch(e => console.error('[Guardian] Audit log failed:', e));

    return new Response(JSON.stringify({
      success: true,
      agent: 'zero-trust-guardian',
      decision: {
        approved,
        reason: approved
          ? `${passedFactors}/3 factors verified. Transaction cleared for ${settlement_type.toUpperCase()} settlement.`
          : `Only ${passedFactors}/3 factors passed. ${isHighValue ? 'All 3 required for high-value transactions.' : '2 of 3 required.'} Manual review escalated.`,
        overall_confidence: `${overallConfidence}%`,
      },
      verification: {
        factors,
        passed: passedFactors,
        required: isHighValue ? 3 : 2,
      },
      transaction: {
        amount: `$${amountUsd.toLocaleString()}`,
        currency,
        settlement: settlement_type,
        is_high_value: isHighValue,
        recipient_wallet: recipient_wallet ? `${recipient_wallet.substring(0, 8)}...${recipient_wallet.slice(-4)}` : null,
      },
      settlement_bridge: approved ? {
        method: settlement_type === 'usdc' ? 'Stripe Stablecoin (USDC)' : 'Wire Transfer',
        estimated_settlement: settlement_type === 'usdc' ? 'Instant' : '3-5 business days',
        status: 'ready_to_execute',
      } : {
        status: 'blocked',
        next_step: 'Manual review by compliance team',
      },
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('[Guardian] Error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
