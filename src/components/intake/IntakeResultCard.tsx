import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Plane, Heart, Users, Globe, Truck, Handshake,
  Sparkles, CheckCircle2, AlertTriangle, DollarSign,
  MapPin, Clock, ArrowRight,
} from "lucide-react";

const categoryIcons: Record<string, typeof Plane> = {
  aviation: Plane, medical: Heart, staffing: Users,
  lifestyle: Globe, logistics: Truck, partnerships: Handshake,
};

const categoryColors: Record<string, string> = {
  aviation: "text-[hsl(var(--primary))]",
  medical: "text-success",
  staffing: "text-[hsl(var(--primary))]",
  lifestyle: "text-accent",
  logistics: "text-[hsl(var(--primary))]",
  partnerships: "text-[hsl(var(--primary))]",
};

function ScoreBar({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Clock }) {
  const color = value >= 80 ? "bg-destructive" : value >= 60 ? "bg-primary" : value >= 40 ? "bg-accent" : "bg-muted-foreground";
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="font-body text-[10px] text-muted-foreground flex items-center gap-1.5">
          <Icon size={10} /> {label}
        </span>
        <span className="font-body text-[10px] font-medium text-foreground">{value}</span>
      </div>
      <div className="h-1 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function formatCurrency(value: number | null, currency = "USD") {
  if (!value) return null;
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
}

interface Props {
  deal: {
    id: string;
    deal_number: string;
    category: string;
    sub_category: string;
    intent: string;
    budget_min: number | null;
    budget_max: number | null;
    budget_currency: string;
    timeline_days: number | null;
    location: string | null;
    constraints: string[];
    preferences: string[];
    priority_score: number;
    deal_value_estimate: number | null;
    complexity_score: number;
    urgency_score: number;
    probability_score: number;
    status: string;
    routed_engine: string;
    ai_confirmation: string;
  };
}

const IntakeResultCard = ({ deal }: Props) => {
  const CatIcon = categoryIcons[deal.category] || Sparkles;

  return (
    <motion.div
      key={deal.id}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* AI Confirmation */}
      <div className="glass-card rounded-xl p-6 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <CheckCircle2 size={18} className="text-primary" />
          </div>
          <div>
            <p className="font-body text-[10px] tracking-[0.2em] uppercase text-primary/60 mb-2">Quantus A.I Response</p>
            <p className="font-body text-sm text-foreground/90 leading-relaxed italic">
              "{deal.ai_confirmation}"
            </p>
          </div>
        </div>
      </div>

      {/* Deal Profile — 3-column */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Classification */}
        <div className="glass-card rounded-xl p-6 space-y-4">
          <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Classification</p>
          <div className="flex items-center gap-3">
            <CatIcon size={20} className={categoryColors[deal.category] || "text-primary"} />
            <div>
              <p className="font-display text-lg text-foreground capitalize">{deal.category}</p>
              <p className="font-body text-xs text-muted-foreground">{deal.sub_category}</p>
            </div>
          </div>
          <div className="space-y-1.5 pt-2 border-t border-border/50">
            <p className="font-body text-[10px] text-muted-foreground">Intent</p>
            <p className="font-body text-sm text-foreground">{deal.intent}</p>
          </div>
          <div className="space-y-1.5 pt-2 border-t border-border/50">
            <p className="font-body text-[10px] text-muted-foreground">Routed To</p>
            <p className="font-body text-sm text-primary">{deal.routed_engine}</p>
          </div>
          <div className="space-y-1.5 pt-2 border-t border-border/50">
            <p className="font-body text-[10px] text-muted-foreground">Deal ID</p>
            <p className="font-mono text-xs text-foreground/60">{deal.deal_number}</p>
          </div>
        </div>

        {/* Requirements */}
        <div className="glass-card rounded-xl p-6 space-y-4">
          <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Requirements</p>
          {deal.budget_max && (
            <div className="flex items-center gap-2">
              <DollarSign size={14} className="text-primary/60" />
              <span className="font-body text-sm text-foreground">
                {deal.budget_min ? `${formatCurrency(deal.budget_min, deal.budget_currency)} – ` : "Up to "}
                {formatCurrency(deal.budget_max, deal.budget_currency)}
              </span>
            </div>
          )}
          {deal.timeline_days && (
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-primary/60" />
              <span className="font-body text-sm text-foreground">{deal.timeline_days} days</span>
            </div>
          )}
          {deal.location && (
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-primary/60" />
              <span className="font-body text-sm text-foreground">{deal.location}</span>
            </div>
          )}
          {deal.constraints?.length > 0 && (
            <div className="pt-2 border-t border-border/50">
              <p className="font-body text-[10px] text-muted-foreground mb-2">Constraints</p>
              <div className="flex flex-wrap gap-1.5">
                {deal.constraints.map((c: string, i: number) => (
                  <span key={i} className="px-2 py-0.5 bg-destructive/10 text-destructive font-body text-[9px] tracking-wide uppercase border border-destructive/20 rounded">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
          {deal.preferences?.length > 0 && (
            <div className="pt-2 border-t border-border/50">
              <p className="font-body text-[10px] text-muted-foreground mb-2">Preferences</p>
              <div className="flex flex-wrap gap-1.5">
                {deal.preferences.map((p: string, i: number) => (
                  <span key={i} className="px-2 py-0.5 bg-primary/10 text-primary font-body text-[9px] tracking-wide uppercase border border-primary/20 rounded">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Scoring */}
        <div className="glass-card rounded-xl p-6 space-y-4">
          <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Deal Intelligence</p>
          <div className="text-center py-3">
            <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full border-2 border-primary/30">
              <span className="font-display text-2xl text-foreground">{deal.priority_score}</span>
            </div>
            <p className="font-body text-[10px] text-muted-foreground mt-2">Priority Score</p>
          </div>
          <div className="space-y-3 pt-2">
            <ScoreBar label="Urgency" value={deal.urgency_score} icon={AlertTriangle} />
            <ScoreBar label="Complexity" value={deal.complexity_score} icon={Sparkles} />
            <ScoreBar label="Probability" value={deal.probability_score} icon={CheckCircle2} />
          </div>
          {deal.deal_value_estimate && (
            <div className="pt-3 border-t border-border/50 text-center">
              <p className="font-body text-[10px] text-muted-foreground">Estimated Value</p>
              <p className="font-display text-lg text-primary">{formatCurrency(deal.deal_value_estimate)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Next Action */}
      <Link
        to={`/sourcing?deal=${deal.id}`}
        className="flex items-center justify-between glass-card rounded-xl p-5 border-primary/20 hover:border-primary/40 transition-colors group"
      >
        <div>
          <p className="font-body text-[10px] text-muted-foreground">Status</p>
          <p className="font-body text-sm text-foreground capitalize">{deal.status} Complete</p>
        </div>
        <div className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-body text-[10px] tracking-[0.2em] uppercase rounded-lg group-hover:brightness-110 transition-all gold-glow">
          Begin Sourcing <ArrowRight size={12} />
        </div>
      </Link>
    </motion.div>
  );
};

export default IntakeResultCard;
