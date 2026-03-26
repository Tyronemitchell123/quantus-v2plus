import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Sparkles } from "lucide-react";

const prompts = [
  "Source aircraft options",
  "Schedule medical screening",
  "Find household staff",
  "Plan a wellness retreat",
  "Prepare negotiation draft",
];

const AIAssistantPanel = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");

  return (
    <>
      {/* Floating trigger */}
      {!open && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center gold-glow hover:bg-primary/90 transition-colors"
        >
          <Bot size={20} />
        </motion.button>
      )}

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full sm:w-96 z-50 border-l border-border bg-background/95 backdrop-blur-xl flex flex-col"
          >
            {/* Header */}
            <div className="h-14 flex items-center justify-between px-5 border-b border-border">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-primary" />
                <span className="font-body text-xs tracking-[0.2em] uppercase text-foreground">Quantus Core</span>
              </div>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5">
              <div className="glass-card p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full border border-primary/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot size={10} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-body text-sm text-foreground leading-relaxed">
                      Good day.<br />
                      Your preferences have been calibrated.<br />
                      <span className="text-primary/70 italic">How may I assist you?</span>
                    </p>
                  </div>
                </div>
              </div>

              <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-3">Suggested</p>
              <div className="space-y-2">
                {prompts.map((p) => (
                  <button
                    key={p}
                    onClick={() => setInput(p)}
                    className="w-full text-left px-4 py-2.5 border border-border hover:border-primary/20 font-body text-xs text-muted-foreground hover:text-foreground transition-all duration-300"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Quantus..."
                  className="flex-1 bg-secondary/50 border border-border px-4 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/30 transition-colors"
                />
                <button className="px-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
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
