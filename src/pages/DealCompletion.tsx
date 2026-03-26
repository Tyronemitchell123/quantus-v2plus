import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, Loader2, ArrowLeft, Trophy, Sparkles, TrendingUp,
  Archive, Crown, Plane, Heart, Users, Globe, Truck, Handshake,
  ArrowRight, BarChart3, FileText, Receipt, Clock, Star,
  ChevronDown, ChevronUp, Zap, RefreshCw,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import useDocumentHead from "@/hooks/use-document-head";

const categoryIcons: Record<string, typeof Plane> = {
  aviation: Plane, medical: Heart, staffing: Users,
  lifestyle: Globe, logistics: Truck, partnerships: Handshake,
};

type DealSummary = {
  deal_number: string; category: string; sub_category: string | null;
  deal_value: number | null; total_documents: number; signed_documents: number;
  total_invoices: number; paid_invoices: number; total_revenue_cents: number;
  paid_revenue_cents: number; outstanding_revenue_cents: number;
  total_tasks: number; completed_tasks: number; completion_date: string;
};

type Upsell = { title: string; description: string; category: string };

type TierRec = {
  currentTier: string; completedDeals: number; totalRevenueCents: number;
  recommendation: { tier: string; label: string; message: string } | null;
};

type ArchivedDeal = {
  id: string; deal_number: string; category: string; sub_category: string | null;
  status: string; deal_value_estimate: number | null; budget_currency: string;
  completed_at: string; created_at: string;
};

