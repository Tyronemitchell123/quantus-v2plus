import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Authenticate a request via either:
 *  1. Supabase JWT (standard browser auth)
 *  2. Platform API key (qai_... tokens from Settings → API Keys)
 *
 * Returns { userId } on success, or a Response to send back on failure.
 */
export async function authenticateRequest(
  req: Request,
  corsHeaders: Record<string, string>,
): Promise<{ userId: string } | Response> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({ error: "Missing Authorization header" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const token = authHeader.replace("Bearer ", "");

  // ── API key path ──
  if (token.startsWith("qai_")) {
    return authenticateApiKey(token, corsHeaders);
  }

  // ── JWT path ──
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data, error } = await supabase.auth.getClaims(token);
  if (error || !data?.claims) {
    return new Response(
      JSON.stringify({ error: "Invalid or expired token" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  return { userId: data.claims.sub as string };
}

async function authenticateApiKey(
  key: string,
  corsHeaders: Record<string, string>,
): Promise<{ userId: string } | Response> {
  const keyHash = await hashKey(key);

  // Use service role to bypass RLS and query api_keys
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data, error } = await supabase
    .from("api_keys")
    .select("id, user_id, is_active, expires_at")
    .eq("key_hash", keyHash)
    .maybeSingle();

  if (error || !data) {
    return new Response(
      JSON.stringify({ error: "Invalid API key" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  if (!data.is_active) {
    return new Response(
      JSON.stringify({ error: "API key has been revoked" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return new Response(
      JSON.stringify({ error: "API key has expired" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  // Update last_used_at (fire-and-forget)
  supabase
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", data.id)
    .then();

  return { userId: data.user_id };
}

async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(key));
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
