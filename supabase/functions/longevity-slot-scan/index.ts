const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!firecrawlKey || !supabaseUrl || !serviceKey) {
      return new Response(JSON.stringify({ error: 'Missing configuration' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json().catch(() => ({}));
    const targetUrls = body.urls || [
      'https://www.fountainlife.com',
      'https://www.prenuvo.com/locations',
    ];

    const results: any[] = [];

    for (const url of targetUrls) {
      console.log(`[Longevity] Scanning: ${url}`);

      const scrapeRes = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${firecrawlKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          formats: [
            'markdown',
            {
              type: 'json',
              prompt: 'Extract any available appointment slots, cancellation openings, or last-minute availability for diagnostic services like MRI, Full-Body Scan, Cardiovascular screening, or executive health checks. Include: slot_date, slot_time, procedure_type, original_price, discounted_price (if any), location, clinic_name, availability_status.',
              schema: {
                type: 'object',
                properties: {
                  slots: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        clinic_name: { type: 'string' },
                        procedure_type: { type: 'string' },
                        slot_date: { type: 'string' },
                        slot_time: { type: 'string' },
                        original_price: { type: 'number' },
                        discounted_price: { type: 'number' },
                        location: { type: 'string' },
                        availability_status: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          ],
          onlyMainContent: true,
          waitFor: 3000,
        }),
      });

      const scrapeData = await scrapeRes.json();
      const slots = scrapeData?.data?.json?.slots || scrapeData?.json?.slots || [];

      // Filter for "perishing assets" — slots within 48 hours
      const now = new Date();
      const cutoff = new Date(now.getTime() + 48 * 60 * 60 * 1000);

      for (const slot of slots) {
        const slotDate = new Date(slot.slot_date);
        const isPerishing = slotDate <= cutoff && slotDate >= now;
        const price = slot.discounted_price || slot.original_price || 0;

        if (price >= 2000) {
          results.push({
            ...slot,
            source_url: url,
            is_perishing: isPerishing,
            value: price,
          });
        }
      }
    }

    // Store qualifying slots as leads
    if (results.length > 0) {
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
      const sb = createClient(supabaseUrl, serviceKey);

      // Get or create a system tenant for longevity leads
      let tenantId: string;
      const { data: existingTenant } = await sb
        .from('tenants')
        .select('id')
        .eq('sector', 'longevity')
        .limit(1)
        .single();

      if (existingTenant) {
        tenantId = existingTenant.id;
      } else {
        // We can't create without a user_id in this context, skip DB insert
        console.log(`[Longevity] Found ${results.length} qualifying slots but no tenant configured`);
        return new Response(JSON.stringify({
          success: true,
          slots_found: results.length,
          results,
          message: 'Slots detected. Configure a longevity tenant to auto-store.',
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    console.log(`[Longevity] Scan complete. ${results.length} qualifying slots found.`);

    return new Response(JSON.stringify({
      success: true,
      slots_found: results.length,
      results,
      scanned_at: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[Longevity] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
