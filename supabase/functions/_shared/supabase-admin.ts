/**
 * Shared Supabase admin client factory for edge functions.
 * Centralizes CORS, authentication, and client creation patterns.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

export const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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
 * Authenticate a request and return the user ID.
 * Returns a Response on failure (send it back), or { userId, userClient } on success.
 */
export async function authenticateUser(req: Request): Promise<
  | { userId: string; userClient: ReturnType<typeof createClient> }
  | Response
> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return errorResponse("Missing or invalid Authorization header", 401);
  }

  const userClient = createUserClient(authHeader);
  const token = authHeader.replace("Bearer ", "");
  const { data, error } = await userClient.auth.getClaims(token);

  if (error || !data?.claims) {
    return errorResponse("Invalid or expired token", 401);
  }

  return { userId: data.claims.sub as string, userClient };
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
  aviation: 0.025,
  medical: 0.08,
  lifestyle: 0.10,
  hospitality: 0.10,
  staffing: 0.20,
  logistics: 0.05,
  marine: 0.05,
  legal: 0.075,
  finance: 0.05,
  partnerships: 0.07,
  default: 0.05,
};

export function getCommissionRate(category: string): number {
  return COMMISSION_RATES[category.toLowerCase()] ?? COMMISSION_RATES.default;
}

/**
 * Structured edge function logger.
 * Outputs JSON logs for observability (queryable via analytics).
 */
export function edgeLog(
  level: "info" | "warn" | "error",
  functionName: string,
  message: string,
  meta?: Record<string, unknown>,
): void {
  const entry = {
    level,
    fn: functionName,
    msg: message,
    ts: new Date().toISOString(),
    ...meta,
  };
  if (level === "error") console.error(JSON.stringify(entry));
  else if (level === "warn") console.warn(JSON.stringify(entry));
  else console.log(JSON.stringify(entry));
}

/**
 * Validate required fields from a parsed JSON body.
 * Returns an error Response if validation fails, null if OK.
 */
export function validateFields(
  body: Record<string, unknown>,
  required: string[],
): Response | null {
  const missing = required.filter((f) => body[f] === undefined || body[f] === null || body[f] === "");
  if (missing.length > 0) {
    return errorResponse(`Missing required fields: ${missing.join(", ")}`, 400);
  }
  return null;
}
