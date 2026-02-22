import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Zap, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface UsageLimitBannerProps {
  used: number;
  limit: number;
  percentage: number;
  isNearLimit: boolean;
  isAtLimit: boolean;
  tier: string;
  className?: string;
}

const UsageLimitBanner = ({
  used,
  limit,
  percentage,
  isNearLimit,
  isAtLimit,
  tier,
  className = "",
}: UsageLimitBannerProps) => {
  if (!isNearLimit && !isAtLimit) return null;
  if (limit === Infinity) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`rounded-xl border p-4 ${
          isAtLimit
            ? "bg-destructive/10 border-destructive/30"
            : "bg-primary/10 border-primary/30"
        } ${className}`}
      >
        <div className="flex items-start gap-3">
          {isAtLimit ? (
            <AlertTriangle size={18} className="text-destructive shrink-0 mt-0.5" />
          ) : (
            <Zap size={18} className="text-primary shrink-0 mt-0.5" />
          )}
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold ${isAtLimit ? "text-destructive" : "text-primary"}`}>
              {isAtLimit
                ? "Query limit reached"
                : `${percentage}% of monthly queries used`}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {isAtLimit
                ? `You've used all ${limit} queries on the ${tier} plan this month. Upgrade to continue.`
                : `${used} of ${limit} queries used this month. ${limit - used} remaining.`}
            </p>

            {/* Progress bar */}
            <div className="mt-3 h-1.5 bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(percentage, 100)}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-full rounded-full ${
                  isAtLimit ? "bg-destructive" : percentage >= 90 ? "bg-primary" : "bg-quantum-cyan"
                }`}
              />
            </div>

            {(isAtLimit || percentage >= 90) && (
              <Link
                to="/pricing"
                className={`inline-flex items-center gap-1.5 mt-3 text-xs font-semibold transition-colors ${
                  isAtLimit
                    ? "text-destructive hover:text-destructive/80"
                    : "text-primary hover:text-primary/80"
                }`}
              >
                Upgrade Plan <ArrowRight size={12} />
              </Link>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UsageLimitBanner;
