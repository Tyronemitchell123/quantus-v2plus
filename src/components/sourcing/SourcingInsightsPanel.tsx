import { motion } from "framer-motion";
import { Sparkles, TrendingUp, TrendingDown, Shield, Clock, Lightbulb } from "lucide-react";

const categoryInsights: Record<string, string[]> = {
  aviation: [
    "Demand for super-mid jets is elevated this week.",
    "Two off-market aircraft match your criteria.",
    "Weather conditions may affect departure windows.",
    "Charter rates are softening in Q2 2026.",
  ],
  medical: [
    "Your preferred clinic has availability within 48 hours.",
    "Executive health screening slots are limited this month.",
    "New longevity program launched in Seoul.",
    "Travel advisory: visa requirements updated for Thailand.",
  ],
  staffing: [
    "Three candidates meet your privacy requirements.",
    "Background check processing times reduced to 72h.",
    "Estate management demand up 18% in London.",
    "New reference verification protocol available.",
  ],
  lifestyle: [
    "Peak season pricing begins in 3 weeks.",
    "Ultra-private villa inventory is limited in Mykonos.",
    "Yacht charter availability strong in the Mediterranean.",
    "Exclusive experience packages available for July.",
  ],
  logistics: [
    "Recovery fleet availability is high today.",
    "Traffic patterns suggest morning departures optimal.",
    "Insurance compliance verified for all operators.",
    "Route optimization identifies 15% faster path.",
  ],
  partnerships: [
    "Partner response times averaging under 2 hours.",
    "Commission structures updated for Q2.",
    "Three new vendors onboarded this week.",
    "Performance reviews due for 4 partners.",
  ],
};

interface Props {
  category: string;
  loading?: boolean;
  results?: { overall_score: number; risk_level: string; name: string }[];
}

const SourcingInsightsPanel = ({ category, loading, results }: Props) => {
  const insights = categoryInsights[category] || categoryInsights.aviation;

  return (
    <div className="space-y-3">
      <p className="font-body text-[10px] tracking-[0.25em] uppercase text-gold-soft/50 mb-2">
        Quantus Core Observations
      </p>

      <div className="glass-card rounded-xl p-5 border-primary/10">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={12} className="text-primary" />
          <span className="font-display text-xs text-foreground">Intelligence Feed</span>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex-1 h-px bg-primary/20 origin-left"
          />
        </div>

        <div className="space-y-3">
          {insights.map((insight, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: loading ? i * 1.2 : i * 0.15 }}
              className="flex items-start gap-2.5"
            >
              <motion.div
                animate={loading ? { scale: [1, 1.4, 1] } : {}}
                transition={{ repeat: Infinity, duration: 2, delay: i * 0.5 }}
              >
                <Lightbulb size={10} className="text-primary/60 mt-0.5 shrink-0" />
              </motion.div>
              <p className="font-body text-[11px] text-foreground/70 leading-relaxed">{insight}</p>
            </motion.div>
          ))}
        </div>

        {/* Dynamic stats from results */}
        {results && results.length > 0 && (
          <div className="mt-5 pt-4 border-t border-border/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-body text-[9px] tracking-wider uppercase text-muted-foreground">Confidence</span>
              <span className="font-body text-[10px] text-primary">
                {Math.round(results.reduce((s, r) => s + r.overall_score, 0) / results.length)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-body text-[9px] tracking-wider uppercase text-muted-foreground">Risk Profile</span>
              <span className="font-body text-[10px] text-foreground/70">
                {results.filter(r => r.risk_level === "low").length} low / {results.filter(r => r.risk_level === "medium").length} medium
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-body text-[9px] tracking-wider uppercase text-muted-foreground">Best Match</span>
              <span className="font-body text-[10px] text-primary truncate max-w-[120px]">
                {results[0]?.name}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Status */}
      <div className="glass-card rounded-lg p-3 flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${loading ? "bg-primary animate-pulse" : "bg-success"}`} />
        <span className="font-body text-[10px] text-muted-foreground">
          {loading ? "Sourcing in progress…" : "Sourcing complete"}
        </span>
      </div>
    </div>
  );
};

export default SourcingInsightsPanel;
