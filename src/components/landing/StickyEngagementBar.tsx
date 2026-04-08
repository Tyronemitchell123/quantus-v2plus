import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, X } from "lucide-react";

const StickyEngagementBar = () => {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = () => {
      if (dismissed) return;
      setVisible(window.scrollY > 600);
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [dismissed]);

  if (dismissed) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-0 inset-x-0 z-50 p-3 sm:p-4"
        >
          <div className="max-w-4xl mx-auto rounded-xl border border-gold-soft/20 px-4 sm:px-6 py-3 flex items-center justify-between gap-4"
            style={{ background: "hsl(var(--background) / 0.92)", backdropFilter: "blur(16px)" }}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
              <p className="font-body text-xs sm:text-sm text-foreground truncate">
                <span className="text-primary font-medium">Free trial</span> — Start orchestrating deals across 9 verticals today
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                to="/auth"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-body text-[10px] sm:text-xs tracking-wider uppercase font-medium hover:brightness-110 transition-all gold-glow"
              >
                Get Started <ArrowRight size={12} />
              </Link>
              <button
                onClick={() => setDismissed(true)}
                className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Dismiss"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StickyEngagementBar;
