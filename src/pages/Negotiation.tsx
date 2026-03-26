import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plane, Heart, Users, Globe, Truck, Handshake, Sparkles, Loader2,
  ArrowRight, Target, Shield, ChevronDown, ChevronUp,
  TrendingUp, TrendingDown, Minus, Zap, Brain, Send, CheckCircle2,
  AlertTriangle, Scale, Clock, BarChart3, Eye, MessageSquare, Gavel,
  Lightbulb, ToggleLeft, ToggleRight, Star, FileText,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import useDocumentHead from "@/hooks/use-document-head";
import { sendDealPhaseEmail } from "@/lib/deal-phase-emails";
import DealPhaseLayout from "@/components/deal/DealPhaseLayout";

const categoryIcons: Record<string, typeof Plane> = {
  aviation: Plane, medical: Heart, staffing: Users,
  lifestyle: Globe, logistics: Truck, partnerships: Handshake,
};

type Deal = {
  id: string;
  deal_number: string;
  category: string;
  sub_category: string | null;
  intent: string | null;
  priority_score: number;
  status: string;
  budget_max: number | null;
  budget_min: number | null;
  budget_currency: string;
};

type VendorAnalysis = {
  vendor_name: string;
  position_strength: number;
  pricing_fairness: string;
  motivation_level: string;
  flexibility_indicators: string[];
  leverage_points: string[];
  risk_flags: string[];
  recommended_tone: string;
  recommended_approach: string;
  counter_offer_draft: string;
  simulation: {
    likely_response: string;
    acceptance_probability: number;
    counter_scenarios: string[];
    walk_away_threshold: string;
  };
};

type DealAssessment = {
  overall_readiness: number;
  market_position: string;
  recommended_timeline: string;
  confidence_level: number;
};

type StrategySummary = {
  primary_strategy: string;
  fallback_strategy: string;
  key_leverage: string[];
  things_to_avoid: string[];
  things_to_push: string[];
  document_checklist: string[];
};

type NegotiationAnalysis = {
  deal_assessment: DealAssessment;
  vendor_analyses: VendorAnalysis[];
  strategy_summary: StrategySummary;
};

type SimulationResult = {
  scenarios: {
    label: string;
    probability: number;
    outcome: string;
    final_price_estimate: string;
    rounds_to_close: number;
    key_concessions: string[];
    risks: string[];
  }[];
  recommended_next_move: string;
  timing_advice: string;
  walk_away_recommendation: boolean;
};

type VendorOutreach = {
  id: string;
  vendor_name: string;
  vendor_company: string | null;
  vendor_score: number;
  status: string;
  negotiation_ready: boolean;
  negotiation_prep: Record<string, any>;
  category: string;
  response_time_hours: number | null;
};

const pricingColors: Record<string, string> = {
  below_market: "text-success",
  fair: "text-primary",
  above_market: "text-accent",
  premium: "text-destructive",
};

const motivationIcons: Record<string, typeof TrendingUp> = {
  low: TrendingDown, medium: Minus, high: TrendingUp, urgent: Zap,
};

const toneLabels: Record<string, string> = {
  ultra_formal: "Ultra-Formal", discreet: "Discreet", assertive: "Assertive",
  exploratory: "Exploratory", high_urgency: "High Urgency", soft_touch: "Soft Touch",
};

const approachLabels: Record<string, string> = {
  price_reduction: "Price Reduction", added_value: "Added Value",
  faster_timeline: "Faster Timeline", bundled_services: "Bundled Services",
  conditional_acceptance: "Conditional", multi_option_leverage: "Multi-Option",
};

function ScoreRing({ value, size = 48 }: { value: number; size?: number }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={2.5} className="stroke-muted" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={2.5}
          className="stroke-primary" strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-display text-xs text-foreground">{value}</span>
    </div>
  );
}

