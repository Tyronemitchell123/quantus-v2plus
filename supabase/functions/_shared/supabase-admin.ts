/**
 * Shared Supabase admin client factory for edge functions.
 * Centralizes CORS, authentication, and client creation patterns.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.49.1/cors";

export { corsHeaders };

/**
 * Create a Supabase service-role client for server-side operations.
 */
export function createAdminClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key);
}

/**
 * Create a Supabase client scoped to the requesting user's JWT.
 */
export function createUserClient(authHeader: string) {
  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY");
  if (!url || !anonKey) throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY");
  return createClient(url, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
}

/**
 * Standard CORS preflight response.
 */
export function handleCors(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  return null;
}

/**
 * JSON response helper with CORS headers.
 */
export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/**
 * Error response helper with CORS headers.
 */
export function errorResponse(message: string, status = 400): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/**
 * Commission rate constants — single source of truth.
 */
export const COMMISSION_RATES: Record<string, number> = {
  aviation: 0.10,
  medical: 0.08,
  lifestyle: 0.12,
  hospitality: 0.10,
  staffing: 0.15,
  logistics: 0.10,
  marine: 0.10,
  legal: 0.08,
  finance: 0.07,
  partnerships: 0.10,
  default: 0.10,
};

export function getCommissionRate(category: string): number {
  return COMMISSION_RATES[category.toLowerCase()] ?? COMMISSION_RATES.default;
}
