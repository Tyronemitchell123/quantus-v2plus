import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Zap } from "lucide-react";
import type { QuantumLimits } from "@/hooks/use-quantum-jobs";

interface Props {
  limits: QuantumLimits | null;
}

export default function QuantumLimitsBanner({ limits }: Props) {
  if (!limits) return null;

  const { usage, limits: tierLimits, tier } = limits;
  const jobPct = tierLimits.jobsPerMonth > 99999 ? 0 : (usage.jobsThisMonth / tierLimits.jobsPerMonth) * 100;
  const shotPct = tierLimits.totalShotsPerMonth > 99999 ? 0 : (usage.totalShotsThisMonth / tierLimits.totalShotsPerMonth) * 100;
  const maxPct = Math.max(jobPct, shotPct);

  if (maxPct < 60) return null;

  const isAtLimit = maxPct >= 100;
  const isNear = maxPct >= 80;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className={`p-3 rounded-lg border text-sm flex items-center gap-3 ${
          isAtLimit
            ? "bg-destructive/10 border-destructive/30 text-destructive"
            : "bg-primary/10 border-primary/30 text-primary"
        }`}
      >
        {isAtLimit ? <AlertTriangle size={16} /> : <Zap size={16} />}
        <div className="flex-1">
          <span className="font-medium">
            {isAtLimit ? "Limit reached" : "Approaching limit"}
          </span>
          <span className="ml-2 text-xs opacity-80">
            {usage.jobsThisMonth}/{tierLimits.jobsPerMonth > 99999 ? "∞" : tierLimits.jobsPerMonth} jobs · {usage.totalShotsThisMonth}/{tierLimits.totalShotsPerMonth > 99999 ? "∞" : tierLimits.totalShotsPerMonth} shots
          </span>
        </div>
        {(isAtLimit || isNear) && (
          <a href="/pricing" className="text-xs font-medium underline whitespace-nowrap">
            Upgrade
          </a>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
