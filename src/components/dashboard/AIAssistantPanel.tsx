import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Sparkles, ChevronLeft, Paperclip } from "lucide-react";

const prompts = [
  "Source aircraft options",
  "Prepare negotiation draft",
  "Schedule medical screening",
  "Find household staff",
  "Plan a retreat",
];

interface Props {
  open: boolean;
  onToggle: () => void;
}

const AIAssistantPanel = ({ open, onToggle }: Props) => {
  const [input, setInput] = useState("");

  return (
    <>
      {/* Collapsed trigger */}
      {!open && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onToggle}
          className="fixed top-1/2 -translate-y-1/2 right-0 z-30 w-10 h-24 bg-card/80 backdrop-blur-sm border border-border/50 border-r-0 rounded-l-xl flex items-center justify-center hover:bg-card transition-colors"
        >
          <Sparkles size={14} className="text-primary" />
        </motion.button>
      )}

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 380, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="h-screen border-l border-border/50 bg-card/30 backdrop-blur-sm flex flex-col shrink-0 overflow-hidden relative z-10"
          >
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-5 border-b border-border/50 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Sparkles size={10} className="text-primary" />
                </div>
                <div>
                  <span className="font-display text-sm text-foreground">Quantus Core</span>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="w-10 h-px bg-primary/40 origin-left mt-0.5"
                  />
                </div>
              </div>
              <button onClick={onToggle} className="text-muted-foreground hover:text-foreground transition-colors p-1">
                <ChevronLeft size={16} className="rotate-180" />
              </button>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-5">
              {/* Welcome message */}
              <div className="glass-card p-4 rounded-xl mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full border border-primary/30 bg-primary/5 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot size={12} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-body text-sm text-foreground leading-relaxed">
                      Good day.<br />
                      Your preferences have been calibrated.<br />
                      <span className="text-primary/70 italic">How may I assist you?</span>
                    </p>
                    <p className="font-body text-[9px] text-primary/30 mt-2">Just now</p>
                  </div>
                </div>
              </div>

              {/* Suggested prompts */}
              <p className="font-body text-[10px] tracking-[0.25em] uppercase text-gold-soft/40 mb-3">Suggested</p>
              <div className="space-y-2">
                {prompts.map((p) => (
                  <button
                    key={p}
                    onClick={() => setInput(p)}
                    className="w-full text-left px-4 py-3 rounded-lg border border-border/40 hover:border-gold-soft/30 font-body text-xs text-muted-foreground hover:text-foreground transition-all duration-300"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border/50 shrink-0">
              <div className="flex gap-2 items-center">
                <button className="text-muted-foreground hover:text-foreground transition-colors p-1">
                  <Paperclip size={14} strokeWidth={1.5} />
                </button>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="How may I assist?"
                  className="flex-1 bg-transparent border border-gold-soft/15 rounded-lg px-4 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 focus:shadow-[0_0_12px_-4px_hsl(var(--gold)/0.15)] transition-all duration-300"
                />
                <button className="px-3 py-2.5 rounded-lg bg-primary text-primary-foreground hover:brightness-110 transition-all">
                  <Send size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAssistantPanel;
