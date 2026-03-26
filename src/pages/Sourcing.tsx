import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plane, Heart, Users, Globe, Truck, Handshake, Sparkles, Loader2,
  CheckCircle2, AlertTriangle, DollarSign, MapPin, Clock,
  ArrowRight, ChevronDown, ChevronUp, Star, FileText,
  Zap, RefreshCw, Filter, Shield,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import useDocumentHead from "@/hooks/use-document-head";
import DealPhaseLayout from "@/components/deal/DealPhaseLayout";
import SourcingVendorFeed from "@/components/sourcing/SourcingVendorFeed";
import SourcingOptionsGrid from "@/components/sourcing/SourcingOptionsGrid";
import SourcingInsightsPanel from "@/components/sourcing/SourcingInsightsPanel";

type SourcingResult = {
  id: string;
  deal_id: string;
  category: string;
  tier: string;
  name: string;
  description: string;
  overall_score: number;
  score_breakdown: Record<string, number>;
  pros: string[];
  cons: string[];
  risk_level: string;
  estimated_cost: number | null;
  cost_currency: string;
  availability: string | null;
  location: string | null;
  specifications: Record<string, any>;
  vendor_contact: Record<string, string>;
  vendor_prep: Record<string, any>;
  recommended_next_step: string | null;
  ai_notes: string | null;
  created_at: string;
};

type Deal = {
  id: string;
  deal_number: string;
  category: string;
  sub_category: string;
  intent: string;
  priority_score: number;
  status: string;
  ai_confirmation: string;
  budget_max: number | null;
  budget_currency: string;
  raw_input: string;
};

const categoryIcons: Record<string, typeof Plane> = {
  aviation: Plane, medical: Heart, staffing: Users,
  lifestyle: Globe, logistics: Truck, partnerships: Handshake,
};

