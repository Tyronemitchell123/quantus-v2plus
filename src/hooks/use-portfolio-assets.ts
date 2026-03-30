import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export interface PortfolioAsset {
  id: string;
  name: string;
  asset_class: string;
  value_cents: number;
  currency: string;
  allocation_pct: number;
  change_pct: number;
  metadata: Record<string, any>;
}

const DEFAULT_ASSETS: Omit<PortfolioAsset, "id">[] = [
  { name: "Real Estate", asset_class: "real_estate", value_cents: 4_250_000_000, currency: "GBP", allocation_pct: 34, change_pct: 3.2, metadata: {} },
  { name: "Equities", asset_class: "equities", value_cents: 2_875_000_000, currency: "GBP", allocation_pct: 23, change_pct: -1.8, metadata: {} },
  { name: "Private Equity", asset_class: "private_equity", value_cents: 1_820_000_000, currency: "GBP", allocation_pct: 15, change_pct: 7.4, metadata: {} },
  { name: "Fixed Income", asset_class: "fixed_income", value_cents: 1_250_000_000, currency: "GBP", allocation_pct: 10, change_pct: 0.5, metadata: {} },
  { name: "Aviation Assets", asset_class: "aviation", value_cents: 980_000_000, currency: "GBP", allocation_pct: 8, change_pct: -2.1, metadata: {} },
  { name: "Luxury Collectibles", asset_class: "collectibles", value_cents: 625_000_000, currency: "GBP", allocation_pct: 5, change_pct: 12.3, metadata: {} },
  { name: "Vehicles", asset_class: "vehicles", value_cents: 310_000_000, currency: "GBP", allocation_pct: 3, change_pct: -5.4, metadata: {} },
  { name: "Liquid Cash", asset_class: "cash", value_cents: 290_000_000, currency: "GBP", allocation_pct: 2, change_pct: 0.0, metadata: {} },
];

export function usePortfolioAssets() {
  const { user } = useAuth();
  const [assets, setAssets] = useState<PortfolioAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingDefaults, setUsingDefaults] = useState(false);

  const fetchAssets = useCallback(async () => {
    if (!user) {
      // Not logged in — use defaults for demo
      setAssets(DEFAULT_ASSETS.map((a, i) => ({ ...a, id: `default-${i}` })));
      setUsingDefaults(true);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("portfolio_assets")
      .select("*")
      .eq("user_id", user.id)
      .order("allocation_pct", { ascending: false });

    if (error) {
      console.error("Failed to fetch portfolio:", error);
      setAssets(DEFAULT_ASSETS.map((a, i) => ({ ...a, id: `default-${i}` })));
      setUsingDefaults(true);
    } else if (data && data.length > 0) {
      setAssets(data.map((d) => ({
        id: d.id,
        name: d.name,
        asset_class: d.asset_class,
        value_cents: d.value_cents,
        currency: d.currency,
        allocation_pct: Number(d.allocation_pct),
        change_pct: Number(d.change_pct),
        metadata: (d.metadata as Record<string, any>) || {},
      })));
      setUsingDefaults(false);
    } else {
      // No assets yet — use defaults
      setAssets(DEFAULT_ASSETS.map((a, i) => ({ ...a, id: `default-${i}` })));
      setUsingDefaults(true);
    }
    setLoading(false);
  }, [user]);

  const seedDefaults = useCallback(async () => {
    if (!user) return;
    const rows = DEFAULT_ASSETS.map((a) => ({ ...a, user_id: user.id }));
    const { error } = await supabase.from("portfolio_assets").insert(rows);
    if (error) {
      console.error("Failed to seed defaults:", error);
      return;
    }
    await fetchAssets();
  }, [user, fetchAssets]);

  const addAsset = useCallback(async (asset: Omit<PortfolioAsset, "id">) => {
    if (!user) return;
    const { error } = await supabase.from("portfolio_assets").insert({ ...asset, user_id: user.id });
    if (!error) await fetchAssets();
    return error;
  }, [user, fetchAssets]);

  const updateAsset = useCallback(async (id: string, updates: Partial<PortfolioAsset>) => {
    if (!user) return;
    const { error } = await supabase.from("portfolio_assets").update(updates).eq("id", id).eq("user_id", user.id);
    if (!error) await fetchAssets();
    return error;
  }, [user, fetchAssets]);

  const deleteAsset = useCallback(async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from("portfolio_assets").delete().eq("id", id).eq("user_id", user.id);
    if (!error) await fetchAssets();
    return error;
  }, [user, fetchAssets]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  return {
    assets,
    loading,
    usingDefaults,
    seedDefaults,
    addAsset,
    updateAsset,
    deleteAsset,
    refetch: fetchAssets,
  };
}

// Helper to convert cents to display value
export const centsToValue = (cents: number) => cents / 100;
export const valueToCents = (value: number) => Math.round(value * 100);
export const fmtGBP = (cents: number) => "£" + centsToValue(cents).toLocaleString("en-GB");
