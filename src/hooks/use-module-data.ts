import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ModuleDeal = {
  id: string;
  deal_number: string;
  category: string;
  sub_category: string | null;
  intent: string | null;
  priority_score: number;
  status: string;
  budget_min: number | null;
  budget_max: number | null;
  budget_currency: string | null;
  location: string | null;
  timeline_days: number | null;
  created_at: string;
  updated_at: string;
};

export type ModuleSourcingResult = {
  id: string;
  deal_id: string;
  name: string;
  description: string | null;
  category: string;
  tier: string;
  overall_score: number;
  estimated_cost: number | null;
  cost_currency: string | null;
  availability: string | null;
  location: string | null;
  risk_level: string | null;
  ai_notes: string | null;
  pros: any;
  cons: any;
  specifications: any;
  vendor_contact: any;
  created_at: string;
};

export type ModuleVendorOutreach = {
  id: string;
  deal_id: string;
  vendor_name: string;
  vendor_company: string | null;
  category: string;
  status: string;
  vendor_score: number | null;
  response_time_hours: number | null;
  follow_up_count: number | null;
  negotiation_ready: boolean | null;
  created_at: string;
};

export function useModuleData(category: string) {
  const [deals, setDeals] = useState<ModuleDeal[]>([]);
  const [sourcingResults, setSourcingResults] = useState<ModuleSourcingResult[]>([]);
  const [vendorOutreach, setVendorOutreach] = useState<ModuleVendorOutreach[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetch() {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) {
        setLoading(false);
        return;
      }

      const [dealsRes, sourcingRes, outreachRes] = await Promise.all([
        supabase
          .from("deals")
          .select("id, deal_number, category, sub_category, intent, priority_score, status, budget_min, budget_max, budget_currency, location, timeline_days, created_at, updated_at")
          .eq("category", category as any)
          .order("updated_at", { ascending: false })
          .limit(20),
        supabase
          .from("sourcing_results")
          .select("id, deal_id, name, description, category, tier, overall_score, estimated_cost, cost_currency, availability, location, risk_level, ai_notes, pros, cons, specifications, vendor_contact, created_at")
          .eq("category", category as any)
          .order("overall_score", { ascending: false })
          .limit(30),
        supabase
          .from("vendor_outreach")
          .select("id, deal_id, vendor_name, vendor_company, category, status, vendor_score, response_time_hours, follow_up_count, negotiation_ready, created_at")
          .eq("category", category as any)
          .order("created_at", { ascending: false })
          .limit(20),
      ]);

      if (!cancelled) {
        setDeals((dealsRes.data as ModuleDeal[]) || []);
        setSourcingResults((sourcingRes.data as ModuleSourcingResult[]) || []);
        setVendorOutreach((outreachRes.data as ModuleVendorOutreach[]) || []);
        setLoading(false);
      }
    }

    fetch();
    return () => { cancelled = true; };
  }, [category]);

  return { deals, sourcingResults, vendorOutreach, loading };
}
