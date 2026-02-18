import { motion } from "framer-motion";
import { AlertCircle, Zap } from "lucide-react";

const AICreditsBanner = () => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-xl border border-primary/20 bg-primary/[0.04] p-4 flex items-start gap-4 mb-8"
  >
    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
      <AlertCircle size={20} className="text-primary" />
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="text-sm font-semibold text-foreground mb-1">AI Credits Exhausted</h4>
      <p className="text-xs text-muted-foreground leading-relaxed">
        You're viewing sample data. Live AI-powered insights will resume once credits are replenished.
      </p>
      <a
        href="https://lovable.dev/settings"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 mt-3 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
      >
        <Zap size={12} />
        Add Credits
      </a>
    </div>
  </motion.div>
);

export default AICreditsBanner;
