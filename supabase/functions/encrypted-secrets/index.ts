import { createClient } from "https://esm.sh/@supabase/supabase-js@2.96.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// AES-256-GCM encryption using Web Crypto API
async function getEncryptionKey(): Promise<CryptoKey> {
  const secret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret.slice(0, 32)),
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
  return keyMaterial;
}

async function encrypt(plaintext: string): Promise<{ ciphertext: string; iv: string }> {
  const key = await getEncryptionKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);
  return {
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    iv: btoa(String.fromCharCode(...iv)),
  };
}

async function decrypt(ciphertext: string, iv: string): Promise<string> {
  const key = await getEncryptionKey();
  const ivBytes = Uint8Array.from(atob(iv), (c) => c.charCodeAt(0));
  const cipherBytes = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0));
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: ivBytes }, key, cipherBytes);
  return new TextDecoder().decode(decrypted);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  try {
    // ── Auth: Only admin users can manage encrypted secrets ──
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

    // Check admin role
    const serviceClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: roleData } = await serviceClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { operation, key_name, value, category } = body;

    // Audit every access
    await serviceClient.from("security_audit_log").insert({
      user_id: userId,
      action: `Secret_${operation || "unknown"}`,
      resource_type: "encrypted_secrets",
      resource_id: key_name || null,
      agent_id: "encrypted-secrets-v1",
    });

    if (operation === "set") {
      if (!key_name || !value) {
        return new Response(JSON.stringify({ error: "key_name and value required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { ciphertext, iv } = await encrypt(value);
      const encryptedValue = JSON.stringify({ ciphertext, iv });

      const { error } = await serviceClient
        .from("encrypted_secrets")
        .upsert(
          {
            key_name,
            encrypted_value: encryptedValue,
            category: category || "api_key",
            last_rotated_at: new Date().toISOString(),
          },
          { onConflict: "key_name" }
        );

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, key_name }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (operation === "get") {
      if (!key_name) {
        return new Response(JSON.stringify({ error: "key_name required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data, error } = await serviceClient
        .from("encrypted_secrets")
        .select("encrypted_value, category, last_rotated_at")
        .eq("key_name", key_name)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        return new Response(JSON.stringify({ error: "Secret not found" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { ciphertext, iv } = JSON.parse(data.encrypted_value);
      const decryptedValue = await decrypt(ciphertext, iv);

      return new Response(
        JSON.stringify({ key_name, value: decryptedValue, category: data.category, last_rotated_at: data.last_rotated_at }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (operation === "list") {
      const { data, error } = await serviceClient
        .from("encrypted_secrets")
        .select("key_name, category, encryption_method, last_rotated_at, created_at")
        .order("key_name");

      if (error) throw error;

      return new Response(JSON.stringify({ secrets: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (operation === "delete") {
      if (!key_name) {
        return new Response(JSON.stringify({ error: "key_name required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error } = await serviceClient
        .from("encrypted_secrets")
        .delete()
        .eq("key_name", key_name);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, deleted: key_name }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid operation. Use: set, get, list, delete" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Encrypted secrets error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
