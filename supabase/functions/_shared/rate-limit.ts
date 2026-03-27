/**
 * Simple in-memory rate limiter for edge functions.
 * Uses a sliding window approach per IP address.
 * Note: This resets when the function cold-starts; suitable for
 * basic abuse prevention, not production-grade rate limiting.
 */

const hits = new Map<string, number[]>();

const WINDOW_MS = 60_000; // 1 minute
const MAX_PER_WINDOW = 30; // 30 requests per minute per IP

export function rateLimit(req: Request, corsHeaders: Record<string, string>): Response | null {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("cf-connecting-ip") ||
    "unknown";

  const now = Date.now();
  const timestamps = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);

  if (timestamps.length >= MAX_PER_WINDOW) {
    return new Response(
      JSON.stringify({ error: "Too many requests. Please try again later." }),
      {
        status: 429,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Retry-After": "60",
        },
      },
    );
  }

  timestamps.push(now);
  hits.set(ip, timestamps);

  // Cleanup old entries periodically
  if (hits.size > 10_000) {
    for (const [key, ts] of hits) {
      const filtered = ts.filter((t) => now - t < WINDOW_MS);
      if (filtered.length === 0) hits.delete(key);
      else hits.set(key, filtered);
    }
  }

  return null; // Allowed
}
