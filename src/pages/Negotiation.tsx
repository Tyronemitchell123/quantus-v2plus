import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plane, Heart, Users, Globe, Truck, Handshake, Sparkles, Loader2,
  ArrowLeft, ArrowRight, Target, Shield, ChevronDown, ChevronUp,
  TrendingUp, TrendingDown, Minus, Zap, Brain, Send, CheckCircle2,
  AlertTriangle, Scale, Clock, BarChart3, Eye, MessageSquare, Gavel,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import useDocumentHead from "@/hooks/use-document-head";

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
};

const pricingColors: Record<string, string> = {
  below_market: "text-emerald-400",
  fair: "text-blue-400",
  above_market: "text-amber-400",
  premium: "text-red-400",
};

const motivationIcons: Record<string, typeof TrendingUp> = {
  low: TrendingDown,
  medium: Minus,
  high: TrendingUp,
  urgent: Zap,
};

const toneLabels: Record<string, string> = {
  ultra_formal: "Ultra-Formal",
  discreet: "Discreet",
  assertive: "Assertive",
  exploratory: "Exploratory",
  high_urgency: "High Urgency",
  soft_touch: "Soft Touch",
};

const approachLabels: Record<string, string> = {
  price_reduction: "Price Reduction",
  added_value: "Added Value",
  faster_timeline: "Faster Timeline",
  bundled_services: "Bundled Services",
  conditional_acceptance: "Conditional Acceptance",
  multi_option_leverage: "Multi-Option Leverage",
};

function ScoreRing({ value, size = 64, label }: { value: number; size?: number; label?: string }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  const color = value >= 75 ? "stroke-emerald-400" : value >= 50 ? "stroke-primary" : value >= 25 ? "stroke-amber-400" : "stroke-red-400";

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={4} className="stroke-border" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={4}
          className={color}
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
        />
        <text
          x={size / 2} y={size / 2}
          textAnchor="middle" dominantBaseline="central"
          className="fill-foreground font-display text-sm rotate-90"
          style={{ transformOrigin: `${size / 2}px ${size / 2}px` }}
        >
          {value}
        </text>
      </svg>
      {label && <span className="font-body text-[9px] tracking-wider uppercase text-muted-foreground">{label}</span>}
    </div>
  );
}

