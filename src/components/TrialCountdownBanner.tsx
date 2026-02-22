import { motion } from "framer-motion";
import { Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useSubscription } from "@/hooks/use-subscription";

const TrialCountdownBanner = ({ className = "" }: { className?: string }) => {
  const { subscription } = useSubscription();

  if (!subscription) return null;
  if (subscription.status !== "trialing" && subscription.status !== "active") return null;

  const periodEnd = subscription.current_period_end;
  if (!periodEnd) return null;

  const endDate = new Date(periodEnd);
  const now = new Date();
  const diffMs = endDate.getTime() - now.getTime();
  const daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  // Only show for trial-length periods (≤ 14 days remaining on starter)
  if (daysLeft > 14) return null;
  if (subscription.tier !== "starter") return null;

  const urgent = daysLeft <= 3;
  const expired = daysLeft === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border p-4 ${
        expired
          ? "bg-destructive/10 border-destructive/30"
          : urgent
          ? "bg-primary/10 border-primary/30"
          : "bg-quantum-cyan/10 border-quantum-cyan/30"
      } ${className}`}
    >
      <div className="flex items-start gap-3">
        <Clock
          size={18}
          className={`shrink-0 mt-0.5 ${
            expired ? "text-destructive" : urgent ? "text-primary" : "text-quantum-cyan"
          }`}
        />
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-semibold ${
              expired ? "text-destructive" : urgent ? "text-primary" : "text-quantum-cyan"
            }`}
          >
            {expired
              ? "Your trial has expired"
              : `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left in your Starter trial`}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {expired
              ? "Upgrade now to keep access to 5,000 AI queries/month, predictive analytics, and more."
              : `Your 14-day trial ends on ${endDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}. Upgrade to keep full access.`}
          </p>

          {/* Countdown bar */}
          {!expired && (
            <div className="mt-3 h-1.5 bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: `${(daysLeft / 14) * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-full rounded-full ${
                  urgent ? "bg-primary" : "bg-quantum-cyan"
                }`}
              />
            </div>
          )}

          <Link
            to="/pricing"
            className={`inline-flex items-center gap-1.5 mt-3 text-xs font-semibold transition-colors ${
              expired
                ? "text-destructive hover:text-destructive/80"
                : urgent
                ? "text-primary hover:text-primary/80"
                : "text-quantum-cyan hover:text-quantum-cyan/80"
            }`}
          >
            {expired ? "Choose a Plan" : "Upgrade Now"} <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default TrialCountdownBanner;
