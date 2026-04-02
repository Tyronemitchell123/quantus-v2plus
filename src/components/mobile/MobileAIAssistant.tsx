import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bot, Sparkles, Loader2 } from "lucide-react";
import { streamChat } from "@/lib/stream-chat";
import { useAIChatPersistence } from "@/hooks/use-ai-chat-persistence";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

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
  const [loading, setLoading] = useState(false);
  const assistantRef = useRef("");
  const sendingRef = useRef(false);
  const endRef = useRef<HTMLDivElement>(null);
  const { messages, setMessages, loaded, persistMessage } = useAIChatPersistence();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading || sendingRef.current) return;
    sendingRef.current = true;
    setInput("");
    const userMsg = { role: "user" as const, content: msg };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setLoading(true);
    assistantRef.current = "";

    persistMessage("user", msg);

    await streamChat({
      messages: allMessages,
      onDelta: (chunk) => {
        assistantRef.current += chunk;
        const soFar = assistantRef.current;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && prev.length > allMessages.length) {
            return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: soFar } : m));
          }
          return [...prev, { role: "assistant", content: soFar }];
        });
      },
      onDone: () => {
        if (assistantRef.current) persistMessage("assistant", assistantRef.current);
        sendingRef.current = false;
        setLoading(false);
      },
      onError: (msg) => {
        sendingRef.current = false;
        setLoading(false);
        toast.error(msg);
      },
    });
  };

  const showPrompts = messages.length === 0 && loaded;

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
                Quantus V2+ Core
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
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {showPrompts && (
              <>
                <div className="glass-card p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full border border-primary/30 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot size={14} className="text-primary" />
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

                <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2">
                  Suggested
                </p>
                <div className="space-y-2">
                  {prompts.map((p) => (
                    <button
                      key={p}
                      onClick={() => send(p)}
                      className="w-full text-left px-4 py-3 border border-border hover:border-primary/20 font-body text-sm text-muted-foreground hover:text-foreground transition-all duration-300 active:bg-primary/5"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </>
            )}

            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-2 ${m.role === "user" ? "justify-end" : ""}`}
              >
                {m.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full border border-primary/30 bg-primary/5 flex items-center justify-center shrink-0 mt-1">
                    <Bot size={10} className="text-primary" />
                  </div>
                )}
                <div className={`max-w-[85%] rounded-xl px-3 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "glass-card rounded-bl-sm text-foreground"
                }`}>
                  {m.role === "assistant" ? (
                    <div className="prose prose-sm prose-invert max-w-none text-sm">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  ) : m.content}
                </div>
              </motion.div>
            ))}

            {loading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full border border-primary/30 bg-primary/5 flex items-center justify-center shrink-0">
                  <Bot size={10} className="text-primary" />
                </div>
                <div className="glass-card rounded-xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input bar */}
          <div className="p-4 border-t border-border shrink-0 safe-area-bottom">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ask Quantus V2+..."
                className="flex-1 bg-secondary/50 border border-primary/20 px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/30 transition-colors rounded-lg"
              />
              <button
                onClick={() => send()}
                disabled={loading || !input.trim()}
                className="w-11 h-11 bg-primary text-primary-foreground flex items-center justify-center rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-30"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileAIAssistant;