export default function Sourcing() {
  useDocumentHead({
    title: "Sourcing Engine — Quantus A.I",
    description: "AI-curated shortlists scored and ranked for your deal.",
  });

  const [searchParams] = useSearchParams();
  const dealId = searchParams.get("deal");
  const [deal, setDeal] = useState<Deal | null>(null);
  const [results, setResults] = useState<SourcingResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [sourcing, setSourcing] = useState(false);
  const [presentationMessage, setPresentationMessage] = useState("");

  useEffect(() => {
    if (dealId) loadDeal(dealId);
  }, [dealId]);

  async function loadDeal(id: string) {
    setLoading(true);
    const { data: d } = await supabase.from("deals").select("*").eq("id", id).single();
    if (d) {
      setDeal(d as unknown as Deal);
      const { data: r } = await supabase
        .from("sourcing_results")
        .select("*")
        .eq("deal_id", id)
        .order("overall_score", { ascending: false });
      if (r && r.length > 0) {
        setResults(r as unknown as SourcingResult[]);
        setPresentationMessage(d.ai_confirmation || "");
      }
    }
    setLoading(false);
  }

  async function runSourcing() {
    if (!dealId || sourcing) return;
    setSourcing(true);
    setResults([]);

    try {
      const { data, error } = await supabase.functions.invoke("sourcing-engine", {
        body: { deal_id: dealId },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      setResults((data.results as SourcingResult[]).sort((a, b) => b.overall_score - a.overall_score));
      setPresentationMessage(data.presentation_message || "");
      if (deal) setDeal({ ...deal, status: "sourcing" });
      toast.success("Sourcing complete — shortlist ready");
    } catch (e: any) {
      toast.error(e.message || "Sourcing failed");
    } finally {
      setSourcing(false);
    }
  }

  const CatIcon = deal ? categoryIcons[deal.category] || Sparkles : Sparkles;
  const hasResults = results.length > 0 && !sourcing;

  return (
    <DealPhaseLayout
      dealId={dealId}
      currentPhase={2}
      phaseTitle="Sourcing & Intelligence Retrieval"
      onApprove={hasResults ? undefined : undefined}
      showBottomBar={false}
    >
      <div className="flex-1 flex flex-col min-h-0">
        {loading ? (
          <div className="text-center py-20">
            <Loader2 size={24} className="animate-spin text-primary mx-auto" />
          </div>
        ) : !deal ? (
          <div className="text-center py-20">
            <p className="font-body text-sm text-muted-foreground">
              No deal selected.{" "}
              <Link to="/intake" className="text-primary hover:underline">Submit a request first</Link>.
            </p>
          </div>
        ) : (
          <div className="container mx-auto px-4 md:px-6 max-w-7xl py-6 md:py-8">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center">
                  <CatIcon size={20} className="text-primary" />
                </div>
                <div className="flex-1">
                  <h1 className="font-display text-2xl md:text-3xl font-medium text-foreground mb-1">
                    Sourcing the optimal options.
                  </h1>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="w-20 h-px bg-primary/40 origin-left mb-2"
                  />
                  <p className="font-body text-xs text-gold-soft/70">
                    Quantus A.I is gathering intelligence from your private network.
                  </p>
                </div>
              </div>

              {/* Deal info strip */}
              <div className="flex flex-wrap gap-3 font-body text-[10px] tracking-[0.15em] uppercase text-muted-foreground">
                <span className="capitalize">{deal.category}</span>
                <span className="text-border">·</span>
                <span>{deal.deal_number}</span>
                <span className="text-border">·</span>
                <span>Priority: {deal.priority_score}</span>
                {deal.budget_max && (
                  <>
                    <span className="text-border">·</span>
                    <span>Budget: {new Intl.NumberFormat("en-US", { style: "currency", currency: deal.budget_currency || "USD", maximumFractionDigits: 0 }).format(deal.budget_max)}</span>
                  </>
                )}
              </div>
            </motion.div>

            {/* Begin Sourcing CTA */}
            {results.length === 0 && !sourcing && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card rounded-xl p-8 text-center mb-8"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                  <Zap size={24} className="text-primary" />
                </div>
                <h2 className="font-display text-xl font-medium text-foreground mb-2">Ready to Source</h2>
                <p className="font-body text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                  Quantus will scan global networks, evaluate options, and curate an intelligence-ranked shortlist.
                </p>
                <button
                  onClick={runSourcing}
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground font-body text-xs tracking-[0.25em] uppercase hover:brightness-110 transition-all rounded-xl gold-glow"
                >
                  <Zap size={14} /> Begin Sourcing
                </button>
              </motion.div>
            )}

            {/* Sourcing in progress — 3-column operational grid */}
            <AnimatePresence>
              {sourcing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid lg:grid-cols-[1fr_1.5fr_1fr] gap-6"
                >
                  {/* Left — Vendor Activation Feed */}
                  <SourcingVendorFeed category={deal.category} />

                  {/* Center — Loading cards */}
                  <div className="space-y-4">
                    <p className="font-body text-[10px] tracking-[0.25em] uppercase text-gold-soft/50 mb-2">Options Being Assembled</p>
                    {[1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.3 }}
                        className="glass-card rounded-xl p-6"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <CatIcon size={14} className="text-primary/60" />
                          </div>
                          <div className="flex-1">
                            <div className="h-3 w-32 bg-muted rounded animate-pulse mb-1.5" />
                            <div className="h-2 w-20 bg-muted/50 rounded animate-pulse" />
                          </div>
                        </div>
                        <div className="space-y-2 mb-3">
                          {["Checking availability", "Verifying pricing", "Confirming compliance"].map((s, j) => (
                            <div key={j} className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: `${j * 0.3}s` }} />
                              <span className="font-body text-[10px] text-muted-foreground">{s}</span>
                            </div>
                          ))}
                        </div>
                        <div className="h-1 bg-border rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-primary rounded-full"
                            initial={{ width: "0%" }}
                            animate={{ width: "60%" }}
                            transition={{ duration: 3, ease: "easeInOut" }}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Right — Insights placeholder */}
                  <SourcingInsightsPanel category={deal.category} loading />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Results — 3-column grid */}
            {hasResults && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                {/* Presentation Message */}
                {presentationMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-xl p-6 border-primary/20"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <Star size={18} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-body text-[10px] tracking-[0.2em] uppercase text-primary/60 mb-2">Quantus A.I</p>
                        <p className="font-body text-sm text-foreground/90 leading-relaxed italic">"{presentationMessage}"</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 3-column layout */}
                <div className="grid lg:grid-cols-[1fr_1.5fr_1fr] gap-6">
                  {/* Left — Vendor feed (completed) */}
                  <SourcingVendorFeed category={deal.category} completed />

                  {/* Center — Options */}
                  <SourcingOptionsGrid results={results} />

                  {/* Right — Insights */}
                  <SourcingInsightsPanel
                    category={deal.category}
                    results={results}
                  />
                </div>

                {/* Review Options CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Link
                    to={`/outreach?deal=${dealId}`}
                    className="flex items-center justify-between glass-card rounded-xl p-5 border-primary/20 hover:border-primary/40 transition-all group"
                  >
                    <div>
                      <p className="font-body text-[10px] tracking-[0.2em] uppercase text-primary/60 mb-1">Sourcing Complete</p>
                      <p className="font-body text-sm text-foreground">Ready for Vendor Outreach</p>
                    </div>
                    <div className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-body text-[10px] tracking-[0.2em] uppercase rounded-lg group-hover:brightness-110 transition-all gold-glow">
                      Review Options <ArrowRight size={12} />
                    </div>
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </DealPhaseLayout>
  );
}