export default function Negotiation() {
  useDocumentHead({
    title: "Negotiation — Quantus A.I",
    description: "AI-powered negotiation intelligence for UHNW deals.",
  });

  const [searchParams] = useSearchParams();
  const dealId = searchParams.get("deal");
  const [deal, setDeal] = useState<Deal | null>(null);
  const [outreachList, setOutreachList] = useState<VendorOutreach[]>([]);
  const [analysis, setAnalysis] = useState<NegotiationAnalysis | null>(null);
  const [simulations, setSimulations] = useState<Record<string, SimulationResult>>({});
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const [simulating, setSimulating] = useState<string | null>(null);
  const [expandedVendor, setExpandedVendor] = useState<string | null>(null);
  const [autoNegotiation, setAutoNegotiation] = useState(false);

  useEffect(() => {
    if (dealId) loadData(dealId);
  }, [dealId]);

  async function loadData(id: string) {
    setLoading(true);
    const { data: d } = await supabase.from("deals").select("*").eq("id", id).single();
    if (d) setDeal(d as unknown as Deal);
    const { data: outreach } = await supabase
      .from("vendor_outreach").select("*").eq("deal_id", id)
      .order("vendor_score", { ascending: false });
    if (outreach) setOutreachList(outreach as unknown as VendorOutreach[]);
    setLoading(false);
  }

  async function runAnalysis() {
    if (!dealId || analyzing) return;
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("negotiation-engine", {
        body: { action: "analyze", deal_id: dealId },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      setAnalysis(data as NegotiationAnalysis);
      toast.success("Negotiation analysis complete");

      // Send negotiation progress email (non-blocking)
      if (deal) {
        sendDealPhaseEmail({
          template: "deal_negotiation_progress",
          data: {
            dealNumber: deal.deal_number,
            vendorName: data.vendor_analyses?.[0]?.vendor_name || "",
            stage: "AI analysis complete",
          },
        });
      }
    } catch (e: any) {
      toast.error(e.message || "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleSendCounter(vendorName: string, message: string) {
    const outreach = outreachList.find(o =>
      o.vendor_name.toLowerCase().includes(vendorName.toLowerCase()) ||
      vendorName.toLowerCase().includes(o.vendor_name.toLowerCase())
    );
    if (!outreach) return toast.error("Vendor outreach not found");
    setSending(vendorName);
    try {
      const { error } = await supabase.functions.invoke("negotiation-engine", {
        body: { action: "counter_offer", outreach_id: outreach.id, approved_message: message },
      });
      if (error) throw new Error(error.message);
      toast.success("Counter-offer recorded and sent");
    } catch (e: any) {
      toast.error(e.message || "Failed to send counter-offer");
    } finally {
      setSending(null);
    }
  }

  async function handleSimulate(vendorName: string) {
    const outreach = outreachList.find(o =>
      o.vendor_name.toLowerCase().includes(vendorName.toLowerCase()) ||
      vendorName.toLowerCase().includes(o.vendor_name.toLowerCase())
    );
    if (!outreach) return toast.error("Vendor outreach not found");
    setSimulating(vendorName);
    try {
      const { data, error } = await supabase.functions.invoke("negotiation-engine", {
        body: { action: "simulate", outreach_id: outreach.id },
      });
      if (error) throw new Error(error.message);
      setSimulations(prev => ({ ...prev, [vendorName]: data as SimulationResult }));
      toast.success("Simulation complete");
    } catch (e: any) {
      toast.error(e.message || "Simulation failed");
    } finally {
      setSimulating(null);
    }
  }

  async function handleFinalize() {
    if (!dealId) return;
    try {
      const { error } = await supabase.functions.invoke("negotiation-engine", {
        body: { action: "finalize", deal_id: dealId },
      });
      if (error) throw new Error(error.message);
      toast.success("Negotiation complete — advancing to Workflow");
      window.location.href = `/workflow?deal=${dealId}`;
    } catch (e: any) {
      toast.error(e.message || "Finalization failed");
    }
  }

  const CatIcon = deal ? categoryIcons[deal.category] || Sparkles : Sparkles;
  const a = analysis;

  return (
    <DealPhaseLayout
      dealId={dealId}
      currentPhase={5}
      phaseTitle="Negotiation & Strategy"
      showBottomBar={!!a}
      onApprove={a ? handleFinalize : undefined}
      approveLabel="Proceed to Workflow"
    >
      <div className="flex-1 min-h-0">
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
                    Optimizing your negotiation strategy.
                  </h1>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="w-20 h-px bg-primary/40 origin-left mb-2"
                  />
                  <p className="font-body text-xs text-gold-soft/70">
                    Quantus A.I is preparing drafts, leverage points, and vendor-specific tactics.
                  </p>
                </div>
              </div>

              {/* Deal assessment stats */}
              {a && (
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: "Readiness", value: a.deal_assessment.overall_readiness, type: "ring" as const },
                    { label: "Confidence", value: a.deal_assessment.confidence_level, type: "ring" as const },
                    { label: "Market", value: a.deal_assessment.market_position?.replace("_", " "), type: "text" as const, icon: Scale },
                    { label: "Timeline", value: a.deal_assessment.recommended_timeline, type: "text" as const, icon: Clock },
                  ].map((s) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-4 flex flex-col items-center">
                      {s.type === "ring" ? (
                        <ScoreRing value={s.value as number} size={44} />
                      ) : (
                        <>
                          {s.icon && <s.icon size={14} className="text-primary/40 mb-1" />}
                          <p className="font-display text-sm text-foreground capitalize text-center">{s.value}</p>
                        </>
                      )}
                      <p className="font-body text-[9px] tracking-[0.15em] uppercase text-muted-foreground mt-1.5">{s.label}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Analyze CTA */}
            {!a && !analyzing && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-8 text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                  <Brain size={24} className="text-primary" />
                </div>
                <h2 className="font-display text-xl font-medium text-foreground mb-2">Ready to Negotiate</h2>
                <p className="font-body text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                  Quantus will analyze vendor positions, market dynamics, and craft strategic counter-offers.
                </p>
                <button
                  onClick={runAnalysis}
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground font-body text-xs tracking-[0.25em] uppercase hover:brightness-110 transition-all rounded-xl gold-glow"
                >
                  <Brain size={14} /> Analyze Negotiation Position
                </button>
              </motion.div>
            )}

            {/* Analyzing animation */}
            <AnimatePresence>
              {analyzing && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-16">
                  <div className="inline-flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full border-2 border-primary/20 flex items-center justify-center">
                      <Loader2 size={24} className="animate-spin text-primary" />
                    </div>
                    <p className="font-display text-lg text-foreground mb-1">Analyzing Negotiation Position</p>
                    <p className="font-body text-xs text-muted-foreground">Evaluating vendor positions, market dynamics, and leverage opportunities…</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 3-Column Strategic Grid */}
            {a && !analyzing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="grid lg:grid-cols-[280px_1fr_300px] gap-6">

                  {/* LEFT — Vendor Profiles & Leverage */}
                  <div className="space-y-3">
                    <p className="font-body text-[10px] tracking-[0.25em] uppercase text-gold-soft/50 mb-2">
                      Vendor Profiles
                    </p>
                    {a.vendor_analyses.map((v, i) => {
                      const MotIcon = motivationIcons[v.motivation_level] || Minus;
                      const isExpanded = expandedVendor === v.vendor_name;

                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -16 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.08 }}
                          className={`glass-card rounded-xl overflow-hidden transition-all ${isExpanded ? "border-primary/30" : "hover:border-gold-soft/20"}`}
                        >
                          <button
                            onClick={() => setExpandedVendor(isExpanded ? null : v.vendor_name)}
                            className="w-full text-left p-4 flex items-center gap-3"
                          >
                            <ScoreRing value={v.position_strength} size={40} />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-display text-xs text-foreground truncate">{v.vendor_name}</h3>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className={`text-[9px] font-body tracking-wider uppercase ${pricingColors[v.pricing_fairness]}`}>
                                  {v.pricing_fairness?.replace("_", " ")}
                                </span>
                                <span className="text-[9px] font-body text-muted-foreground flex items-center gap-0.5">
                                  <MotIcon size={8} /> {v.motivation_level}
                                </span>
                              </div>
                            </div>
                            {isExpanded ? <ChevronUp size={12} className="text-muted-foreground shrink-0" /> : <ChevronDown size={12} className="text-muted-foreground shrink-0" />}
                          </button>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                                <div className="px-4 pb-4 space-y-3 border-t border-border/50 pt-3">
                                  <div className="flex flex-wrap gap-1.5">
                                    <span className="px-2 py-0.5 bg-muted border border-border text-[9px] font-body text-muted-foreground rounded">
                                      {toneLabels[v.recommended_tone] || v.recommended_tone}
                                    </span>
                                    <span className="px-2 py-0.5 bg-muted border border-border text-[9px] font-body text-muted-foreground rounded">
                                      {approachLabels[v.recommended_approach] || v.recommended_approach}
                                    </span>
                                  </div>

                                  {/* Leverage points */}
                                  <div>
                                    <p className="font-body text-[9px] tracking-wider uppercase text-success/70 mb-1.5">Leverage Points</p>
                                    <ul className="space-y-1">
                                      {v.leverage_points?.map((p, j) => (
                                        <li key={j} className="font-body text-[10px] text-foreground/60 flex items-start gap-1.5">
                                          <CheckCircle2 size={8} className="text-success shrink-0 mt-0.5" /> {p}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>

                                  {/* Risk flags */}
                                  {v.risk_flags?.length > 0 && (
                                    <div>
                                      <p className="font-body text-[9px] tracking-wider uppercase text-accent/70 mb-1.5">Risk Flags</p>
                                      <ul className="space-y-1">
                                        {v.risk_flags.map((r, j) => (
                                          <li key={j} className="font-body text-[10px] text-foreground/60 flex items-start gap-1.5">
                                            <AlertTriangle size={8} className="text-accent shrink-0 mt-0.5" /> {r}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {/* Confidence dial */}
                                  <div className="flex items-center justify-between pt-2 border-t border-border/30">
                                    <span className="font-body text-[9px] text-muted-foreground">Accept Probability</span>
                                    <span className="font-display text-sm text-primary">{v.simulation?.acceptance_probability || 0}%</span>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* CENTER — Negotiation Drafts */}
                  <div className="space-y-4">
                    <p className="font-body text-[10px] tracking-[0.25em] uppercase text-gold-soft/50 mb-2">
                      Negotiation Drafts
                    </p>
                    {a.vendor_analyses.map((v, i) => (
                      <NegotiationDraftCard
                        key={i}
                        vendor={v}
                        index={i}
                        onSendCounter={handleSendCounter}
                        onSimulate={handleSimulate}
                        sending={sending}
                        simulation={simulations[v.vendor_name] || null}
                        simulating={simulating}
                      />
                    ))}
                  </div>

                  {/* RIGHT — Strategy Panel */}
                  <div className="space-y-4 lg:sticky lg:top-40">
                    <p className="font-body text-[10px] tracking-[0.25em] uppercase text-gold-soft/50 mb-2">
                      Quantus Core Strategy
                    </p>

                    {/* Strategy summary */}
                    <div className="glass-card rounded-xl p-5 border-primary/10">
                      <div className="flex items-center gap-2 mb-4">
                        <Target size={12} className="text-primary" />
                        <span className="font-display text-xs text-foreground">Recommended Approach</span>
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ delay: 0.5, duration: 0.6 }}
                          className="flex-1 h-px bg-primary/20 origin-left"
                        />
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="font-body text-[9px] tracking-wider uppercase text-muted-foreground mb-1">Primary</p>
                          <p className="font-body text-[11px] text-foreground/80 leading-relaxed">{a.strategy_summary.primary_strategy}</p>
                        </div>
                        <div>
                          <p className="font-body text-[9px] tracking-wider uppercase text-muted-foreground mb-1">Fallback</p>
                          <p className="font-body text-[11px] text-foreground/70 leading-relaxed">{a.strategy_summary.fallback_strategy}</p>
                        </div>
                      </div>
                    </div>

                    {/* Key leverage & push/avoid */}
                    <div className="glass-card rounded-xl p-5 border-primary/10">
                      <div className="space-y-3">
                        <div>
                          <p className="font-body text-[9px] tracking-wider uppercase text-success/70 mb-1.5">Key Leverage</p>
                          <ul className="space-y-1">
                            {a.strategy_summary.key_leverage?.map((l, i) => (
                              <li key={i} className="font-body text-[10px] text-foreground/60 flex items-start gap-1.5">
                                <CheckCircle2 size={8} className="text-success shrink-0 mt-0.5" /> {l}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="font-body text-[9px] tracking-wider uppercase text-primary/70 mb-1.5">Push For</p>
                          <ul className="space-y-1">
                            {a.strategy_summary.things_to_push?.map((p, i) => (
                              <li key={i} className="font-body text-[10px] text-foreground/60 flex items-start gap-1.5">
                                <ArrowRight size={8} className="text-primary shrink-0 mt-0.5" /> {p}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="font-body text-[9px] tracking-wider uppercase text-accent/70 mb-1.5">Avoid</p>
                          <ul className="space-y-1">
                            {a.strategy_summary.things_to_avoid?.map((av, i) => (
                              <li key={i} className="font-body text-[10px] text-foreground/60 flex items-start gap-1.5">
                                <AlertTriangle size={8} className="text-accent shrink-0 mt-0.5" /> {av}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Auto-Negotiation toggle */}
                    <div className="glass-card rounded-xl p-5 border-primary/10">
                      <button
                        onClick={() => setAutoNegotiation(!autoNegotiation)}
                        className="w-full flex items-center justify-between"
                      >
                        <div className="text-left">
                          <p className="font-body text-[11px] text-foreground">Auto-Negotiation</p>
                          <p className="font-body text-[9px] text-muted-foreground">Allow Quantus to negotiate automatically</p>
                        </div>
                        {autoNegotiation ? (
                          <ToggleRight size={20} className="text-primary shrink-0" />
                        ) : (
                          <ToggleLeft size={20} className="text-muted-foreground/40 shrink-0" />
                        )}
                      </button>
                    </div>

                    {/* Document checklist */}
                    {a.strategy_summary.document_checklist?.length > 0 && (
                      <div className="glass-card rounded-xl p-5 border-primary/10">
                        <div className="flex items-center gap-2 mb-3">
                          <FileText size={10} className="text-primary/60" />
                          <span className="font-body text-[10px] tracking-wider uppercase text-muted-foreground">Document Checklist</span>
                        </div>
                        <ul className="space-y-1.5">
                          {a.strategy_summary.document_checklist.map((d, i) => (
                            <li key={i} className="font-body text-[10px] text-foreground/60 flex items-start gap-1.5">
                              <div className="w-3 h-3 rounded border border-border shrink-0 mt-0.5" />
                              {d}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6"
                >
                  <button
                    onClick={handleFinalize}
                    className="w-full flex items-center justify-between glass-card rounded-xl p-5 border-primary/20 hover:border-primary/40 transition-all group"
                  >
                    <div className="text-left">
                      <p className="font-body text-[10px] tracking-[0.2em] uppercase text-primary/60 mb-1">Negotiation Complete</p>
                      <p className="font-body text-sm text-foreground">Advance to Workflow Orchestration</p>
                    </div>
                    <div className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-body text-[10px] tracking-[0.2em] uppercase rounded-lg group-hover:brightness-110 transition-all gold-glow">
                      Proceed to Workflow <ArrowRight size={12} />
                    </div>
                  </button>
                </motion.div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </DealPhaseLayout>
  );
}

/* Center column draft card */
function NegotiationDraftCard({
  vendor, index, onSendCounter, onSimulate, sending, simulation, simulating,
}: {
  vendor: VendorAnalysis;
  index: number;
  onSendCounter: (vendorName: string, message: string) => void;
  onSimulate: (vendorName: string) => void;
  sending: string | null;
  simulation: SimulationResult | null;
  simulating: string | null;
}) {
  const [editing, setEditing] = useState(false);
  const [counterText, setCounterText] = useState(vendor.counter_offer_draft);

  const scenarioColors: Record<string, string> = {
    best_case: "border-success/30 bg-success/5",
    likely_case: "border-primary/30 bg-primary/5",
    worst_case: "border-destructive/30 bg-destructive/5",
  };
  const scenarioLabels: Record<string, string> = {
    best_case: "Best Case", likely_case: "Likely Case", worst_case: "Worst Case",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="glass-card rounded-xl overflow-hidden border-primary/10 hover:border-primary/20 transition-all"
    >
      {/* Header */}
      <div className="p-5 pb-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <ScoreRing value={vendor.position_strength} size={36} />
            <div>
              <h3 className="font-display text-sm text-foreground">{vendor.vendor_name}</h3>
              <p className="font-body text-[9px] text-muted-foreground">
                {toneLabels[vendor.recommended_tone]} · {approachLabels[vendor.recommended_approach]}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-display text-lg text-primary">{vendor.simulation?.acceptance_probability || 0}%</p>
            <p className="font-body text-[8px] tracking-wider uppercase text-muted-foreground">Accept</p>
          </div>
        </div>

        {/* AI optimization notes */}
        <div className="flex flex-wrap gap-2 mb-3">
          {vendor.recommended_tone && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/5 border border-primary/10 text-[9px] font-body text-primary/70 rounded">
              <Sparkles size={8} /> Tone optimized for {vendor.recommended_tone.replace("_", " ")}
            </span>
          )}
          {vendor.pricing_fairness && (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 border border-border text-[9px] font-body rounded ${pricingColors[vendor.pricing_fairness]}`}>
              Price: {vendor.pricing_fairness.replace("_", " ")}
            </span>
          )}
        </div>
      </div>

      {/* Draft body */}
      <div className="px-5 pb-5">
        <div className="border border-primary/20 bg-card/50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="font-body text-[9px] tracking-[0.2em] uppercase text-primary/60">Counter-Offer Draft</p>
            <button onClick={() => setEditing(!editing)} className="font-body text-[9px] text-primary hover:underline">
              {editing ? "Preview" : "Edit"}
            </button>
          </div>
          {editing ? (
            <textarea
              value={counterText}
              onChange={(e) => setCounterText(e.target.value)}
              className="w-full h-36 bg-background border border-border rounded-lg p-3 font-body text-xs text-foreground resize-none focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground/40"
            />
          ) : (
            <p className="font-body text-[11px] text-foreground/70 whitespace-pre-wrap leading-relaxed">{counterText}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onSendCounter(vendor.vendor_name, counterText)}
            disabled={sending === vendor.vendor_name}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-primary text-primary-foreground font-body text-[9px] tracking-widest uppercase rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
          >
            {sending === vendor.vendor_name ? <Loader2 size={10} className="animate-spin" /> : <Send size={10} />}
            Approve & Send
          </button>
          <button
            onClick={() => onSimulate(vendor.vendor_name)}
            disabled={simulating === vendor.vendor_name}
            className="flex items-center gap-1.5 px-5 py-2.5 border border-border font-body text-[9px] tracking-widest uppercase text-muted-foreground hover:text-foreground rounded-lg transition-all disabled:opacity-50"
          >
            {simulating === vendor.vendor_name ? <Loader2 size={10} className="animate-spin" /> : <Brain size={10} />}
            Run Simulation
          </button>
        </div>

        {/* Simulation results */}
        {simulation && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 space-y-3 pt-4 border-t border-border/50">
            <p className="font-body text-[9px] tracking-[0.2em] uppercase text-primary/60">Simulation Results</p>
            <div className="grid gap-2">
              {simulation.scenarios.map((s, i) => (
                <div key={i} className={`border rounded-lg p-3 ${scenarioColors[s.label] || "border-border bg-muted/10"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-display text-xs text-foreground">{scenarioLabels[s.label] || s.label}</span>
                    <span className="font-display text-sm text-primary">{s.probability}%</span>
                  </div>
                  <p className="font-body text-[10px] text-foreground/70 mb-1">{s.outcome}</p>
                  <div className="flex flex-wrap gap-2 text-[9px] font-body text-muted-foreground">
                    {s.final_price_estimate && <span>Est: {s.final_price_estimate}</span>}
                    <span>{s.rounds_to_close} round{s.rounds_to_close > 1 ? "s" : ""}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="border border-primary/20 bg-primary/5 p-3 rounded-lg">
              <p className="font-body text-[9px] text-primary mb-1">Next Move</p>
              <p className="font-body text-[10px] text-foreground/70">{simulation.recommended_next_move}</p>
            </div>
            {simulation.timing_advice && (
              <p className="font-body text-[9px] text-muted-foreground flex items-center gap-1">
                <Clock size={8} /> {simulation.timing_advice}
              </p>
            )}
            {simulation.walk_away_recommendation && (
              <p className="font-body text-[9px] text-destructive flex items-center gap-1">
                <AlertTriangle size={8} /> AI recommends considering walk-away
              </p>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
