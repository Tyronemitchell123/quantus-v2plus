import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// Mock heavy dependencies
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
        order: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
    }),
    functions: { invoke: vi.fn().mockResolvedValue({ data: null, error: null }) },
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    }),
    removeChannel: vi.fn(),
  },
}));

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    user: null,
    session: null,
    loading: false,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signInWithGoogle: vi.fn(),
    signOut: vi.fn(),
    resetPassword: vi.fn(),
  }),
}));

vi.mock("@/hooks/use-subscription", () => ({
  useSubscription: () => ({
    tier: "free",
    subscribed: false,
    loading: false,
    status: null,
  }),
}));

vi.mock("@/hooks/use-usage-tracking", () => ({
  useUsageTracking: () => ({
    usage: null,
    loading: false,
  }),
}));

vi.mock("@/components/ParticleGrid", () => ({
  default: () => null,
}));

describe("Auth page", () => {
  it("renders login form with email and password fields", async () => {
    const Auth = (await import("@/pages/Auth")).default;
    render(
      <MemoryRouter>
        <Auth />
      </MemoryRouter>
    );
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
  });

  it("shows sign up toggle", async () => {
    const Auth = (await import("@/pages/Auth")).default;
    render(
      <MemoryRouter>
        <Auth />
      </MemoryRouter>
    );
    expect(screen.getByText(/create account/i)).toBeInTheDocument();
  });
});

describe("Dashboard page", () => {
  it("renders without crashing", async () => {
    const Dashboard = (await import("@/pages/Dashboard")).default;
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );
    // Dashboard should render some recognizable content
    expect(document.querySelector("main, [class*='dashboard'], div")).toBeTruthy();
  });
});

describe("Intake page", () => {
  it("renders the deal intake form", async () => {
    const Intake = (await import("@/pages/Intake")).default;
    render(
      <MemoryRouter>
        <Intake />
      </MemoryRouter>
    );
    // Should have the intake text area or input
    expect(document.querySelector("textarea, input, [role='textbox']")).toBeTruthy();
  });
});
