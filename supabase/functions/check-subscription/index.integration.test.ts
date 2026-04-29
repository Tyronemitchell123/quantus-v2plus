import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

Deno.test("check-subscription integration: invalid token returns 401", async () => {
  const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL");
  const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY");

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.log("Skipping integration test: VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY not set");
    return;
  }

  const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/check-subscription`;
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": "Bearer invalid-token-12345",
    },
  });

  assertEquals(res.status, 401);
});
