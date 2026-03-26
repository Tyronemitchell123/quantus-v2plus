import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plane, Heart, Users, Globe, Truck, Handshake, Sparkles, Loader2,
  CheckCircle2, AlertTriangle, Shield, DollarSign, MapPin, Clock,
  ArrowRight, ChevronDown, ChevronUp, Star, Mail, Phone, FileText,
  ArrowLeft, Zap,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import useDocumentHead from "@/hooks/use-document-head";

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

const tierLabels: Record<string, { label: string; color: string; bg: string }> = {
  primary: { label: "Top Pick", color: "text-primary", bg: "bg-primary/10 border-primary/30" },
  secondary: { label: "Strong Alternative", color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/30" },
  wildcard: { label: "Wildcard", color: "text-purple-400", bg: "bg-purple-400/10 border-purple-400/30" },
};

const riskColors: Record<string, string> = {
  low: "text-emerald-400", medium: "text-amber-400", high: "text-red-400",
};

function formatCurrency(value: number | null, currency = "USD") {
  if (!value) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
}

function ScoreRing({ score, size = 56 }: { score: number; size?: number }) {
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const color = score >= 85 ? "stroke-primary" : score >= 70 ? "stroke-blue-400" : score >= 55 ? "stroke-amber-400" : "stroke-muted-foreground";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth={3} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          className={color} strokeWidth={3} strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-display text-sm text-foreground">{score}</span>
    </div>
  );
}

