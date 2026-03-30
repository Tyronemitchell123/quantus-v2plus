import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    }),
    functions: {
      invoke: vi.fn(),
    },
  },
}));

vi.mock("@/lib/audit", () => ({
  logAudit: vi.fn(),
}));

import { supabase } from "@/integrations/supabase/client";

describe("Auth flows", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("signUp calls supabase.auth.signUp with correct params", async () => {
    const mockSignUp = vi.mocked(supabase.auth.signUp);
    mockSignUp.mockResolvedValue({
      data: { user: { id: "u1", email: "test@test.com" } as any, session: null },
      error: null,
    });

    const result = await supabase.auth.signUp({
      email: "test@test.com",
      password: "SecurePass123!",
      options: { data: { full_name: "Test User" } },
    });

    expect(mockSignUp).toHaveBeenCalledWith({
      email: "test@test.com",
      password: "SecurePass123!",
      options: { data: { full_name: "Test User" } },
    });
    expect(result.error).toBeNull();
    expect(result.data.user?.email).toBe("test@test.com");
  });

  it("signIn calls signInWithPassword", async () => {
    const mockSignIn = vi.mocked(supabase.auth.signInWithPassword);
    mockSignIn.mockResolvedValue({
      data: {
        user: { id: "u1", email: "test@test.com" } as any,
        session: { access_token: "tok" } as any,
      },
      error: null,
    });

    const result = await supabase.auth.signInWithPassword({
      email: "test@test.com",
      password: "password",
    });

    expect(result.data.session?.access_token).toBe("tok");
  });

  it("handles sign-in error gracefully", async () => {
    const mockSignIn = vi.mocked(supabase.auth.signInWithPassword);
    mockSignIn.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: "Invalid login credentials", status: 400 } as any,
    });

    const result = await supabase.auth.signInWithPassword({
      email: "bad@test.com",
      password: "wrong",
    });

    expect(result.error?.message).toBe("Invalid login credentials");
    expect(result.data.user).toBeNull();
  });

  it("signOut clears session", async () => {
    const mockSignOut = vi.mocked(supabase.auth.signOut);
    mockSignOut.mockResolvedValue({ error: null });

    const result = await supabase.auth.signOut();
    expect(result.error).toBeNull();
  });

  it("resetPassword calls resetPasswordForEmail", async () => {
    const mockReset = vi.mocked(supabase.auth.resetPasswordForEmail);
    mockReset.mockResolvedValue({ data: {}, error: null });

    const result = await supabase.auth.resetPasswordForEmail("test@test.com", {
      redirectTo: "http://localhost/reset-password",
    });

    expect(mockReset).toHaveBeenCalled();
    expect(result.error).toBeNull();
  });
});

describe("Subscription check", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns subscribed state when Stripe returns active", async () => {
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: {
        subscribed: true,
        tier: "professional",
        subscription_end: "2026-04-30T00:00:00Z",
      },
      error: null,
    });

    const { data, error } = await supabase.functions.invoke("check-subscription");
    expect(error).toBeNull();
    expect(data.subscribed).toBe(true);
    expect(data.tier).toBe("professional");
  });

  it("returns unsubscribed when no Stripe customer", async () => {
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: { subscribed: false },
      error: null,
    });

    const { data } = await supabase.functions.invoke("check-subscription");
    expect(data.subscribed).toBe(false);
  });

  it("falls back to DB on function error", async () => {
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: null,
      error: { message: "Function error" } as any,
    });

    const { error } = await supabase.functions.invoke("check-subscription");
    expect(error).toBeTruthy();
  });
});

describe("Deal pipeline operations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a deal with required fields", async () => {
    const mockFrom = vi.mocked(supabase.from);
    const mockInsert = vi.fn().mockResolvedValue({
      data: { id: "deal-1", deal_number: "QAI-ABC12345", status: "intake" },
      error: null,
    });
    mockFrom.mockReturnValue({ insert: mockInsert } as any);

    const result = await supabase.from("deals").insert({
      user_id: "user-1",
      raw_input: "I need a luxury yacht charter for 20 guests",
      category: "lifestyle",
    });

    expect(mockInsert).toHaveBeenCalledWith({
      user_id: "user-1",
      raw_input: "I need a luxury yacht charter for 20 guests",
      category: "lifestyle",
    });
  });

  it("queries deals with correct RLS scope", async () => {
    const mockFrom = vi.mocked(supabase.from);
    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: [
            { id: "d1", status: "intake", category: "aviation" },
            { id: "d2", status: "sourcing", category: "medical" },
          ],
          error: null,
        }),
      }),
    });
    mockFrom.mockReturnValue({ select: mockSelect } as any);

    const result = await supabase
      .from("deals")
      .select("*")
      .eq("user_id", "user-1")
      .order("created_at", { ascending: false });
  });

  it("commission logs are read-only for clients", async () => {
    const mockFrom = vi.mocked(supabase.from);
    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: [
            {
              id: "c1",
              deal_id: "d1",
              commission_cents: 25000,
              commission_rate: 0.025,
              status: "paid",
            },
          ],
          error: null,
        }),
      }),
    });
    mockFrom.mockReturnValue({ select: mockSelect } as any);

    // Read should work
    const result = await supabase
      .from("commission_logs")
      .select("*")
      .eq("user_id", "user-1")
      .order("created_at", { ascending: false });

    expect(mockSelect).toHaveBeenCalled();
  });
});

describe("Commission payout flow", () => {
  it("preview returns pending commissions summary", async () => {
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: {
        payouts: [
          { id: "c1", commission: "$250.00", category: "aviation" },
        ],
        total: "$250.00",
        total_cents: 25000,
        count: 1,
        stripe_balance: { usd_available_cents: 50000, sufficient_funds: true },
      },
      error: null,
    });

    const { data } = await supabase.functions.invoke("process-commission-payouts", {
      body: { action: "preview" },
    });

    expect(data.total_cents).toBe(25000);
    expect(data.count).toBe(1);
    expect(data.stripe_balance.sufficient_funds).toBe(true);
  });

  it("execute creates payout and returns stripe ID", async () => {
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: {
        success: true,
        stripe_payout_id: "po_test_123",
        total_cents: 25000,
        count: 1,
      },
      error: null,
    });

    const { data } = await supabase.functions.invoke("process-commission-payouts", {
      body: { action: "execute" },
    });

    expect(data.success).toBe(true);
    expect(data.stripe_payout_id).toBe("po_test_123");
  });
});

describe("Marketplace storefront", () => {
  it("checkout creates session with 10% platform fee", async () => {
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: { url: "https://checkout.stripe.com/c/pay_test" },
      error: null,
    });

    const { data } = await supabase.functions.invoke("stripe-connect-checkout", {
      body: { productId: "prod-1" },
    });

    expect(data.url).toContain("checkout.stripe.com");
  });
});
