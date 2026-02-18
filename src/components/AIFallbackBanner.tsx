import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, Database, RefreshCw, X } from "lucide-react";

type AIFallbackBannerProps = {
  status: "live" | "cached" | "fallback" | null;
  onRetry?: () => void;
  loading?: boolean;
  className?: string;
};

const AIFallbackBanner = ({ status, onRetry, loading, className = "" }: AIFallbackBannerProps) => {
  const [dismissed, setDismissed] = useState(false);

  const isVisible = !!status && status !== "live" && !dismissed;
  const isCached = status === "cached";

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="fallback-banner"
          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
          animate={{ opacity: 1, height: "auto", marginBottom: 0 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0, transition: { duration: 0.25, ease: "easeInOut" } }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="overflow-hidden"
        >
          <div
            className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg border text-xs ${
              isCached
                ? "bg-primary/5 border-primary/15 text-primary/80"
                : "bg-muted/50 border-border text-muted-foreground"
            } ${className}`}
          >
            <div className="flex items-center gap-2 min-w-0">
              {isCached ? (
                <Database size={13} className="text-primary/60 shrink-0" />
              ) : (
                <WifiOff size={13} className="text-muted-foreground shrink-0" />
              )}
              <span className="truncate">
                {isCached
                  ? "Showing cached data — live AI is temporarily unavailable"
                  : "Showing sample data — AI credits needed for live insights"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {onRetry && (
                <button
                  onClick={onRetry}
                  disabled={loading}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium disabled:opacity-50"
                >
                  <RefreshCw size={11} className={loading ? "animate-spin" : ""} />
                  Retry
                </button>
              )}
              <button
                onClick={() => setDismissed(true)}
                className="p-1 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Dismiss"
              >
                <X size={13} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AIFallbackBanner;
