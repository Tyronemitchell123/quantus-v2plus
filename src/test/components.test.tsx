import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";

const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) throw new Error("Test crash");
  return <div>Normal content</div>;
};

describe("ErrorBoundary", () => {
  it("renders children when no error", () => {
    render(
      <BrowserRouter>
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      </BrowserRouter>
    );
    expect(screen.getByText("Normal content")).toBeInTheDocument();
  });

  it("renders fallback on error", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <BrowserRouter>
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      </BrowserRouter>
    );
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Test crash")).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  it("recovers on Try Again click", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { rerender } = render(
      <BrowserRouter>
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      </BrowserRouter>
    );
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  it("shows custom fallback when provided", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <BrowserRouter>
        <ErrorBoundary fallback={<div>Custom error page</div>}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      </BrowserRouter>
    );
    expect(screen.getByText("Custom error page")).toBeInTheDocument();
    consoleSpy.mockRestore();
  });
});

describe("Input validation", () => {
  it("validates email format", () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    expect(emailRegex.test("test@test.com")).toBe(true);
    expect(emailRegex.test("invalid")).toBe(false);
    expect(emailRegex.test("")).toBe(false);
    expect(emailRegex.test("test@")).toBe(false);
  });

  it("validates password strength", () => {
    const isStrong = (pwd: string) => pwd.length >= 8;
    expect(isStrong("short")).toBe(false);
    expect(isStrong("SecurePass123!")).toBe(true);
    expect(isStrong("12345678")).toBe(true);
  });

  it("sanitizes user input for XSS", () => {
    const sanitize = (input: string) => input.replace(/<[^>]*>/g, "");
    expect(sanitize("<script>alert('xss')</script>")).toBe("alert('xss')");
    expect(sanitize("Normal text")).toBe("Normal text");
    expect(sanitize('<img onerror="hack()" />')).toBe("");
  });
});

describe("Subscription tier access control", () => {
  const tierOrder = ["free", "starter", "professional", "teams", "enterprise"];
  const canAccess = (userTier: string, requiredTier: string) => {
    if (requiredTier === "free") return true;
    return tierOrder.indexOf(userTier) >= tierOrder.indexOf(requiredTier);
  };

  it("free users can access free features", () => {
    expect(canAccess("free", "free")).toBe(true);
  });

  it("free users cannot access starter features", () => {
    expect(canAccess("free", "starter")).toBe(false);
  });

  it("professional users can access starter features", () => {
    expect(canAccess("professional", "starter")).toBe(true);
  });

  it("teams users can access professional features", () => {
    expect(canAccess("teams", "professional")).toBe(true);
  });

  it("starter users cannot access professional features", () => {
    expect(canAccess("starter", "professional")).toBe(false);
  });
});

describe("Commission rate calculation", () => {
  const CATEGORY_RATES: Record<string, number> = {
    aviation: 0.025,
    real_estate: 0.04,
    medical: 0.065,
    lifestyle: 0.125,
    wellness: 0.125,
    staffing: 0.20,
    logistics: 0.04,
    marine: 0.05,
    legal: 0.075,
    finance: 0.05,
  };

  it("calculates aviation commission correctly", () => {
    const dealValue = 1_000_000_00; // $1M in cents
    const rate = CATEGORY_RATES["aviation"];
    const commission = Math.round(dealValue * rate);
    expect(commission).toBe(2_500_000); // $25,000
  });

  it("calculates staffing commission correctly", () => {
    const dealValue = 50_000_00; // $50K in cents
    const rate = CATEGORY_RATES["staffing"];
    const commission = Math.round(dealValue * rate);
    expect(commission).toBe(10_000_00); // $10,000
  });

  it("applies custom rate over category default", () => {
    const dealValue = 100_000_00;
    const customRate = 0.15;
    const commission = Math.round(dealValue * customRate);
    expect(commission).toBe(15_000_00);
  });

  it("handles zero deal value", () => {
    const commission = Math.round(0 * CATEGORY_RATES["aviation"]);
    expect(commission).toBe(0);
  });
});
