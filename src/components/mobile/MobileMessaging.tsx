import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Paperclip, Mic, ChevronDown, Bot, Shield } from "lucide-react";

interface MobileMessagingProps {
  open: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  text: string;
  sender: "user" | "system" | "vendor";
  time: string;
  aiGenerated?: boolean;
}

const sampleMessages: Message[] = [
  { id: "1", text: "Vendor response received. Identity anonymized per Obsidian protocol.", sender: "system", time: "10:32", aiGenerated: true },
  { id: "2", text: "The G700 is available for your requested dates. We can offer preferred pricing for a 3-leg commitment.", sender: "vendor", time: "10:34" },
  { id: "3", text: "Please confirm availability for Dec 15–22 with full crew configuration.", sender: "user", time: "10:41" },
  { id: "4", text: "Confirmed. Sending operational brief and cost breakdown within 2 hours.", sender: "vendor", time: "10:43" },
];

const quickReplies = [
  "Confirm availability",
  "Request pricing",
  "Send NDA",
  "Escalate to advisor",
];

const MobileMessaging = ({ open, onClose }: MobileMessagingProps) => {
  const [input, setInput] = useState("");
  const [recording, setRecording] = useState(false);

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
              <Shield size={12} className="text-primary/70" />
              <span className="font-body text-xs tracking-[0.2em] uppercase text-foreground">
                Secure Channel
              </span>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-muted-foreground">
              <X size={18} />
            </button>
          </div>

          {/* AI Summary banner */}
          <div className="px-5 py-3 border-b border-primary/10 bg-primary/[0.03]">
            <div className="flex items-start gap-2">
              <Bot size={12} className="text-primary mt-0.5 shrink-0" />
              <p className="font-body text-[10px] text-primary/70 leading-relaxed">
                AI Summary: Vendor confirmed G700 availability. Pricing pending. Response time: 9 min (above average).
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {sampleMessages.map((msg, i) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 space-y-1 ${
                    msg.sender === "user"
                      ? "bg-primary/10 border border-primary/20"
                      : msg.sender === "system"
                      ? "bg-secondary/50 border border-border"
                      : "bg-card border border-border"
                  }`}
                >
                  {msg.aiGenerated && (
                    <div className="flex items-center gap-1 mb-1">
                      <Bot size={8} className="text-primary/50" />
                      <span className="font-body text-[7px] tracking-wider uppercase text-primary/50">AI Generated</span>
                    </div>
                  )}
                  <p className="font-body text-[12px] text-foreground/90 leading-relaxed">{msg.text}</p>
                  <p className="font-body text-[8px] text-primary/40 text-right">{msg.time}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick replies */}
          <div className="px-5 py-2 border-t border-border/50">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {quickReplies.map((r) => (
                <button
                  key={r}
                  onClick={() => setInput(r)}
                  className="px-3 py-1.5 shrink-0 border border-primary/15 font-body text-[9px] tracking-wider text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Input bar */}
          <div className="p-4 border-t border-border shrink-0 safe-area-bottom">
            <div className="flex items-center gap-2">
              <button className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                <Paperclip size={15} />
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message…"
                className="flex-1 bg-secondary/50 border border-primary/15 px-4 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/30 transition-colors"
              />
              <button
                onTouchStart={() => setRecording(true)}
                onTouchEnd={() => setRecording(false)}
                className={`w-9 h-9 flex items-center justify-center transition-colors ${
                  recording ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Mic size={15} />
              </button>
              <button className="w-9 h-9 bg-primary text-primary-foreground flex items-center justify-center">
                <Send size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileMessaging;
