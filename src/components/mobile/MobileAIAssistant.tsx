import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bot, Sparkles, Paperclip } from "lucide-react";

interface MobileAIAssistantProps {
  open: boolean;
  onClose: () => void;
}

const prompts = [
  "Source aircraft options",
  "Schedule medical screening",
  "Find household staff",
  "Plan a retreat",
  "Prepare negotiation draft",
];

const MobileAIAssistant = ({ open, onClose }: MobileAIAssistantProps) => {
  const [input, setInput] = useState("");

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: "100%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="fixed inset-0 z-[60] bg-background flex flex-col"
        >
          {/* Header */}
          <div className="h-14 flex items-center justify-between px-5 border-b border-border shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-primary" />
              <span className="font-body text-xs tracking-[0.2em] uppercase text-foreground">
                Quantus Core
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-5">
            {/* Welcome */}
            <div className="glass-card p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full border border-primary/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot size={14} className="text-primary" />
                </div>
                <div>
                  <p className="font-body text-sm text-foreground leading-relaxed">
                    Good day.
                    <br />
                    Your preferences have been calibrated.
                    <br />
                    <span className="text-primary/70 italic">
                      How may I assist you?
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Gold line cursor animation */}
            <div className="flex justify-center mb-6">
              <motion.div
                className="w-12 h-px bg-primary/40"
                animate={{ scaleX: [1, 1.5, 1], opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>

            {/* Suggested prompts */}
            <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-3">
              Suggested
            </p>
            <div className="space-y-2">
              {prompts.map((p) => (
                <button
                  key={p}
                  onClick={() => setInput(p)}
                  className="w-full text-left px-4 py-3 border border-border hover:border-primary/20 font-body text-sm text-muted-foreground hover:text-foreground transition-all duration-300 active:bg-primary/5"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Input bar */}
          <div className="p-4 border-t border-border shrink-0 safe-area-bottom">
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                <Paperclip size={16} />
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Quantus..."
                className="flex-1 bg-secondary/50 border border-primary/20 px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/30 transition-colors rounded-none"
              />
              <button className="w-10 h-10 bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors">
                <Send size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileAIAssistant;
