import { motion } from "framer-motion";
import {
  CheckCircle2, MapPin, DollarSign, Shield, Star,
  Clock, Bookmark, Eye, AlertTriangle,
} from "lucide-react";

type Option = {
  id: string;
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
  ai_notes: string | null;
};

const riskColors: Record<string, string> = {
  low: "text-success", medium: "text-accent", high: "text-destructive",
};

function formatCurrency(v: number | null, c = "USD") {
  if (!v) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: c, maximumFractionDigits: 0 }).format(v);
}

interface Props {
  options: Option[];
  allOptions: Option[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const ShortlistCards = ({ options, allOptions, selectedId, onSelect }: Props) => {
  return (
    <div className="space-y-6">
      {/* Top 3 Cinematic Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {options.map((opt, i) => {
          const isSelected = selectedId === opt.id;

          return (
            <motion.button
              key={opt.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12 }}
              whileHover={{ scale: 1.02, y: -4 }}
              onClick={() => onSelect(opt.id)}
              className={`text-left glass-card rounded-xl p-5 transition-all duration-300 relative overflow-hidden ${
                isSelected
                  ? "border-primary/40 shadow-[0_0_30px_-10px_hsl(var(--primary)/0.3)] ring-1 ring-primary/20"
                  : selectedId && !isSelected
                    ? "opacity-60 hover:opacity-80"
                    : "hover:border-gold-soft/30"
              }`}
            >
              {/* Rank badge */}
              <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <span className="font-display text-[10px] text-primary">{i + 1}</span>
              </div>

              {/* Score ring */}
              <div className="flex items-center gap-3 mb-4">
                <div className="relative w-12 h-12">
                  <svg width={48} height={48} className="-rotate-90">
                    <circle cx={24} cy={24} r={20} fill="none" stroke="hsl(var(--muted))" strokeWidth={2.5} />
                    <motion.circle
                      cx={24} cy={24} r={20} fill="none"
                      className="stroke-primary" strokeWidth={2.5} strokeLinecap="round"
                      strokeDasharray={125.6}
                      initial={{ strokeDashoffset: 125.6 }}
                      animate={{ strokeDashoffset: 125.6 - (opt.overall_score / 100) * 125.6 }}
                      transition={{ duration: 1, delay: i * 0.15, ease: "easeOut" }}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center font-display text-xs text-foreground">{opt.overall_score}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-sm text-foreground truncate">{opt.name}</h3>
                  <span className={`font-body text-[9px] uppercase tracking-wider ${riskColors[opt.risk_level]}`}>
                    {opt.risk_level} risk
                  </span>
                </div>
              </div>

              {/* Key metrics */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="font-body text-[9px] text-muted-foreground flex items-center gap-1"><DollarSign size={8} /> Price</span>
                  <span className="font-body text-[11px] text-primary">{formatCurrency(opt.estimated_cost, opt.cost_currency)}</span>
                </div>
                {opt.availability && (
                  <div className="flex items-center justify-between">
                    <span className="font-body text-[9px] text-muted-foreground flex items-center gap-1"><Clock size={8} /> Availability</span>
                    <span className="font-body text-[11px] text-foreground/70">{opt.availability}</span>
                  </div>
                )}
                {opt.location && (
                  <div className="flex items-center justify-between">
                    <span className="font-body text-[9px] text-muted-foreground flex items-center gap-1"><MapPin size={8} /> Location</span>
                    <span className="font-body text-[11px] text-foreground/70">{opt.location}</span>
                  </div>
                )}
              </div>

              {/* Pros (top 2) */}
              {opt.pros?.length > 0 && (
                <div className="space-y-1 mb-3">
                  {opt.pros.slice(0, 2).map((pro, j) => (
                    <p key={j} className="font-body text-[10px] text-foreground/60 flex items-start gap-1.5">
                      <CheckCircle2 size={8} className="text-success shrink-0 mt-0.5" /> {pro}
                    </p>
                  ))}
                </div>
              )}

              {/* AI Notes */}
              {opt.ai_notes && (
                <p className="font-body text-[10px] text-gold-soft/50 italic border-t border-border/50 pt-2 mt-2 line-clamp-2">
                  "{opt.ai_notes}"
                </p>
              )}

              {/* Selection indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute bottom-3 right-3"
                >
                  <CheckCircle2 size={16} className="text-primary" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Additional options below top 3 */}
      {allOptions.length > 3 && (
        <div>
          <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground/50 mb-3">Additional Options</p>
          <div className="space-y-2">
            {allOptions.slice(3).map((opt, i) => (
              <motion.button
                key={opt.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                onClick={() => onSelect(opt.id)}
                className={`w-full text-left flex items-center gap-3 p-3 glass-card rounded-lg transition-all ${
                  selectedId === opt.id ? "border-primary/30" : "hover:border-gold-soft/20"
                }`}
              >
                <span className="font-display text-xs text-primary w-8 text-center">{opt.overall_score}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-xs text-foreground truncate">{opt.name}</p>
                  <p className="font-body text-[9px] text-muted-foreground">{opt.location || opt.availability || "—"}</p>
                </div>
                <span className="font-body text-[11px] text-primary shrink-0">{formatCurrency(opt.estimated_cost, opt.cost_currency)}</span>
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShortlistCards;
