import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { SubscriptionTier } from "@/hooks/use-subscription";

const NEXT_TIER: Partial<Record<SubscriptionTier, { name: string; price: number; key: SubscriptionTier }>> = {
  free: { name: "Starter", price: 29, key: "starter" },
  starter: { name: "Professional", price: 149, key: "professional" },
  professional: { name: "Teams", price: 49, key: "teams" },
};

interface UpsellBannerProps {
  tier: SubscriptionTier;
  usagePercent: number; // 0-100
  feature?: string; // e.g. "AI queries", "quantum jobs"
  className?: string;
}

const UpsellBanner = ({ tier, usagePercent, feature = "AI queries", className = "" }: UpsellBannerProps) => {
  const next = NEXT_TIER[tier];
  if (!next) return null;
  if (usagePercent < 75) return null;

  const isUrgent = usagePercent >= 90;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.98 }}
        className={`rounded-xl border p-4 ${
          isUrgent
            ? "bg-primary/10 border-primary/30"
            : "bg-accent/50 border-border"
        } ${className}`}
      >
        <div className="flex items-start gap-3">
          {isUrgent ? (
            <Sparkles size={18} className="text-primary shrink-0 mt-0.5" />
          ) : (
            <TrendingUp size={18} className="text-muted-foreground shrink-0 mt-0.5" />
          )}
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold ${isUrgent ? "text-primary" : "text-foreground"}`}>
              {isUrgent
                ? `You're at ${usagePercent}% of your ${feature} limit`
                : `Growing fast — ${usagePercent}% of ${feature} used`}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {isUrgent
                ? `Upgrade to ${next.name} for unlimited access and advanced features.`
                : `The ${next.name} plan ($${next.price}/mo) unlocks higher limits and priority support.`}
            </p>

            <div className="flex items-center gap-3 mt-3">
              <Link
                to="/pricing"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                Upgrade to {next.name} <ArrowRight size={12} />
              </Link>
              {!isUrgent && (
                <span className="text-[10px] text-muted-foreground">
                  Save 20% with annual billing
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UpsellBanner;
