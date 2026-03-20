import { usePlatform } from "@/hooks/use-platform";

/** Multiplier applied to base USD prices when billing goes through app stores */
const STORE_MARKUP = 1.2; // ~20% to cover 15-30% platform fee

interface MobileTier {
  key: string;
  webPrice: number;
  mobilePrice: number;
}

export function useMobilePricing(tiers: { key: string; monthly: number; annual: number }[], annual: boolean) {
  const { requiresStoreBilling } = usePlatform();

  const adjusted: MobileTier[] = tiers.map((t) => {
    const base = annual ? t.annual : t.monthly;
    const mobile = base === 0 ? 0 : Math.ceil(base * STORE_MARKUP * 100) / 100;
    return {
      key: t.key,
      webPrice: base,
      mobilePrice: mobile,
    };
  });

  const getPrice = (tierKey: string): number => {
    const tier = adjusted.find((t) => t.key === tierKey);
    if (!tier) return 0;
    return requiresStoreBilling ? tier.mobilePrice : tier.webPrice;
  };

  return { adjusted, getPrice, isStoreBilling: requiresStoreBilling };
}