function VendorNegotiationCard({
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
  const [expanded, setExpanded] = useState(false);
  const [editingCounter, setEditingCounter] = useState(false);
  const [counterText, setCounterText] = useState(vendor.counter_offer_draft);
  const MotIcon = motivationIcons[vendor.motivation_level] || Minus;

  const scenarioColors: Record<string, string> = {
    best_case: "border-emerald-400/30 bg-emerald-400/5",
    likely_case: "border-primary/30 bg-primary/5",
    worst_case: "border-red-400/30 bg-red-400/5",
  };
  const scenarioLabels: Record<string, string> = {
    best_case: "Best Case",
    likely_case: "Likely Case",
    worst_case: "Worst Case",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`border bg-card overflow-hidden transition-colors ${expanded ? "border-primary/30" : "border-border hover:border-border/80"}`}
    >
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left p-5 flex items-center gap-4">
        <ScoreRing value={vendor.position_strength} size={48} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-[10px] font-body tracking-widest uppercase ${pricingColors[vendor.pricing_fairness] || "text-muted-foreground"}`}>
              {vendor.pricing_fairness?.replace("_", " ")}
            </span>
            <span className="text-[10px] font-body text-muted-foreground flex items-center gap-0.5">
              <MotIcon size={9} /> {vendor.motivation_level}
            </span>
          </div>
          <h3 className="font-display text-base text-foreground truncate">{vendor.vendor_name}</h3>
          <p className="font-body text-xs text-muted-foreground mt-0.5">
            {toneLabels[vendor.recommended_tone] || vendor.recommended_tone} · {approachLabels[vendor.recommended_approach] || vendor.recommended_approach}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-display text-lg text-primary">{vendor.simulation?.acceptance_probability || 0}%</p>
          <p className="font-body text-[9px] text-muted-foreground tracking-wider uppercase">Accept Prob.</p>
        </div>
        {expanded ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-5 pb-5 space-y-5 border-t border-border/50 pt-5">

              {/* Leverage & Risks */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="font-body text-[10px] tracking-[0.2em] uppercase text-emerald-400/70 mb-2">Leverage Points</p>
                  <ul className="space-y-1.5">
                    {vendor.leverage_points?.map((p, i) => (
                      <li key={i} className="font-body text-xs text-foreground/60 flex items-start gap-1.5">
                        <CheckCircle2 size={10} className="text-emerald-400 shrink-0 mt-0.5" /> {p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-body text-[10px] tracking-[0.2em] uppercase text-amber-400/70 mb-2">Risk Flags</p>
                  <ul className="space-y-1.5">
                    {vendor.risk_flags?.map((r, i) => (
                      <li key={i} className="font-body text-xs text-foreground/60 flex items-start gap-1.5">
                        <AlertTriangle size={10} className="text-amber-400 shrink-0 mt-0.5" /> {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Flexibility */}
              {vendor.flexibility_indicators && vendor.flexibility_indicators.length > 0 && (
                <div>
                  <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2">Flexibility Indicators</p>
                  <div className="flex flex-wrap gap-1.5">
                    {vendor.flexibility_indicators.map((f, i) => (
                      <span key={i} className="px-2 py-0.5 bg-muted border border-border text-[10px] font-body text-muted-foreground">{f}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Simulation Prediction */}
              {vendor.simulation && (
                <div className="border border-border/50 bg-muted/20 p-4 space-y-3">
                  <p className="font-body text-[10px] tracking-[0.2em] uppercase text-primary/70">AI Prediction</p>
                  <p className="font-body text-xs text-foreground/70">{vendor.simulation.likely_response}</p>
                  {vendor.simulation.walk_away_threshold && (
                    <p className="font-body text-[10px] text-amber-400">
                      Walk-Away Threshold: {vendor.simulation.walk_away_threshold}
                    </p>
                  )}
                  {vendor.simulation.counter_scenarios && vendor.simulation.counter_scenarios.length > 0 && (
                    <div>
                      <p className="font-body text-[10px] text-muted-foreground mb-1">Counter-Counter Scenarios</p>
                      <ul className="space-y-1">
                        {vendor.simulation.counter_scenarios.map((s, i) => (
                          <li key={i} className="font-body text-[11px] text-foreground/50 pl-3 border-l border-border">{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Counter-Offer Draft */}
              <div className="border border-primary/20 bg-primary/5 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-body text-[10px] tracking-[0.2em] uppercase text-primary">Counter-Offer Draft</p>
                  <button
                    onClick={() => setEditingCounter(!editingCounter)}
                    className="font-body text-[10px] text-primary hover:underline"
                  >
                    {editingCounter ? "Preview" : "Edit"}
                  </button>
                </div>
                {editingCounter ? (
                  <textarea
                    value={counterText}
                    onChange={(e) => setCounterText(e.target.value)}
                    className="w-full h-40 bg-card border border-border p-3 font-body text-xs text-foreground resize-none focus:outline-none focus:border-primary/50"
                  />
                ) : (
                  <p className="font-body text-xs text-foreground/70 whitespace-pre-wrap leading-relaxed">{counterText}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-3 border-t border-border/50">
                <button
                  onClick={() => onSendCounter(vendor.vendor_name, counterText)}
                  disabled={sending === vendor.vendor_name}
                  className="flex items-center gap-1.5 px-5 py-2 bg-primary text-primary-foreground font-body text-[10px] tracking-widest uppercase hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  {sending === vendor.vendor_name ? <Loader2 size={10} className="animate-spin" /> : <Send size={10} />}
                  Approve & Send Counter
                </button>
                <button
                  onClick={() => onSimulate(vendor.vendor_name)}
                  disabled={simulating === vendor.vendor_name}
                  className="flex items-center gap-1.5 px-5 py-2 bg-muted border border-border text-foreground font-body text-[10px] tracking-widest uppercase hover:bg-muted/80 transition-all disabled:opacity-50"
                >
                  {simulating === vendor.vendor_name ? <Loader2 size={10} className="animate-spin" /> : <Brain size={10} />}
                  Run Simulation
                </button>
              </div>

              {/* Deep Simulation Results */}
              {simulation && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pt-3">
                  <p className="font-body text-[10px] tracking-[0.2em] uppercase text-primary">Negotiation Simulation</p>
                  <div className="grid gap-3">
                    {simulation.scenarios.map((s, i) => (
                      <div key={i} className={`border p-4 ${scenarioColors[s.label] || "border-border bg-muted/10"}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-display text-sm text-foreground">{scenarioLabels[s.label] || s.label}</span>
                          <span className="font-display text-lg text-primary">{s.probability}%</span>
                        </div>
                        <p className="font-body text-xs text-foreground/70 mb-2">{s.outcome}</p>
                        <div className="flex flex-wrap gap-3 text-[10px] font-body text-muted-foreground">
                          {s.final_price_estimate && <span>Est. Price: {s.final_price_estimate}</span>}
                          <span>{s.rounds_to_close} round{s.rounds_to_close > 1 ? "s" : ""} to close</span>
                        </div>
                        {s.key_concessions && s.key_concessions.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {s.key_concessions.map((c, ci) => (
                              <span key={ci} className="px-1.5 py-0.5 bg-background/50 border border-border text-[9px] font-body text-muted-foreground">{c}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="border border-primary/20 bg-primary/5 p-3">
                    <p className="font-body text-[10px] text-primary mb-1">Recommended Next Move</p>
                    <p className="font-body text-xs text-foreground/70">{simulation.recommended_next_move}</p>
                  </div>
                  {simulation.timing_advice && (
                    <p className="font-body text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock size={9} /> {simulation.timing_advice}
                    </p>
                  )}
                  {simulation.walk_away_recommendation && (
                    <p className="font-body text-[10px] text-red-400 flex items-center gap-1">
                      <AlertTriangle size={9} /> AI recommends considering walk-away
                    </p>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Negotiation() {
  useDocumentHead({
    title: "Negotiation Framework — Quantus A.I",
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

  useEffect(() => {
    if (dealId) loadData(dealId);
  }, [dealId]);

  async function loadData(id: string) {
    setLoading(true);
    const { data: d } = await supabase.from("deals").select("*").eq("id", id).single();
    if (d) setDeal(d as unknown as Deal);

    const { data: outreach } = await supabase
      .from("vendor_outreach")
      .select("*")
      .eq("deal_id", id)
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
      const { data, error } = await supabase.functions.invoke("negotiation-engine", {
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
      toast.success("Negotiation complete — advancing to Workflow Orchestration");
    } catch (e: any) {
      toast.error(e.message || "Finalization failed");
    }
  }

  const CatIcon = deal ? categoryIcons[deal.category] || Sparkles : Sparkles;
  const a = analysis;

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-6 max-w-5xl">
        <Link to={dealId ? `/outreach?deal=${dealId}` : "/outreach"} className="inline-flex items-center gap-1.5 font-body text-xs text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft size={14} /> Back to Vendor Outreach
        </Link>

        {loading ? (
          <div className="text-center py-20"><Loader2 size={24} className="animate-spin text-primary mx-auto" /></div>
        ) : !deal ? (
          <div className="text-center py-20">
            <p className="font-body text-sm text-muted-foreground">No deal selected. <Link to="/intake" className="text-primary hover:underline">Submit a request first</Link>.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-card border border-border flex items-center justify-center">
                  <CatIcon size={20} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-body text-xs tracking-[0.3em] uppercase text-primary/60 mb-1">Phase 4 — Negotiation Framework</p>
                  <h1 className="font-display text-3xl md:text-4xl font-medium text-foreground mb-2">{deal.intent || deal.sub_category || "Deal"}</h1>
                  <div className="flex flex-wrap gap-3 font-body text-xs text-muted-foreground">
                    <span className="capitalize">{deal.category}</span>
                    <span>·</span>
                    <span>{deal.deal_number}</span>
                    <span>·</span>
                    <span>{outreachList.filter(o => o.negotiation_ready).length} vendors negotiation-ready</span>
                  </div>
                </div>
              </div>

              {/* Analyze button or Assessment */}
              {!a && !analyzing && (
                <button onClick={runAnalysis}
                  className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground font-body text-xs tracking-widest uppercase hover:bg-primary/90 transition-all">
                  <Brain size={14} /> Analyze Negotiation Position
                </button>
              )}
            </motion.div>

            {/* Analyzing State */}
            <AnimatePresence>
              {analyzing && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-16">
                  <div className="inline-flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full border-2 border-primary/20 flex items-center justify-center">
                      <Loader2 size={24} className="animate-spin text-primary" />
                    </div>
                    <div>
                      <p className="font-display text-lg text-foreground mb-1">Analyzing Negotiation Position</p>
                      <p className="font-body text-xs text-muted-foreground">Evaluating vendor positions, market dynamics, and leverage opportunities…</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Analysis Results */}
            {a && !analyzing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">

                {/* Deal Assessment Cards */}
                <div>
                  <p className="font-body text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">Deal Assessment</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-card border border-border p-4 flex flex-col items-center">
                      <ScoreRing value={a.deal_assessment.overall_readiness} size={56} />
                      <p className="font-body text-[9px] tracking-wider uppercase text-muted-foreground mt-2">Readiness</p>
                    </div>
                    <div className="bg-card border border-border p-4 flex flex-col items-center">
                      <ScoreRing value={a.deal_assessment.confidence_level} size={56} />
                      <p className="font-body text-[9px] tracking-wider uppercase text-muted-foreground mt-2">Close Confidence</p>
                    </div>
                    <div className="bg-card border border-border p-4 flex flex-col items-center justify-center">
                      <Scale size={20} className="text-primary mb-2" />
                      <p className="font-display text-sm text-foreground capitalize">{a.deal_assessment.market_position?.replace("_", " ")}</p>
                      <p className="font-body text-[9px] tracking-wider uppercase text-muted-foreground mt-1">Market Position</p>
                    </div>
                    <div className="bg-card border border-border p-4 flex flex-col items-center justify-center">
                      <Clock size={20} className="text-primary mb-2" />
                      <p className="font-display text-sm text-foreground">{a.deal_assessment.recommended_timeline}</p>
                      <p className="font-body text-[9px] tracking-wider uppercase text-muted-foreground mt-1">Timeline</p>
                    </div>
                  </div>
                </div>

                {/* Strategy Summary */}
                <div className="border border-primary/20 bg-primary/5 p-6 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target size={14} className="text-primary" />
                    <p className="font-body text-xs tracking-[0.2em] uppercase text-primary">Negotiation Playbook</p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="font-body text-[10px] text-muted-foreground mb-1">Primary Strategy</p>
                      <p className="font-body text-xs text-foreground/80">{a.strategy_summary.primary_strategy}</p>
                    </div>
                    <div>
                      <p className="font-body text-[10px] text-muted-foreground mb-1">Fallback Strategy</p>
                      <p className="font-body text-xs text-foreground/80">{a.strategy_summary.fallback_strategy}</p>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4 pt-3 border-t border-primary/10">
                    <div>
                      <p className="font-body text-[10px] text-emerald-400/70 mb-1.5">Key Leverage</p>
                      <ul className="space-y-1">
                        {a.strategy_summary.key_leverage?.map((l, i) => (
                          <li key={i} className="font-body text-[11px] text-foreground/60 flex items-start gap-1">
                            <CheckCircle2 size={9} className="text-emerald-400 shrink-0 mt-0.5" /> {l}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-body text-[10px] text-emerald-400/70 mb-1.5">Push For</p>
                      <ul className="space-y-1">
                        {a.strategy_summary.things_to_push?.map((p, i) => (
                          <li key={i} className="font-body text-[11px] text-foreground/60 flex items-start gap-1">
                            <ArrowRight size={9} className="text-primary shrink-0 mt-0.5" /> {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-body text-[10px] text-amber-400/70 mb-1.5">Avoid</p>
                      <ul className="space-y-1">
                        {a.strategy_summary.things_to_avoid?.map((av, i) => (
                          <li key={i} className="font-body text-[11px] text-foreground/60 flex items-start gap-1">
                            <AlertTriangle size={9} className="text-amber-400 shrink-0 mt-0.5" /> {av}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Vendor Analyses */}
                <div>
                  <p className="font-body text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">Vendor Negotiation Positions</p>
                  <div className="space-y-3">
                    {a.vendor_analyses.map((v, i) => (
                      <VendorNegotiationCard
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
                </div>

                {/* Finalize */}
                <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <p className="font-display text-lg text-foreground">Ready to Close?</p>
                    <p className="font-body text-xs text-muted-foreground">Advance this deal to Phase 5 — Workflow Orchestration</p>
                  </div>
                  <Link to={`/workflow?deal=${dealId}`}
                    className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground font-body text-xs tracking-widest uppercase hover:bg-primary/90 transition-all">
                    <Gavel size={14} /> Begin Workflow <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
