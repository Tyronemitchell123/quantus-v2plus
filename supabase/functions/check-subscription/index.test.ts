import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { handleCheckSubscription } from "./index.ts";

const baseDeps = {
  stripeKey: "sk_test_123",
  rateLimitFn: () => null,
};

const sub = (product: string, end = 1_700_000_000) => ({
  current_period_end: end,
  cancel_at_period_end: false,
  items: { data: [{ price: { product } }] },
});

Deno.test("check-subscription unit: OPTIONS returns CORS headers", async () => {
  const res = await handleCheckSubscription(new Request("http://localhost", { method: "OPTIONS" }), baseDeps);
  assertEquals(res.status, 200);
  assertExists(res.headers.get("access-control-allow-origin"));
});

Deno.test("check-subscription unit: rejects missing auth header", async () => {
  const res = await handleCheckSubscription(new Request("http://localhost", { method: "POST" }), baseDeps);
  const body = await res.json();
  assertEquals(res.status, 401);
  assertExists(body.error);
});

Deno.test("check-subscription unit: rejects malformed auth header", async () => {
  const res = await handleCheckSubscription(
    new Request("http://localhost", { method: "POST", headers: { Authorization: "invalid-token" } }),
    baseDeps,
  );
  const body = await res.json();
  assertEquals(res.status, 401);
  assertExists(body.error);
});

Deno.test("check-subscription unit: rejects empty bearer token", async () => {
  const res = await handleCheckSubscription(
    new Request("http://localhost", { method: "POST", headers: { Authorization: "Bearer   " } }),
    baseDeps,
  );
  const body = await res.json();
  assertEquals(res.status, 401);
  assertExists(body.error);
});

Deno.test("check-subscription unit: returns unsubscribed when no customer", async () => {
  const res = await handleCheckSubscription(
    new Request("http://localhost", { method: "POST", headers: { Authorization: "Bearer t" } }),
    {
      ...baseDeps,
      getUserByToken: async () => ({ user: { email: "user@example.com" } }),
      listCustomersByEmail: async () => [],
    },
  );
  const body = await res.json();
  assertEquals(res.status, 200);
  assertEquals(body.subscribed, false);
});

Deno.test("check-subscription unit: returns trialing tier", async () => {
  const res = await handleCheckSubscription(
    new Request("http://localhost", { method: "POST", headers: { Authorization: "Bearer t" } }),
    {
      ...baseDeps,
      getUserByToken: async () => ({ user: { email: "user@example.com" } }),
      listCustomersByEmail: async () => [{ id: "cus_123" }],
      listSubscriptions: async (_customerId, status) => (status === "trialing" ? [sub("prod_UBaz9IvwQ3JGPQ")] : []),
    },
  );
  const body = await res.json();
  assertEquals(res.status, 200);
  assertEquals(body.subscribed, true);
  assertEquals(body.status, "trialing");
  assertEquals(body.tier, "starter");
});

Deno.test("check-subscription unit: returns active tier with fallback for unknown product", async () => {
  const res = await handleCheckSubscription(
    new Request("http://localhost", { method: "POST", headers: { Authorization: "Bearer t" } }),
    {
      ...baseDeps,
      getUserByToken: async () => ({ user: { email: "user@example.com" } }),
      listCustomersByEmail: async () => [{ id: "cus_123" }],
      listSubscriptions: async (_customerId, status) => (status === "active" ? [sub("prod_unknown")] : []),
    },
  );
  const body = await res.json();
  assertEquals(res.status, 200);
  assertEquals(body.subscribed, true);
  assertEquals(body.status, "active");
  assertEquals(body.tier, "starter");
});

Deno.test("check-subscription unit: returns 401 when auth provider rejects token", async () => {
  const res = await handleCheckSubscription(
    new Request("http://localhost", { method: "POST", headers: { Authorization: "Bearer badtoken" } }),
    {
      ...baseDeps,
      getUserByToken: async () => ({ user: null, error: "JWT expired" }),
    },
  );
  const body = await res.json();
  assertEquals(res.status, 401);
  assertEquals(body.error, "Auth error: JWT expired");
});

Deno.test("check-subscription unit: returns 401 when auth response has no user", async () => {
  const res = await handleCheckSubscription(
    new Request("http://localhost", { method: "POST", headers: { Authorization: "Bearer valid-but-empty" } }),
    {
      ...baseDeps,
      getUserByToken: async () => ({ user: null }),
    },
  );
  const body = await res.json();
  assertEquals(res.status, 401);
  assertEquals(body.error, "User not authenticated");
});

Deno.test("check-subscription unit: returns 500 for unexpected internal errors", async () => {
  const res = await handleCheckSubscription(
    new Request("http://localhost", { method: "POST", headers: { Authorization: "Bearer t" } }),
    {
      ...baseDeps,
      getUserByToken: async () => ({ user: { email: "user@example.com" } }),
      listCustomersByEmail: async () => {
        throw new Error("Stripe unavailable");
      },
    },
  );
  const body = await res.json();
  assertEquals(res.status, 500);
  assertEquals(body.error, "Internal server error");
});

Deno.test("check-subscription unit: returns 500 when STRIPE key is unavailable", async () => {
  const res = await handleCheckSubscription(
    new Request("http://localhost", { method: "POST", headers: { Authorization: "Bearer t" } }),
    {
      rateLimitFn: () => null,
      // intentionally no stripeKey to simulate missing runtime configuration
    },
  );
  const body = await res.json();
  assertEquals(res.status, 500);
  assertEquals(body.error, "STRIPE_SECRET_KEY is not set");
});
