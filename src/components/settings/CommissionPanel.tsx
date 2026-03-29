import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Percent, Save, RotateCcw, TrendingUp, Loader2, Search, Edit3, Check, X, DollarSign, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const DEFAULT_RATES: Record<string, number> = {
  aviation: 2.5,
  medical: 8,
  staffing: 20,
  lifestyle: 10,
  logistics: 5,
  partnerships: 7,
};

type DealRow = {
  id: string;
  deal_number: string;
  category: string;
  status: string;
  deal_value_estimate: number | null;
  custom_commission_rate: number | null;
};

type VendorRow = {
  id: string;
  vendor_name: string;
  vendor_company: string | null;
  category: string;
  deal_id: string;
  custom_commission_rate: number | null;
  deal_number?: string;
};

export default function CommissionPanel() {
  const [deals, setDeals] = useState<DealRow[]>([]);
  const [vendors, setVendors] = useState<VendorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDeal, setEditingDeal] = useState<string | null>(null);
  const [editingVendor, setEditingVendor] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"deals" | "vendors">("deals");
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [payoutPreview, setPayoutPreview] = useState<any>(null);
  const [payoutResult, setPayoutResult] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setLoading(false); return; }

    const [dealsRes, vendorsRes] = await Promise.all([
      supabase
        .from("deals")
        .select("id, deal_number, category, status, deal_value_estimate, custom_commission_rate")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("vendor_outreach")
        .select("id, vendor_name, vendor_company, category, deal_id, custom_commission_rate, deals!inner(deal_number)")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false }),
    ]);

    if (dealsRes.data) setDeals(dealsRes.data as DealRow[]);
    if (vendorsRes.data) {
      setVendors(vendorsRes.data.map((v: any) => ({
        ...v,
        deal_number: v.deals?.deal_number,
      })));
    }
    setLoading(false);
  };

  const saveDealRate = async (dealId: string) => {
    setSaving(true);
    const rate = editValue === "" ? null : parseFloat(editValue);
    if (rate !== null && (isNaN(rate) || rate < 0 || rate > 100)) {
      toast.error("Rate must be between 0 and 100");
      setSaving(false);
      return;
    }
    const { error } = await supabase
      .from("deals")
      .update({ custom_commission_rate: rate } as any)
      .eq("id", dealId);
    if (error) toast.error(error.message);
    else {
      toast.success("Commission rate updated");
      setDeals(prev => prev.map(d => d.id === dealId ? { ...d, custom_commission_rate: rate } : d));
    }
    setEditingDeal(null);
    setSaving(false);
  };

  const saveVendorRate = async (vendorId: string) => {
    setSaving(true);
    const rate = editValue === "" ? null : parseFloat(editValue);
    if (rate !== null && (isNaN(rate) || rate < 0 || rate > 100)) {
      toast.error("Rate must be between 0 and 100");
      setSaving(false);
      return;
    }
    const { error } = await supabase
      .from("vendor_outreach")
      .update({ custom_commission_rate: rate } as any)
      .eq("id", vendorId);
    if (error) toast.error(error.message);
    else {
      toast.success("Vendor commission rate updated");
      setVendors(prev => prev.map(v => v.id === vendorId ? { ...v, custom_commission_rate: rate } : v));
    }
    setEditingVendor(null);
    setSaving(false);
  };

  const resetDealRate = async (dealId: string) => {
    const { error } = await supabase
      .from("deals")
      .update({ custom_commission_rate: null } as any)
      .eq("id", dealId);
    if (error) toast.error(error.message);
    else {
      toast.success("Reset to default rate");
      setDeals(prev => prev.map(d => d.id === dealId ? { ...d, custom_commission_rate: null } : d));
    }
  };

  const previewPayout = async () => {
    setPayoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("process-commission-payouts", {
        body: { action: "preview" },
      });
      if (error) throw new Error(error.message);
      setPayoutPreview(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load payout preview");
    }
    setPayoutLoading(false);
  };

  const executePayout = async () => {
    setPayoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("process-commission-payouts", {
        body: { action: "execute" },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      setPayoutResult(data);
      setPayoutPreview(null);
      toast.success(`Commission payout of ${data.total} processed via Stripe`);
    } catch (err: any) {
      toast.error(err.message || "Payout failed");
    }
    setPayoutLoading(false);
  };

  const getEffectiveRate = (category: string, customRate: number | null) =>
    customRate !== null && customRate !== undefined ? customRate : DEFAULT_RATES[category] || 0;

  const formatCurrency = (val: number | null) =>
    val ? `£${val.toLocaleString("en-GB")}` : "—";

  const filteredDeals = deals.filter(d =>
    d.deal_number.toLowerCase().includes(search.toLowerCase()) ||
    d.category.toLowerCase().includes(search.toLowerCase())
  );

  const filteredVendors = vendors.filter(v =>
    v.vendor_name.toLowerCase().includes(search.toLowerCase()) ||
    v.category.toLowerCase().includes(search.toLowerCase()) ||
    (v.deal_number || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={24} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Default rates overview */}
      <div className="border border-border rounded-xl bg-card p-5">
        <h3 className="font-display text-sm text-foreground mb-4 flex items-center gap-2">
          <TrendingUp size={16} className="text-primary" />
          Default Commission Rates
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Object.entries(DEFAULT_RATES).map(([cat, rate]) => (
            <div key={cat} className="border border-border rounded-lg p-3 bg-muted/30">
              <p className="text-xs text-muted-foreground capitalize">{cat}</p>
              <p className="text-lg font-display text-primary">{rate}%</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          These are the platform defaults. Override per deal or per vendor below.
        </p>
      </div>

      {/* Search + Tabs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search deals or vendors…"
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex gap-1">
          {(["deals", "vendors"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all capitalize ${
                tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {t} ({t === "deals" ? deals.length : vendors.length})
            </button>
          ))}
        </div>
      </div>

      {/* Deals Table */}
      <AnimatePresence mode="wait">
        {tab === "deals" && (
          <motion.div key="deals" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 text-muted-foreground">
                    <th className="text-left px-4 py-3 font-medium">Deal</th>
                    <th className="text-left px-4 py-3 font-medium">Category</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-right px-4 py-3 font-medium">Value</th>
                    <th className="text-right px-4 py-3 font-medium">Rate</th>
                    <th className="text-right px-4 py-3 font-medium">Commission</th>
                    <th className="text-center px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDeals.map((deal, i) => {
                    const rate = getEffectiveRate(deal.category, deal.custom_commission_rate);
                    const isCustom = deal.custom_commission_rate !== null && deal.custom_commission_rate !== undefined;
                    const commission = (deal.deal_value_estimate || 0) * rate / 100;
                    const isEditing = editingDeal === deal.id;

                    return (
                      <tr key={deal.id} className={`border-t border-border ${i % 2 === 0 ? "bg-card" : "bg-muted/20"}`}>
                        <td className="px-4 py-3 font-mono text-xs text-foreground">{deal.deal_number}</td>
                        <td className="px-4 py-3 capitalize text-foreground">{deal.category}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            deal.status === "completed" ? "bg-green-500/10 text-green-400" :
                            deal.status === "execution" || deal.status === "negotiation" ? "bg-amber-500/10 text-amber-400" :
                            "bg-muted text-muted-foreground"
                          }`}>
                            {deal.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-foreground">{formatCurrency(deal.deal_value_estimate)}</td>
                        <td className="px-4 py-3 text-right">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-1">
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-16 px-2 py-1 rounded border border-primary bg-card text-foreground text-right text-xs focus:outline-none"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") saveDealRate(deal.id);
                                  if (e.key === "Escape") setEditingDeal(null);
                                }}
                              />
                              <span className="text-xs text-muted-foreground">%</span>
                            </div>
                          ) : (
                            <span className={isCustom ? "text-primary font-semibold" : "text-foreground"}>
                              {rate}%{isCustom && " ✦"}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-foreground">£{commission.toLocaleString("en-GB", { maximumFractionDigits: 0 })}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            {isEditing ? (
                              <>
                                <button onClick={() => saveDealRate(deal.id)} disabled={saving}
                                  className="p-1 rounded hover:bg-green-500/10 text-green-400 transition-colors">
                                  <Check size={14} />
                                </button>
                                <button onClick={() => setEditingDeal(null)}
                                  className="p-1 rounded hover:bg-destructive/10 text-destructive transition-colors">
                                  <X size={14} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => { setEditingDeal(deal.id); setEditValue(deal.custom_commission_rate?.toString() || ""); }}
                                  className="p-1 rounded hover:bg-primary/10 text-primary transition-colors"
                                  title="Edit rate"
                                >
                                  <Edit3 size={14} />
                                </button>
                                {isCustom && (
                                  <button
                                    onClick={() => resetDealRate(deal.id)}
                                    className="p-1 rounded hover:bg-muted text-muted-foreground transition-colors"
                                    title="Reset to default"
                                  >
                                    <RotateCcw size={12} />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredDeals.length === 0 && (
                <p className="text-center text-muted-foreground text-sm py-8">No deals found</p>
              )}
            </div>
          </motion.div>
        )}

        {tab === "vendors" && (
          <motion.div key="vendors" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 text-muted-foreground">
                    <th className="text-left px-4 py-3 font-medium">Vendor</th>
                    <th className="text-left px-4 py-3 font-medium">Company</th>
                    <th className="text-left px-4 py-3 font-medium">Category</th>
                    <th className="text-left px-4 py-3 font-medium">Deal</th>
                    <th className="text-right px-4 py-3 font-medium">Custom Rate</th>
                    <th className="text-center px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVendors.map((vendor, i) => {
                    const isCustom = vendor.custom_commission_rate !== null && vendor.custom_commission_rate !== undefined;
                    const isEditing = editingVendor === vendor.id;
                    const effectiveRate = getEffectiveRate(vendor.category, vendor.custom_commission_rate);

                    return (
                      <tr key={vendor.id} className={`border-t border-border ${i % 2 === 0 ? "bg-card" : "bg-muted/20"}`}>
                        <td className="px-4 py-3 text-foreground">{vendor.vendor_name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{vendor.vendor_company || "—"}</td>
                        <td className="px-4 py-3 capitalize text-foreground">{vendor.category}</td>
                        <td className="px-4 py-3 font-mono text-xs text-foreground">{vendor.deal_number || "—"}</td>
                        <td className="px-4 py-3 text-right">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-1">
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-16 px-2 py-1 rounded border border-primary bg-card text-foreground text-right text-xs focus:outline-none"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") saveVendorRate(vendor.id);
                                  if (e.key === "Escape") setEditingVendor(null);
                                }}
                              />
                              <span className="text-xs text-muted-foreground">%</span>
                            </div>
                          ) : (
                            <span className={isCustom ? "text-primary font-semibold" : "text-muted-foreground"}>
                              {isCustom ? `${effectiveRate}% ✦` : `${effectiveRate}% (default)`}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            {isEditing ? (
                              <>
                                <button onClick={() => saveVendorRate(vendor.id)} disabled={saving}
                                  className="p-1 rounded hover:bg-green-500/10 text-green-400 transition-colors">
                                  <Check size={14} />
                                </button>
                                <button onClick={() => setEditingVendor(null)}
                                  className="p-1 rounded hover:bg-destructive/10 text-destructive transition-colors">
                                  <X size={14} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => { setEditingVendor(vendor.id); setEditValue(vendor.custom_commission_rate?.toString() || ""); }}
                                  className="p-1 rounded hover:bg-primary/10 text-primary transition-colors"
                                  title="Set custom rate"
                                >
                                  <Edit3 size={14} />
                                </button>
                                {isCustom && (
                                  <button
                                    onClick={async () => {
                                      await supabase.from("vendor_outreach").update({ custom_commission_rate: null } as any).eq("id", vendor.id);
                                      setVendors(prev => prev.map(v => v.id === vendor.id ? { ...v, custom_commission_rate: null } : v));
                                      toast.success("Reset to default");
                                    }}
                                    className="p-1 rounded hover:bg-muted text-muted-foreground transition-colors"
                                    title="Reset to default"
                                  >
                                    <RotateCcw size={12} />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredVendors.length === 0 && (
                <p className="text-center text-muted-foreground text-sm py-8">No vendors found</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
