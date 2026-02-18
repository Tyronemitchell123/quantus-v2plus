import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, Zap, X } from "lucide-react";

import { CREDITS_BANNER_STORAGE_KEY } from "@/hooks/use-ai-analytics";

const AICreditsBanner = () => {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(CREDITS_BANNER_STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  const handleDismiss = () => {
    setDismissed(true);
    try { localStorage.setItem(CREDITS_BANNER_STORAGE_KEY, "true"); } catch {}
  };
  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25 }}
          className="mb-6 overflow-hidden"
        >
          <div className="rounded-lg border border-border/60 bg-secondary/40 px-4 py-3 flex items-center gap-3">
            <Info size={14} className="text-muted-foreground shrink-0" />
            <p className="text-xs text-muted-foreground flex-1">
              Showing sample data.{" "}
              <a
                href="https://lovable.dev/settings"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
              >
                <Zap size={10} />
                Add credits
              </a>{" "}
              to restore live AI insights.
            </p>
            <button
              onClick={handleDismiss}
              className="text-muted-foreground hover:text-foreground transition-colors shrink-0 p-0.5 rounded hover:bg-secondary"
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AICreditsBanner;