const DealCompletion = () => {
  useDocumentHead({ title: "Deal Completion | Quantus A.I", description: "Close deals, generate post-deal intelligence, and unlock upsell opportunities." });
  const [params] = useSearchParams();
  const dealId = params.get("deal");

  const [tab, setTab] = useState<"complete" | "archive">(dealId ? "complete" : "archive");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<DealSummary | null>(null);
  const [upsells, setUpsells] = useState<Upsell[]>([]);
  const [upsellMsg, setUpsellMsg] = useState("");
  const [tierRec, setTierRec] = useState<TierRec | null>(null);
  const [archive, setArchive] = useState<ArchivedDeal[]>([]);
  const [expandedUpsell, setExpandedUpsell] = useState<number | null>(null);
  const [completing, setCompleting] = useState(false);

  const completeDeal = async () => {
    if (!dealId) return;
    setCompleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("deal-completion", {
        body: { action: "complete", dealId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setSummary(data.summary);
      toast.success("Deal completed successfully");

      // Load upsells and tier check
      const [upsellRes, tierRes] = await Promise.all([
        supabase.functions.invoke("deal-completion", { body: { action: "upsells", dealId } }),
        supabase.functions.invoke("deal-completion", { body: { action: "tier_check", dealId } }),
      ]);
      if (upsellRes.data) { setUpsells(upsellRes.data.upsells || []); setUpsellMsg(upsellRes.data.message || ""); }
      if (tierRes.data) setTierRec(tierRes.data);
    } catch (err: any) {
      toast.error(err.message || "Failed to complete deal");
    }
    setCompleting(false);
  };

  const loadArchive = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("deal-completion", {
        body: { action: "archive_list" },
      });
      if (error) throw error;
      setArchive(data?.deals || []);
    } catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => {
    if (tab === "archive") loadArchive();
  }, [tab]);

  const formatCurrency = (cents: number, currency = "GBP") => {
    const symbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : "£";
    return `${symbol}${(cents / 100).toLocaleString("en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const tabs = [
    { id: "complete" as const, label: "Complete Deal", icon: Trophy },
    { id: "archive" as const, label: "Deal Archive", icon: Archive },
  ];

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-5xl">
        <Link to="/documents" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
          <ArrowLeft size={14} /> Back to Documents & Billing
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
            Phase 7 — <span className="text-gold-gradient">Deal Completion</span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-xl">
            Close deals, generate post-deal intelligence, and unlock upsell opportunities.
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                tab === t.id ? "bg-primary text-primary-foreground" : "glass-card text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === "complete" && (
            <motion.div key="complete" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {!dealId ? (
                <div className="glass-card rounded-2xl p-12 text-center">
                  <Trophy size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">Select a Deal to Complete</h3>
                  <p className="text-sm text-muted-foreground mb-6">Navigate from Documents & Billing to close a deal and trigger post-deal automation.</p>
                  <Link to="/documents" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-full text-xs font-semibold hover:opacity-90 transition-opacity">
                    <FileText size={14} /> Go to Documents
                  </Link>
                </div>
              ) : !summary ? (
                <div className="glass-card rounded-2xl p-12 text-center">
                  <Sparkles size={48} className="mx-auto text-primary/40 mb-4" />
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">Ready to Close This Deal?</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Completing will archive the deal, generate a summary, and prepare upsell recommendations.
                  </p>
                  <button
                    onClick={completeDeal}
                    disabled={completing}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {completing ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                    {completing ? "Completing..." : "Complete Deal"}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Summary Card */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6 border border-primary/20">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <CheckCircle2 size={20} className="text-primary" />
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-semibold text-foreground">Deal Closed — {summary.deal_number}</h3>
                        <p className="text-xs text-muted-foreground capitalize">{summary.category}{summary.sub_category ? ` · ${summary.sub_category}` : ""}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: "Documents", value: `${summary.signed_documents}/${summary.total_documents}`, icon: FileText, sub: "Signed" },
                        { label: "Invoices", value: `${summary.paid_invoices}/${summary.total_invoices}`, icon: Receipt, sub: "Paid" },
                        { label: "Revenue", value: formatCurrency(summary.total_revenue_cents), icon: TrendingUp, sub: formatCurrency(summary.outstanding_revenue_cents) + " outstanding" },
                        { label: "Tasks", value: `${summary.completed_tasks}/${summary.total_tasks}`, icon: CheckCircle2, sub: "Completed" },
                      ].map((stat, i) => (
                        <div key={i} className="bg-background/50 rounded-xl p-4">
                          <stat.icon size={14} className="text-primary mb-2" />
                          <p className="font-display text-xl font-bold text-foreground">{stat.value}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">{stat.sub}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Tier Recommendation */}
                  {tierRec?.recommendation && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                      className="glass-card rounded-2xl p-6 border border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-transparent"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <Crown size={20} className="text-amber-500" />
                        <h3 className="font-display text-sm font-semibold text-foreground">Membership Tier Recommendation</h3>
                      </div>
                      <p className="text-sm text-muted-foreground italic leading-relaxed mb-4">"{tierRec.recommendation.message}"</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{tierRec.completedDeals} deals completed</span>
                        <span>·</span>
                        <span>{formatCurrency(tierRec.totalRevenueCents)} total revenue</span>
                      </div>
                    </motion.div>
                  )}

                  {/* Upsells */}
                  {upsells.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles size={16} className="text-primary" />
                        <h3 className="font-display text-sm font-semibold text-foreground">Tailored Recommendations</h3>
                      </div>
                      {upsellMsg && (
                        <p className="text-sm text-muted-foreground italic mb-4 pl-6 border-l-2 border-primary/20">"{upsellMsg}"</p>
                      )}
                      <div className="grid md:grid-cols-2 gap-3">
                        {upsells.map((u, i) => {
                          const Icon = categoryIcons[u.category] || Zap;
                          const expanded = expandedUpsell === i;
                          return (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3 + i * 0.05 }}
                              className="glass-card rounded-xl p-4 hover:ring-1 hover:ring-primary/20 transition-all cursor-pointer"
                              onClick={() => setExpandedUpsell(expanded ? null : i)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Icon size={16} className="text-primary shrink-0" />
                                  <h4 className="text-sm font-semibold text-foreground">{u.title}</h4>
                                </div>
                                {expanded ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
                              </div>
                              <AnimatePresence>
                                {expanded && (
                                  <motion.p
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="text-xs text-muted-foreground mt-3 leading-relaxed overflow-hidden"
                                  >
                                    {u.description}
                                  </motion.p>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* System Ready */}
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                    className="text-center pt-6 border-t border-border"
                  >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
                      <RefreshCw size={12} className="text-emerald-500" />
                      <span className="text-[10px] text-emerald-500 font-semibold tracking-wider uppercase">Deal Closed — System Ready</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4">Workflow engine reset. Ready for next request.</p>
                    <Link to="/intake" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-full text-xs font-semibold hover:opacity-90 transition-opacity">
                      Start New Deal <ArrowRight size={12} />
                    </Link>
                  </motion.div>
                </div>
              )}
            </motion.div>
          )}

          {tab === "archive" && (
            <motion.div key="archive" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {loading ? (
                <div className="text-center py-16"><Loader2 size={24} className="animate-spin text-primary mx-auto" /></div>
              ) : archive.length === 0 ? (
                <div className="glass-card rounded-2xl p-12 text-center">
                  <Archive size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">No Completed Deals</h3>
                  <p className="text-sm text-muted-foreground">Completed deals will appear here as a searchable archive.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {archive.map((deal, i) => {
                    const Icon = categoryIcons[deal.category] || Zap;
                    return (
                      <motion.div
                        key={deal.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="glass-card rounded-xl p-4 flex items-center justify-between hover:ring-1 hover:ring-primary/10 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Icon size={14} className="text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{deal.deal_number}</p>
                            <p className="text-[10px] text-muted-foreground capitalize">{deal.category}{deal.sub_category ? ` · ${deal.sub_category}` : ""}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {deal.deal_value_estimate && (
                            <span className="text-xs font-semibold text-foreground">
                              {deal.budget_currency === "USD" ? "$" : "£"}{(deal.deal_value_estimate / 100).toLocaleString()}
                            </span>
                          )}
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Clock size={10} />
                            {deal.completed_at ? new Date(deal.completed_at).toLocaleDateString() : "—"}
                          </div>
                          <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-[10px] text-emerald-500 font-semibold">
                            Closed
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DealCompletion;
