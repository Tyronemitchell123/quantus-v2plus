import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import { useWelcomeSequence } from "@/hooks/use-welcome-sequence";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";

/**
 * Renders floating tooltip cards after onboarding completion,
 * guiding users through their first actions.
 */
const WelcomeTooltips = () => {
  const { user } = useAuth();
  const { activeTooltips, dismissTooltip } = useWelcomeSequence(user?.id);
  const navigate = useNavigate();

  // Only show for authenticated users who haven't dismissed all tips
  if (!user || activeTooltips.length === 0) return null;

  // Show only the first undismissed tooltip
  const tip = activeTooltips[0];

  return (
    <AnimatePresence>
      <motion.div
        key={tip.id}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        className="fixed bottom-24 right-6 z-50 w-72 bg-card border border-primary/20 rounded-2xl p-5 shadow-2xl backdrop-blur-md"
      >
        <button
          onClick={() => dismissTooltip(tip.id)}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={14} />
        </button>
        <p className="font-body text-[10px] tracking-[0.3em] uppercase text-primary/60 mb-1">
          Getting Started
        </p>
        <h4 className="font-display text-sm font-medium text-foreground mb-1.5">
          {tip.title}
        </h4>
        <p className="font-body text-xs text-muted-foreground leading-relaxed mb-3">
          {tip.description}
        </p>
        <button
          onClick={() => {
            dismissTooltip(tip.id);
            navigate(tip.target);
          }}
          className="flex items-center gap-1.5 font-body text-[10px] tracking-[0.2em] uppercase text-primary hover:text-primary/80 transition-colors"
        >
          Go there <ArrowRight size={12} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default WelcomeTooltips;
