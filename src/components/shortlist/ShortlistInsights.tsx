import { motion } from "framer-motion";
import { Sparkles, Lightbulb, CheckCircle2, AlertTriangle } from "lucide-react";

type Option = {
  id: string;
  name: string;
  overall_score: number;
  risk_level: string;
  estimated_cost: number | null;
  availability: string | null;
  score_breakdown: Record<string, number>;
};

interface Props {
  options: Option[];
  selectedId: string | null;
  category: string;
}

const ShortlistInsights = ({ options, selectedId, category }: Props) => {
  const selected = options.find((o) => o.id === selectedId);

  const insights: string[] = [];
  if (options.length >= 2) {
    const [first, second] = options;
    if (first.score_breakdown?.privacy > (second.score_breakdown?.privacy || 0)) {
      insights.push(`${first.name} offers the best privacy alignment.`);
    }
    if (first.availability) insights.push(`${first.name} has the fastest availability.`);
    if (second.estimated_cost && first.estimated_cost && second.estimated_cost < first.estimated_cost) {
      insights.push(`${second.name} provides the best value.`);
    }
  }
  if (options.length >= 3) {
    insights.push(`${options[2].name} is a strong alternative worth considering.`);
  }
  if (insights.length === 0) {
    insights.push("All options have been scored and ranked by Quantus A.I.");
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.25 }}
      className="space-y-4 lg:sticky lg:top-40"
    >
      <p className="font-body text-[10px] tracking-[0.25em] uppercase text-gold-soft/50 mb-2">
        Quantus Core Recommendations
      </p>

      {/* Intelligence */}
      <div className="glass-card rounded-xl p-5 border-primary/10">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={12} className="text-primary" />
          <span className="font-display text-xs text-foreground">Insights</span>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex-1 h-px bg-primary/20 origin-left"
          />
        </div>
        <div className="space-y-2.5">
          {insights.map((insight, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.12 }}
              className="flex items-start gap-2"
            >
              <Lightbulb size={10} className="text-primary/60 mt-0.5 shrink-0" />
              <p className="font-body text-[11px] text-foreground/70 leading-relaxed">{insight}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Selected option summary */}
      {selected && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-5 border-primary/20"
        >
          <p className="font-body text-[9px] tracking-[0.2em] uppercase text-primary/60 mb-3">Selected</p>
          <h3 className="font-display text-sm text-foreground mb-2">{selected.name}</h3>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-body text-[9px] text-muted-foreground">Score</span>
              <span className="font-display text-sm text-primary">{selected.overall_score}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-body text-[9px] text-muted-foreground">Risk</span>
              <span className={`font-body text-[10px] capitalize ${
                selected.risk_level === "low" ? "text-success" : selected.risk_level === "high" ? "text-destructive" : "text-accent"
              }`}>{selected.risk_level}</span>
            </div>
            {selected.availability && (
              <div className="flex items-center justify-between">
                <span className="font-body text-[9px] text-muted-foreground">Availability</span>
                <span className="font-body text-[10px] text-foreground/70">{selected.availability}</span>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Status */}
      <div className="glass-card rounded-lg p-3 flex items-center gap-2">
        <CheckCircle2 size={10} className="text-success" />
        <span className="font-body text-[10px] text-muted-foreground">Shortlist curated</span>
      </div>
    </motion.div>
  );
};

export default ShortlistInsights;
