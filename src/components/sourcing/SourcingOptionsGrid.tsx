import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, AlertTriangle, MapPin, Clock, ChevronDown, ChevronUp,
  Star, FileText, ArrowRight, Filter,
} from "lucide-react";

type SourcingResult = {
  id: string;
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
};

const tierLabels: Record<string, { label: string; color: string }> = {
  primary: { label: "Top Pick", color: "text-primary border-primary/30 bg-primary/10" },
  secondary: { label: "Alternative", color: "text-accent border-accent/30 bg-accent/10" },
  wildcard: { label: "Wildcard", color: "text-muted-foreground border-border bg-secondary/30" },
};

const riskColors: Record<string, string> = {
  low: "text-success", medium: "text-primary", high: "text-destructive",
};

function formatCurrency(value: number | null, currency = "USD") {
  if (!value) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
}

function ScoreRing({ score, size = 48 }: { score: number; size?: number }) {
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth={3} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          className="stroke-primary" strokeWidth={3} strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-display text-xs text-foreground">{score}</span>
    </div>
  );
}

interface Props {
  results: SourcingResult[];
}

const SourcingOptionsGrid = ({ results }: Props) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"score" | "price">("score");

  const sorted = [...results].sort((a, b) => {
    if (sortBy === "price") return (a.estimated_cost || 0) - (b.estimated_cost || 0);
    return b.overall_score - a.overall_score;
  });

  const primary = sorted.filter(r => r.tier === "primary");
  const secondary = sorted.filter(r => r.tier === "secondary");
  const wildcards = sorted.filter(r => r.tier === "wildcard");

  const renderGroup = (label: string, items: SourcingResult[]) => {
    if (items.length === 0) return null;
    return (
      <div className="space-y-3">
        <p className="font-body text-[10px] tracking-[0.25em] uppercase text-primary/60">{label}</p>
        {items.map((r, i) => {
          const expanded = expandedId === r.id;
          const tierInfo = tierLabels[r.tier] || tierLabels.secondary;

          return (
            <motion.div
              key={r.id}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`glass-card rounded-xl overflow-hidden transition-all ${
                expanded ? "border-primary/30" : "hover:border-gold-soft/20"
              }`}
            >
              <button onClick={() => setExpandedId(expanded ? null : r.id)} className="w-full text-left p-4 flex items-center gap-3">
                <ScoreRing score={r.overall_score} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 text-[9px] font-body tracking-widest uppercase border rounded ${tierInfo.color}`}>
                      {tierInfo.label}
                    </span>
                    <span className={`text-[9px] font-body uppercase tracking-wider ${riskColors[r.risk_level]}`}>
                      {r.risk_level} risk
                    </span>
                  </div>
                  <h3 className="font-display text-sm text-foreground truncate">{r.name}</h3>
                  <p className="font-body text-[10px] text-muted-foreground line-clamp-1">{r.description}</p>
                </div>
                <div className="text-right shrink-0 hidden sm:block">
                  <p className="font-display text-sm text-primary">{formatCurrency(r.estimated_cost, r.cost_currency)}</p>
                  {r.location && (
                    <p className="font-body text-[9px] text-muted-foreground flex items-center gap-1 justify-end">
                      <MapPin size={8} /> {r.location}
                    </p>
                  )}
                </div>
                {expanded ? <ChevronUp size={14} className="text-muted-foreground shrink-0" /> : <ChevronDown size={14} className="text-muted-foreground shrink-0" />}
              </button>

              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-4 border-t border-border/50 pt-4">
                      <p className="font-body text-xs text-foreground/80 leading-relaxed">{r.description}</p>

                      {Object.keys(r.score_breakdown).length > 0 && (
                        <div>
                          <p className="font-body text-[9px] tracking-[0.2em] uppercase text-muted-foreground mb-2">Score Breakdown</p>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(r.score_breakdown).map(([factor, score]) => (
                              <div key={factor} className="flex items-center justify-between gap-2">
                                <span className="font-body text-[10px] text-muted-foreground truncate">{factor}</span>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
                                    <motion.div
                                      className="h-full rounded-full bg-primary"
                                      initial={{ width: 0 }}
                                      animate={{ width: `${score}%` }}
                                      transition={{ duration: 0.6 }}
                                    />
                                  </div>
                                  <span className="font-body text-[9px] text-foreground w-5 text-right">{score}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        {r.pros?.length > 0 && (
                          <div>
                            <p className="font-body text-[9px] tracking-[0.15em] uppercase text-success/70 mb-1.5">Advantages</p>
                            <ul className="space-y-1">
                              {r.pros.map((pro, j) => (
                                <li key={j} className="font-body text-[10px] text-foreground/70 flex items-start gap-1.5">
                                  <CheckCircle2 size={10} className="text-success shrink-0 mt-0.5" />
                                  {pro}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {r.cons?.length > 0 && (
                          <div>
                            <p className="font-body text-[9px] tracking-[0.15em] uppercase text-primary/70 mb-1.5">Considerations</p>
                            <ul className="space-y-1">
                              {r.cons.map((con, j) => (
                                <li key={j} className="font-body text-[10px] text-foreground/70 flex items-start gap-1.5">
                                  <AlertTriangle size={10} className="text-primary shrink-0 mt-0.5" />
                                  {con}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {r.recommended_next_step && (
                        <div className="flex items-center justify-between pt-3 border-t border-border/50">
                          <p className="font-body text-[10px] text-muted-foreground">Next Step</p>
                          <span className="font-body text-[10px] text-primary flex items-center gap-1">
                            {r.recommended_next_step} <ArrowRight size={10} />
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Sort filters */}
      <div className="flex items-center gap-2">
        <p className="font-body text-[10px] tracking-[0.25em] uppercase text-gold-soft/50 flex-1">
          Options ({results.length})
        </p>
        <div className="flex gap-1">
          {(["score", "price"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`px-3 py-1.5 font-body text-[9px] tracking-wider uppercase border rounded-lg transition-all ${
                sortBy === s
                  ? "border-primary/30 bg-primary/5 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/20"
              }`}
            >
              {s === "score" ? "By Score" : "By Price"}
            </button>
          ))}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Options", value: results.length },
          { label: "Top Picks", value: primary.length },
          { label: "Avg Score", value: Math.round(results.reduce((s, r) => s + r.overall_score, 0) / results.length) },
          { label: "Best", value: results[0]?.overall_score || 0 },
        ].map((stat) => (
          <div key={stat.label} className="glass-card rounded-lg p-3 text-center">
            <p className="font-display text-base text-primary">{stat.value}</p>
            <p className="font-body text-[8px] tracking-[0.15em] uppercase text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {renderGroup("Top Picks — Highest Confidence", primary)}
      {renderGroup("Strong Alternatives", secondary)}
      {renderGroup("Wildcard Options", wildcards)}
    </div>
  );
};

export default SourcingOptionsGrid;
