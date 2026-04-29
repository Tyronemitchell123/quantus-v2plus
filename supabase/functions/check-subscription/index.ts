import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { rateLimit } from "../_shared/rate-limit.ts";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

export const PRODUCT_TO_TIER: Record<string, string> = {
  "prod_UBaz9IvwQ3JGPQ": "starter",
  "prod_UBazsHedGjIiur": "professional",
  "prod_UBb0bxM7kcxShs": "teams",
};

const logStep = (step: string, details?: any) => {
  const d = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CHECK-SUBSCRIPTION] ${step}${d}`);
};

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export type CheckSubscriptionDeps = {
  stripeKey?: string;
  rateLimitFn?: (req: Request, corsHeaders: Record<string, string>) => Response | null;
  getUserByToken?: (token: string) => Promise<{ user: { email?: string } | null; error?: string }>;
  listCustomersByEmail?: (email: string) => Promise<{ id: string }[]>;
  listSubscriptions?: (customerId: string, status: "active" | "trialing") => Promise<Array<{ current_period_end: number; cancel_at_period_end: boolean; items: { data: Array<{ price: { product: string } }> } }>>;
};
type SubscriptionRecord = { current_period_end: number; cancel_at_period_end: boolean; items: { data: Array<{ price: { product: string } }> } };
type SubscriptionStatus = "active" | "trialing";

const listSubscriptionsViaStripe = async (
  stripe: Stripe,
  customerId: string,
  status: SubscriptionStatus,
): Promise<SubscriptionRecord[]> => {
  const subList = await stripe.subscriptions.list({
    customer: customerId,
    status,
    limit: 1,
  });
  return subList.data as SubscriptionRecord[];
};

export async function handleCheckSubscription(req: Request, deps: CheckSubscriptionDeps = {}): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rateLimited = deps.rateLimitFn ? deps.rateLimitFn(req, corsHeaders) : rateLimit(req, corsHeaders);
    if (rateLimited) return rateLimited;

    const stripeKey = deps.stripeKey ?? Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new HttpError(500, "STRIPE_SECRET_KEY is not set");
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new HttpError(401, "No authorization header");

    if (!authHeader.startsWith("Bearer ")) throw new HttpError(401, "Invalid authorization header format");
    const token = authHeader.slice("Bearer ".length).trim();
    if (!token) throw new HttpError(401, "Invalid authorization header format");
    const authResult = deps.getUserByToken
      ? await deps.getUserByToken(token)
      : await (async () => {
          const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
            { auth: { persistSession: false } }
          );
          const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
          return { user: userData.user, error: userError?.message };
        })();
    if (authResult.error) throw new HttpError(401, `Auth error: ${authResult.error}`);
    const user = authResult.user;
    if (!user?.email) throw new HttpError(401, "User not authenticated");
    logStep("User authenticated", { email: user.email });

    const customers = deps.listCustomersByEmail
      ? await deps.listCustomersByEmail(user.email)
      : await (async () => {
          const customerList = await stripe.customers.list({ email: user.email, limit: 1 });
          return customerList.data.map((c) => ({ id: c.id }));
        })();

    if (customers.length === 0) {
      logStep("No Stripe customer found");
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const customerId = customers[0].id;
    const subscriptions = deps.listSubscriptions
      ? await deps.listSubscriptions(customerId, "active")
      : await listSubscriptionsViaStripe(stripe, customerId, "active");

    if (subscriptions.length === 0) {
      // Check trialing
      const trialing = deps.listSubscriptions
        ? await deps.listSubscriptions(customerId, "trialing")
        : await listSubscriptionsViaStripe(stripe, customerId, "trialing");

      if (trialing.length === 0) {
        return new Response(JSON.stringify({ subscribed: false }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const sub = trialing[0];
      const productId = sub.items.data[0].price.product as string;
      return new Response(JSON.stringify({
        subscribed: true,
        tier: PRODUCT_TO_TIER[productId] || "starter",
        status: "trialing",
        subscription_end: new Date(sub.current_period_end * 1000).toISOString(),
        cancel_at_period_end: sub.cancel_at_period_end,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sub = subscriptions[0];
    const productId = sub.items.data[0].price.product as string;
    logStep("Active subscription found", { productId });

    return new Response(JSON.stringify({
      subscribed: true,
      tier: PRODUCT_TO_TIER[productId] || "starter",
      status: "active",
      subscription_end: new Date(sub.current_period_end * 1000).toISOString(),
      cancel_at_period_end: sub.cancel_at_period_end,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500;
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg, status });
    const responseMessage = status >= 500 && !(error instanceof HttpError)
      ? "Internal server error"
      : msg;
    return new Response(JSON.stringify({ error: responseMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status,
    });
  }
}

if (import.meta.main) {
  serve(handleCheckSubscription);
}
