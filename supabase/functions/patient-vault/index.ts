import { createClient } from "https://esm.sh/@supabase/supabase-js@2.96.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } = await userClient.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub as string;

    const serviceClient = createClient(supabaseUrl, serviceRoleKey);
    const body = await req.json();
    const { operation } = body;

    // ── STORE: Create a shadow ID for a patient ──
    if (operation === "store") {
      const { real_name, contact_phone, contact_email, procedure_intent, tenant_id } = body;

      if (!real_name || !tenant_id) {
        return new Response(JSON.stringify({ error: "real_name and tenant_id required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check for existing entry by name + tenant to prevent duplicates
      const { data: existing } = await serviceClient
        .from("patient_vault")
        .select("patient_uuid")
        .eq("real_name", real_name)
        .eq("tenant_id", tenant_id)
        .maybeSingle();

      if (existing) {
        // Audit the access
        await serviceClient.from("security_audit_log").insert({
          user_id: userId,
          action: "PII_Lookup_Existing",
          resource_type: "patient_vault",
          resource_id: existing.patient_uuid,
          agent_id: "patient-vault-v1",
        });

        return new Response(
          JSON.stringify({ patient_uuid: existing.patient_uuid, is_new: false }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: newEntry, error } = await serviceClient
        .from("patient_vault")
        .insert({
          real_name,
          contact_phone: contact_phone || null,
          contact_email: contact_email || null,
          procedure_intent: procedure_intent || null,
          tenant_id,
        })
        .select("patient_uuid")
        .single();

      if (error) throw error;

      // Audit
      await serviceClient.from("security_audit_log").insert({
        user_id: userId,
        action: "PII_Store",
        resource_type: "patient_vault",
        resource_id: newEntry.patient_uuid,
        agent_id: "patient-vault-v1",
        metadata: { procedure_intent },
      });

      return new Response(
        JSON.stringify({ patient_uuid: newEntry.patient_uuid, is_new: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── RESOLVE: Get contact info at the moment of sending (just-in-time PII) ──
    if (operation === "resolve") {
      const { patient_uuid } = body;

      if (!patient_uuid) {
        return new Response(JSON.stringify({ error: "patient_uuid required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data, error } = await serviceClient
        .from("patient_vault")
        .select("contact_phone, contact_email, real_name, procedure_intent")
        .eq("patient_uuid", patient_uuid)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        return new Response(JSON.stringify({ error: "Patient not found" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Critical audit: PII was resolved
      await serviceClient.from("security_audit_log").insert({
        user_id: userId,
        action: "PII_Resolve",
        resource_type: "patient_vault",
        resource_id: patient_uuid,
        agent_id: "patient-vault-v1",
        metadata: { purpose: "outreach_send" },
      });

      return new Response(JSON.stringify({ contact: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── PSEUDONYMIZE: Return only safe fields for AI consumption ──
    if (operation === "safe_view") {
      const { patient_uuid } = body;

      if (!patient_uuid) {
        return new Response(JSON.stringify({ error: "patient_uuid required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data, error } = await serviceClient
        .from("patient_vault")
        .select("patient_uuid, procedure_intent")
        .eq("patient_uuid", patient_uuid)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        return new Response(JSON.stringify({ error: "Patient not found" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // No PII in this response - safe for AI
      return new Response(
        JSON.stringify({ patient_uuid: data.patient_uuid, procedure_intent: data.procedure_intent }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid operation. Use: store, resolve, safe_view" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Patient vault error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
