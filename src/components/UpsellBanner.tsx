import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, ArrowRight, Sparkles, X, ShieldCheck, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { SubscriptionTier } from "@/hooks/use-subscription";

const NEXT_TIER: Partial<Record<SubscriptionTier, { name: string; price: number; key: SubscriptionTier; highlights: string[] }>> = {
  free: { name: "Starter", price: 29, key: "starter", highlights: ["5,000 AI queries/mo", "50 quantum jobs", "14-day free trial"] },
  starter: { name: "Professional", price: 149, key: "professional", highlights: ["Unlimited AI queries", "Anomaly detection", "Priority concierge"] },
  professional: { name: "Teams", price: 49, key: "teams", highlights: ["Centralized billing", "Role-based access", "Team analytics"] },
};

const DISMISS_KEY = "quantus_upsell_dismissed";
const DISMISS_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

interface UpsellBannerProps {
  tier: SubscriptionTier;
  usagePercent: number;
  feature?: string;
  className?: string;
  variant?: "compact" | "full";
}

const UpsellBanner = ({ tier, usagePercent, feature = "AI queries", className = "", variant = "full" }: UpsellBannerProps) => {
  const [dismissed, setDismissed] = useState(false);
  const next = NEXT_TIER[tier];

  useEffect(() => {
    const stored = localStorage.getItem(DISMISS_KEY);
    if (stored) {
      const ts = parseInt(stored, 10);
      if (Date.now() - ts < DISMISS_DURATION_MS) setDismissed(true);
    }
  }, []);

  if (!next) return null;
  if (usagePercent < 75) return null;
  if (dismissed) return null;

  const isUrgent = usagePercent >= 90;
  const isCritical = usagePercent >= 100;

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  };

  if (variant === "compact") {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className={`rounded-lg border px-3 py-2 flex items-center justify-between gap-2 ${
            isCritical ? "bg-destructive/10 border-destructive/30" : "bg-primary/10 border-primary/30"
          } ${className}`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Zap size={14} className={isCritical ? "text-destructive" : "text-primary"} />
            <span className="text-xs font-medium text-foreground truncate">
              {isCritical ? `${feature} limit reached` : `${usagePercent}% of ${feature} used`}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link to="/pricing" className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors whitespace-nowrap">
              Upgrade
            </Link>
            <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground transition-colors">
              <X size={12} />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.98 }}
        className={`rounded-xl border p-4 relative ${
          isCritical
            ? "bg-destructive/10 border-destructive/30"
            : isUrgent
            ? "bg-primary/10 border-primary/30"
            : "bg-accent/50 border-border"
        } ${className}`}
      >
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>

        <div className="flex items-start gap-3">
          {isCritical ? (
            <div className="w-8 h-8 rounded-lg bg-destructive/20 flex items-center justify-center shrink-0">
              <Sparkles size={16} className="text-destructive" />
            </div>
          ) : isUrgent ? (
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
              <Sparkles size={16} className="text-primary" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <TrendingUp size={16} className="text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0 pr-4">
            <p className={`text-sm font-semibold ${isCritical ? "text-destructive" : isUrgent ? "text-primary" : "text-foreground"}`}>
              {isCritical
                ? `You've reached your ${feature} limit`
                : isUrgent
                ? `Almost there — ${usagePercent}% of ${feature} used`
                : `Growing fast — ${usagePercent}% of ${feature} used`}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {isCritical
                ? `Upgrade to ${next.name} now to continue without interruption.`
                : `The ${next.name} plan ($${next.price}/mo) unlocks more power.`}
            </p>

            {/* Feature highlights */}
            {next.highlights && (
              <div className="flex flex-wrap gap-2 mt-2">
                {next.highlights.map((h) => (
                  <span key={h} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                    {h}
                  </span>
                ))}
              </div>
            )}

            {/* Progress bar */}
            <div className="mt-3 h-1.5 bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(usagePercent, 100)}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-full rounded-full ${
                  isCritical ? "bg-destructive" : isUrgent ? "bg-primary" : "bg-quantum-cyan"
                }`}
              />
            </div>

            <div className="flex items-center gap-3 mt-3">
              <Link
                to="/pricing"
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isCritical
                    ? "bg-destructive text-destructive-foreground hover:opacity-90"
                    : isUrgent
                    ? "bg-primary text-primary-foreground hover:opacity-90"
                    : "border border-primary text-primary hover:bg-primary/10"
                }`}
              >
                Upgrade to {next.name} <ArrowRight size={12} />
              </Link>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <ShieldCheck size={10} />
                14-day money-back guarantee
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UpsellBanner;
