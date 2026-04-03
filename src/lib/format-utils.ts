/**
 * Shared formatting utilities used across dashboard pages.
 * Centralizes currency formatting, status colors, and category icons.
 */

// ── Currency ────────────────────────────────────────────────────
export function formatCurrencyCents(
  cents: number,
  currency: "GBP" | "USD" | "EUR" = "USD",
): string {
  const symbols: Record<string, string> = { GBP: "£", USD: "$", EUR: "€" };
  const symbol = symbols[currency] || "$";
  const value = cents / 100;
  return `${symbol}${value.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
}

export function formatCurrencyWhole(
  value: number,
  currency: "GBP" | "USD" | "EUR" = "GBP",
): string {
  const symbols: Record<string, string> = { GBP: "£", USD: "$", EUR: "€" };
  const symbol = symbols[currency] || "£";
  return `${symbol}${value.toLocaleString("en-GB")}`;
}

export function formatCurrencyDecimal(
  value: number,
  currency: "GBP" | "USD" | "EUR" = "GBP",
): string {
  const symbols: Record<string, string> = { GBP: "£", USD: "$", EUR: "€" };
  const symbol = symbols[currency] || "£";
  return `${symbol}${value.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ── Status Colors ───────────────────────────────────────────────
export function commissionStatusColor(status: string): string {
  switch (status) {
    case "paid":
      return "bg-green-500/10 text-green-400 border-green-500/20";
    case "processing":
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "pending":
    case "expected":
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

export function dealStatusColor(status: string): string {
  switch (status) {
    case "completed":
      return "bg-green-500/10 text-green-400 border-green-500/20";
    case "intake":
    case "sourcing":
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "negotiation":
    case "execution":
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    case "cancelled":
      return "bg-red-500/10 text-red-400 border-red-500/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

// ── Date ────────────────────────────────────────────────────────
export function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateGB(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
