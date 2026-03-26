import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plane, Heart, Users, Globe, Truck, Handshake, Sparkles, Loader2,
  CheckCircle2, MapPin, DollarSign, Shield, Star, Clock,
  ArrowRight, Bookmark, RefreshCw, LayoutGrid, Columns, Eye,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import useDocumentHead from "@/hooks/use-document-head";
import DealPhaseLayout from "@/components/deal/DealPhaseLayout";
import ShortlistCards from "@/components/shortlist/ShortlistCards";
import ShortlistFilters from "@/components/shortlist/ShortlistFilters";
import ShortlistInsights from "@/components/shortlist/ShortlistInsights";

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
  ai_notes: string | null;
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
  budget_currency: string;
};

const categoryIcons: Record<string, typeof Plane> = {
  aviation: Plane, medical: Heart, staffing: Users,
  lifestyle: Globe, logistics: Truck, partnerships: Handshake,
};

export default function Shortlisting() {
  useDocumentHead({
    title: "Shortlisting — Quantus A.I",
    description: "Your curated shortlist of top options.",
  });

  const [searchParams] = useSearchParams();
  const dealId = searchParams.get("deal");
  const [deal, setDeal] = useState<Deal | null>(null);
  const [results, setResults] = useState<SourcingResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"score" | "price" | "privacy">("score");
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    if (dealId) loadData(dealId);
  }, [dealId]);

  async function loadData(id: string) {
    setLoading(true);
    const { data: d } = await supabase.from("deals").select("*").eq("id", id).single();
    if (d) setDeal(d as unknown as Deal);

    const { data: r } = await supabase
      .from("sourcing_results")
      .select("*")
      .eq("deal_id", id)
      .order("overall_score", { ascending: false });

    if (r) setResults(r as unknown as SourcingResult[]);
    setLoading(false);
  }

  const sorted = [...results].sort((a, b) => {
    if (sortBy === "price") return (a.estimated_cost || 0) - (b.estimated_cost || 0);
    if (sortBy === "privacy") return (b.score_breakdown?.privacy || 0) - (a.score_breakdown?.privacy || 0);
    return b.overall_score - a.overall_score;
  });

  // Top 3 for the cinematic grid
  const topOptions = sorted.slice(0, 3);
  const selectedOption = results.find((r) => r.id === selectedId);
  const CatIcon = deal ? categoryIcons[deal.category] || Sparkles : Sparkles;

  return (
    <DealPhaseLayout
      dealId={dealId}
      currentPhase={4}
      phaseTitle="Shortlisting & Curation"
      showBottomBar={!!selectedId}
      onApprove={selectedId ? () => window.location.href = `/negotiation?deal=${dealId}` : undefined}
      approveLabel="Proceed with Selected Option"
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
        ) : results.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-body text-sm text-muted-foreground">
              No sourcing results yet.{" "}
              <Link to={`/sourcing?deal=${dealId}`} className="text-primary hover:underline">Run sourcing first</Link>.
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
                    Your curated shortlist is ready.
                  </h1>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="w-20 h-px bg-primary/40 origin-left mb-2"
                  />
                  <p className="font-body text-xs text-gold-soft/70">
                    Quantus A.I has filtered, ranked, and optimized the best options for you.
                  </p>
                </div>
              </div>

              {/* Action bar */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setShowComparison(!showComparison)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 font-body text-[10px] tracking-[0.15em] uppercase border rounded-lg transition-all ${
                    showComparison ? "border-primary/40 bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/20"
                  }`}
                >
                  <Columns size={10} /> Compare
                </button>
                <button className="flex items-center gap-1.5 px-3.5 py-2 font-body text-[10px] tracking-[0.15em] uppercase border border-border text-muted-foreground hover:border-primary/20 rounded-lg transition-all">
                  <RefreshCw size={10} /> More Options
                </button>
              </div>
            </motion.div>

            {/* 3-column layout */}
            <div className="grid lg:grid-cols-[240px_1fr_280px] gap-6">
              {/* Left — Filters */}
              <ShortlistFilters
                sortBy={sortBy}
                setSortBy={setSortBy}
                totalOptions={results.length}
              />

              {/* Center — Cinematic Cards */}
              <div>
                {showComparison ? (
                  <ComparisonMatrix options={topOptions} selectedId={selectedId} onSelect={setSelectedId} />
                ) : (
                  <ShortlistCards
                    options={topOptions}
                    allOptions={sorted}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                  />
                )}
              </div>

              {/* Right — Insights */}
              <ShortlistInsights
                options={topOptions}
                selectedId={selectedId}
                category={deal.category}
              />
            </div>

            {/* Selected CTA */}
            {selectedOption && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
              >
                <Link
                  to={`/negotiation?deal=${dealId}`}
                  className="flex items-center justify-between glass-card rounded-xl p-5 border-primary/20 hover:border-primary/40 transition-all group"
                >
                  <div>
                    <p className="font-body text-[10px] tracking-[0.2em] uppercase text-primary/60 mb-1">Selected Option</p>
                    <p className="font-body text-sm text-foreground">{selectedOption.name} — Score {selectedOption.overall_score}</p>
                  </div>
                  <div className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-body text-[10px] tracking-[0.2em] uppercase rounded-lg group-hover:brightness-110 transition-all gold-glow">
                    Proceed to Negotiation <ArrowRight size={12} />
                  </div>
                </Link>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </DealPhaseLayout>
  );
}

/* Comparison Matrix */
function ComparisonMatrix({ options, selectedId, onSelect }: {
  options: SourcingResult[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const formatCurrency = (v: number | null, c = "USD") => v ? new Intl.NumberFormat("en-US", { style: "currency", currency: c, maximumFractionDigits: 0 }).format(v) : "—";

  const rows = ["Price", "Score", "Risk", "Availability", "Location"];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              <th className="p-3 text-left font-body text-[9px] tracking-[0.2em] uppercase text-muted-foreground">Metric</th>
              {options.map((o) => (
                <th key={o.id} className="p-3 text-center">
                  <button
                    onClick={() => onSelect(o.id)}
                    className={`font-display text-xs transition-all ${
                      selectedId === o.id ? "text-primary" : "text-foreground hover:text-primary"
                    }`}
                  >
                    {o.name.length > 20 ? o.name.substring(0, 20) + "…" : o.name}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row} className="border-b border-border/30">
                <td className="p-3 font-body text-[10px] text-muted-foreground">{row}</td>
                {options.map((o) => (
                  <td key={o.id} className={`p-3 text-center font-body text-xs ${selectedId === o.id ? "bg-primary/5" : ""}`}>
                    {row === "Price" && formatCurrency(o.estimated_cost, o.cost_currency)}
                    {row === "Score" && <span className="text-primary font-medium">{o.overall_score}</span>}
                    {row === "Risk" && <span className={`capitalize ${o.risk_level === "low" ? "text-success" : o.risk_level === "high" ? "text-destructive" : "text-accent"}`}>{o.risk_level}</span>}
                    {row === "Availability" && (o.availability || "—")}
                    {row === "Location" && (o.location || "—")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
