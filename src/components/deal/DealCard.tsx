import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, AlertTriangle, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Deal {
  id: string;
  deal_number: string;
  category: string;
  sub_category: string | null;
  intent: string | null;
  priority_score: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Props {
  deal: Deal;
  index: number;
  categoryIcons: Record<string, LucideIcon>;
  statusToPhase: Record<string, number>;
  phaseLabels: string[];
}

const DealCard = ({ deal, index, categoryIcons, statusToPhase, phaseLabels }: Props) => {
  const Icon = categoryIcons[deal.category] || Sparkles;
  const phase = statusToPhase[deal.status] || 1;
  const progress = Math.round(((phase - 1) / 6) * 100);

  const getPhaseLink = () => {
    const paths = ["/intake", "/sourcing", "/outreach", "/negotiation", "/workflow", "/documents", "/deal-completion"];
    return `${paths[phase - 1]}?deal=${deal.id}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Link
        to={getPhaseLink()}
        className="glass-card p-5 rounded-xl flex items-center gap-4 group hover:border-gold-soft/30 transition-all duration-500 block"
      >
        {/* Icon */}
        <div className="w-10 h-10 rounded-lg border border-border bg-secondary/30 flex items-center justify-center shrink-0">
          <Icon size={16} className="text-primary/60" />
        </div>

        {/* Deal info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-body text-xs font-medium text-foreground">{deal.deal_number}</span>
            <span className="font-body text-[10px] tracking-wider uppercase text-primary/50 capitalize">{deal.category}</span>
            {deal.priority_score >= 80 && (
              <span className="font-body text-[9px] tracking-wider uppercase text-destructive flex items-center gap-0.5">
                <AlertTriangle size={8} /> High Priority
              </span>
            )}
          </div>
          <p className="font-body text-xs text-muted-foreground truncate">
            {deal.intent || deal.sub_category || "Request pending classification"}
          </p>
        </div>

        {/* Phase */}
        <div className="shrink-0 text-right hidden sm:block">
          <p className="font-body text-[10px] tracking-wider uppercase text-muted-foreground mb-1.5">
            Phase {phase}/7 — {phaseLabels[phase - 1]}
          </p>
          <div className="w-24 h-1 bg-border rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, delay: 0.2 + index * 0.04 }}
            />
          </div>
        </div>

        {/* Status indicator */}
        <div className="shrink-0">
          {deal.status === "completed" ? (
            <CheckCircle2 size={16} className="text-success" />
          ) : (
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          )}
        </div>

        <ArrowRight size={14} className="text-muted-foreground/30 group-hover:text-primary/50 transition-colors shrink-0" />
      </Link>
    </motion.div>
  );
};

export default DealCard;