function OptionCard({ result, expanded, onToggle }: { result: SourcingResult; expanded: boolean; onToggle: () => void }) {
  const tierInfo = tierLabels[result.tier] || tierLabels.secondary;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border bg-card overflow-hidden transition-colors ${expanded ? "border-primary/30" : "border-border hover:border-border/80"}`}
    >
      {/* Header */}
      <button onClick={onToggle} className="w-full text-left p-5 flex items-center gap-4">
        <ScoreRing score={result.overall_score} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 text-[10px] font-body tracking-widest uppercase border ${tierInfo.bg} ${tierInfo.color}`}>
              {tierInfo.label}
            </span>
            <span className={`text-[10px] font-body uppercase tracking-wider ${riskColors[result.risk_level]}`}>
              {result.risk_level} risk
            </span>
          </div>
          <h3 className="font-display text-lg text-foreground truncate">{result.name}</h3>
          <p className="font-body text-xs text-muted-foreground line-clamp-1">{result.description}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-display text-lg text-primary">{formatCurrency(result.estimated_cost, result.cost_currency)}</p>
          {result.location && (
            <p className="font-body text-[10px] text-muted-foreground flex items-center gap-1 justify-end">
              <MapPin size={10} /> {result.location}
            </p>
          )}
        </div>
        {expanded ? <ChevronUp size={16} className="text-muted-foreground shrink-0" /> : <ChevronDown size={16} className="text-muted-foreground shrink-0" />}
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-5 border-t border-border/50 pt-5">
              {/* Description */}
              <p className="font-body text-sm text-foreground/80 leading-relaxed">{result.description}</p>

              {/* Score Breakdown */}
              {Object.keys(result.score_breakdown).length > 0 && (
                <div>
                  <p className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">Score Breakdown</p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(result.score_breakdown).map(([factor, score]) => (
                      <div key={factor} className="flex items-center justify-between gap-2">
                        <span className="font-body text-xs text-muted-foreground truncate">{factor}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full rounded-full ${Number(score) >= 80 ? "bg-primary" : Number(score) >= 60 ? "bg-blue-400" : "bg-amber-400"}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${score}%` }}
                              transition={{ duration: 0.6 }}
                            />
                          </div>
                          <span className="font-mono text-[10px] text-foreground w-6 text-right">{score}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pros & Cons */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="font-body text-xs tracking-[0.2em] uppercase text-emerald-400/70 mb-2">Advantages</p>
                  <ul className="space-y-1.5">
                    {result.pros.map((pro, i) => (
                      <li key={i} className="font-body text-xs text-foreground/70 flex items-start gap-2">
                        <CheckCircle2 size={12} className="text-emerald-400 shrink-0 mt-0.5" />
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-body text-xs tracking-[0.2em] uppercase text-amber-400/70 mb-2">Considerations</p>
                  <ul className="space-y-1.5">
                    {result.cons.map((con, i) => (
                      <li key={i} className="font-body text-xs text-foreground/70 flex items-start gap-2">
                        <AlertTriangle size={12} className="text-amber-400 shrink-0 mt-0.5" />
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Specifications */}
              {Object.keys(result.specifications).length > 0 && (
                <div>
                  <p className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground mb-2">Specifications</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(result.specifications).map(([key, val]) => (
                      <span key={key} className="px-2 py-1 bg-muted border border-border text-[10px] font-body text-foreground/70">
                        <span className="text-muted-foreground">{key}:</span> {String(val)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Availability & Vendor */}
              <div className="grid sm:grid-cols-2 gap-4">
                {result.availability && (
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-primary/60" />
                    <span className="font-body text-xs text-foreground/80">{result.availability}</span>
                  </div>
                )}
                {result.vendor_contact?.company && (
                  <div className="space-y-1">
                    <p className="font-body text-xs text-muted-foreground">Vendor</p>
                    <p className="font-body text-xs text-foreground">{result.vendor_contact.company}</p>
                    {result.vendor_contact.contact_name && (
                      <p className="font-body text-[10px] text-muted-foreground">{result.vendor_contact.contact_name}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Vendor Prep */}
              {result.vendor_prep?.negotiation_angle && (
                <div className="border border-border/50 bg-muted/30 p-4 space-y-2">
                  <p className="font-body text-xs tracking-[0.2em] uppercase text-primary/60">Vendor Prep</p>
                  <p className="font-body text-xs text-foreground/70"><span className="text-muted-foreground">Negotiation:</span> {result.vendor_prep.negotiation_angle}</p>
                  {result.vendor_prep.risk_notes && (
                    <p className="font-body text-xs text-foreground/70"><span className="text-muted-foreground">Risk:</span> {result.vendor_prep.risk_notes}</p>
                  )}
                  {result.vendor_prep.required_documents?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {result.vendor_prep.required_documents.map((doc: string, i: number) => (
                        <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-card border border-border text-[10px] font-body text-muted-foreground">
                          <FileText size={9} /> {doc}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Next Step */}
              {result.recommended_next_step && (
                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <p className="font-body text-xs text-muted-foreground">Recommended Next Step</p>
                  <span className="font-body text-xs text-primary flex items-center gap-1">
                    {result.recommended_next_step} <ArrowRight size={12} />
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

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
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [presentationMessage, setPresentationMessage] = useState("");

  useEffect(() => {
    if (dealId) loadDeal(dealId);
  }, [dealId]);

  async function loadDeal(id: string) {
    setLoading(true);
    const { data: d } = await supabase.from("deals").select("*").eq("id", id).single();
    if (d) {
      setDeal(d as unknown as Deal);
      // Load existing results
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
  const primary = results.filter((r) => r.tier === "primary");
  const secondary = results.filter((r) => r.tier === "secondary");
  const wildcards = results.filter((r) => r.tier === "wildcard");

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-6 max-w-5xl">
        {/* Back link */}
        <Link to="/intake" className="inline-flex items-center gap-1.5 font-body text-xs text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft size={14} /> Back to Intake
        </Link>

        {loading ? (
          <div className="text-center py-20">
            <Loader2 size={24} className="animate-spin text-primary mx-auto" />
          </div>
        ) : !deal ? (
          <div className="text-center py-20">
            <p className="font-body text-sm text-muted-foreground">No deal selected. <Link to="/intake" className="text-primary hover:underline">Submit a request first</Link>.</p>
          </div>
        ) : (
          <>
            {/* Deal Summary Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-card border border-border flex items-center justify-center">
                  <CatIcon size={20} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-body text-xs tracking-[0.3em] uppercase text-primary/60 mb-1">Phase 2 — Sourcing Engine</p>
                  <h1 className="font-display text-3xl md:text-4xl font-medium text-foreground mb-2">{deal.intent || deal.sub_category}</h1>
                  <div className="flex flex-wrap gap-3 font-body text-xs text-muted-foreground">
                    <span className="capitalize">{deal.category}</span>
                    <span>·</span>
                    <span>{deal.deal_number}</span>
                    <span>·</span>
                    <span>Priority: {deal.priority_score}</span>
                    {deal.budget_max && (
                      <>
                        <span>·</span>
                        <span>Budget: {formatCurrency(deal.budget_max, deal.budget_currency)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Run Sourcing or Show Results */}
              {results.length === 0 && !sourcing && (
                <button
                  onClick={runSourcing}
                  className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground font-body text-xs tracking-widest uppercase hover:bg-primary/90 transition-all"
                >
                  <Zap size={14} /> Begin Sourcing
                </button>
              )}
            </motion.div>

            {/* Sourcing in progress */}
            <AnimatePresence>
              {sourcing && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-16">
                  <div className="inline-flex flex-col items-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full border-2 border-primary/20 flex items-center justify-center">
                        <Loader2 size={24} className="animate-spin text-primary" />
                      </div>
                    </div>
                    <div>
                      <p className="font-body text-sm text-foreground mb-1">Sourcing in progress...</p>
                      <p className="font-body text-xs text-muted-foreground">Quantus A.I is scanning markets, evaluating options, and curating your shortlist.</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Results */}
            {results.length > 0 && !sourcing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                {/* Presentation Message */}
                {presentationMessage && (
                  <div className="border border-primary/20 bg-card p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Star size={18} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-body text-xs tracking-[0.2em] uppercase text-primary/60 mb-2">Quantus A.I</p>
                        <p className="font-body text-sm text-foreground/90 leading-relaxed italic">"{presentationMessage}"</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Summary Stats */}
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: "Total Options", value: results.length, icon: Sparkles },
                    { label: "Top Picks", value: primary.length, icon: Star },
                    { label: "Avg Score", value: Math.round(results.reduce((s, r) => s + r.overall_score, 0) / results.length), icon: Zap },
                    { label: "Best Match", value: results[0]?.overall_score || 0, icon: CheckCircle2 },
                  ].map((stat) => (
                    <div key={stat.label} className="border border-border bg-card p-4 text-center">
                      <stat.icon size={14} className="text-primary/50 mx-auto mb-2" />
                      <p className="font-display text-xl text-foreground">{stat.value}</p>
                      <p className="font-body text-[10px] text-muted-foreground tracking-wider uppercase">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Primary Options */}
                {primary.length > 0 && (
                  <div>
                    <p className="font-body text-xs tracking-[0.3em] uppercase text-primary/60 mb-4">Top Picks — Highest Confidence</p>
                    <div className="space-y-3">
                      {primary.map((r) => (
                        <OptionCard key={r.id} result={r} expanded={expandedId === r.id} onToggle={() => setExpandedId(expandedId === r.id ? null : r.id)} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Secondary Options */}
                {secondary.length > 0 && (
                  <div>
                    <p className="font-body text-xs tracking-[0.3em] uppercase text-blue-400/60 mb-4">Strong Alternatives</p>
                    <div className="space-y-3">
                      {secondary.map((r) => (
                        <OptionCard key={r.id} result={r} expanded={expandedId === r.id} onToggle={() => setExpandedId(expandedId === r.id ? null : r.id)} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Wildcards */}
                {wildcards.length > 0 && (
                  <div>
                    <p className="font-body text-xs tracking-[0.3em] uppercase text-purple-400/60 mb-4">Wildcard Options</p>
                    <div className="space-y-3">
                      {wildcards.map((r) => (
                        <OptionCard key={r.id} result={r} expanded={expandedId === r.id} onToggle={() => setExpandedId(expandedId === r.id ? null : r.id)} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Status Footer */}
                <Link to={`/outreach?deal=${dealId}`} className="flex items-center justify-between border border-primary/30 bg-card p-5 hover:border-primary/50 transition-colors group">
                  <div>
                    <p className="font-body text-xs text-muted-foreground">Status</p>
                    <p className="font-body text-sm text-foreground">Sourcing Complete — Ready for Vendor Outreach</p>
                  </div>
                  <div className="flex items-center gap-2 text-primary font-body text-xs tracking-widest uppercase group-hover:gap-3 transition-all">
                    <span>Begin Phase 3 — Vendor Outreach</span>
                    <ArrowRight size={14} />
                  </div>
                </Link>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
