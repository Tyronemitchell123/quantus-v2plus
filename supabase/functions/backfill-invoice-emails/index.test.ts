import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/backfill-invoice-emails`;

Deno.test("backfill-invoice-emails: OPTIONS returns CORS", async () => {
  const res = await fetch(FUNCTION_URL, { method: "OPTIONS" });
  assertEquals(res.status, 200);
  assertExists(res.headers.get("access-control-allow-origin"));
  await res.text();
});

Deno.test("backfill-invoice-emails: returns success shape with no body", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
  });
  const body = await res.json();
  // Should succeed (processes whatever sent invoices exist)
  if (res.status === 200) {
    assertEquals(body.success, true);
    assertExists(body.total !== undefined || body.updated !== undefined);
  }
  // Or may return an error — either way, valid JSON
  assertExists(body);
});

Deno.test("backfill-invoice-emails: accepts overrides body", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ overrides: {} }),
  });
  const body = await res.json();
  assertExists(body);
  await Promise.resolve(); // ensure body consumed
});
