import { motion } from "framer-motion";
import { WifiOff, Database, RefreshCw } from "lucide-react";

type AIFallbackBannerProps = {
  status: "live" | "cached" | "fallback" | null;
  onRetry?: () => void;
  loading?: boolean;
  className?: string;
};

const AIFallbackBanner = ({ status, onRetry, loading, className = "" }: AIFallbackBannerProps) => {
  if (!status || status === "live") return null;

  const isCached = status === "cached";

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg border text-xs ${
        isCached
          ? "bg-primary/5 border-primary/15 text-primary/80"
          : "bg-muted/50 border-border text-muted-foreground"
      } ${className}`}
    >
      <div className="flex items-center gap-2">
        {isCached ? (
          <Database size={13} className="text-primary/60 shrink-0" />
        ) : (
          <WifiOff size={13} className="text-muted-foreground shrink-0" />
        )}
        <span>
          {isCached
            ? "Showing cached data — live AI is temporarily unavailable"
            : "Showing sample data — AI credits needed for live insights"}
        </span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          disabled={loading}
          className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium shrink-0 disabled:opacity-50"
        >
          <RefreshCw size={11} className={loading ? "animate-spin" : ""} />
          Retry
        </button>
      )}
    </motion.div>
  );
};

export default AIFallbackBanner;
