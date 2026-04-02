import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, Sparkles, ChevronLeft, Loader2, Trash2 } from "lucide-react";
import { streamChat } from "@/lib/stream-chat";
import { useAIChatPersistence } from "@/hooks/use-ai-chat-persistence";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

const defaultPrompts = [
  "Source aircraft options",
  "Prepare negotiation draft",
  "Schedule medical screening",
  "Find household staff",
  "Plan a retreat",
];

type Message = { role: "user" | "assistant"; content: string };

interface Props {
  open: boolean;
  onToggle: () => void;
}

const AIAssistantPanel = ({ open, onToggle }: Props) => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const assistantRef = useRef("");
  const sendingRef = useRef(false);
  const endRef = useRef<HTMLDivElement>(null);
  const { messages, setMessages, loaded, persistMessage, clearHistory } = useAIChatPersistence();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading || sendingRef.current) return;
    sendingRef.current = true;
    setInput("");
    const userMsg: Message = { role: "user", content: msg };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setLoading(true);
    assistantRef.current = "";

    // Persist user message
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
        // Persist assistant response
        if (assistantRef.current) {
          persistMessage("assistant", assistantRef.current);
        }
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
    <>
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
                  <span className="font-display text-sm text-foreground">Quantus V2+ Core</span>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="w-10 h-px bg-primary/40 origin-left mt-0.5"
                  />
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1"
                    title="Clear history"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
                <button onClick={onToggle} className="text-muted-foreground hover:text-foreground transition-colors p-1">
                  <ChevronLeft size={16} className="rotate-180" />
                </button>
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {showPrompts && (
                <>
                  <div className="glass-card p-4 rounded-xl">
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

                  <p className="font-body text-[10px] tracking-[0.25em] uppercase text-gold-soft/40 mb-1">Suggested</p>
                  <div className="space-y-2">
                    {defaultPrompts.map((p) => (
                      <button
                        key={p}
                        onClick={() => send(p)}
                        className="w-full text-left px-4 py-3 rounded-lg border border-border/40 hover:border-gold-soft/30 font-body text-xs text-muted-foreground hover:text-foreground transition-all duration-300"
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
                  <div className={`max-w-[85%] rounded-xl px-4 py-3 text-xs leading-relaxed ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "glass-card rounded-bl-sm text-foreground"
                  }`}>
                    {m.role === "assistant" ? (
                      <div className="prose prose-sm prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-primary prose-li:text-foreground text-xs">
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

            {/* Input */}
            <div className="p-4 border-t border-border/50 shrink-0">
              <div className="flex gap-2 items-center">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="How may I assist?"
                  className="flex-1 bg-transparent border border-gold-soft/15 rounded-lg px-4 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 focus:shadow-[0_0_12px_-4px_hsl(var(--gold)/0.15)] transition-all duration-300"
                />
                <button
                  onClick={() => send()}
                  disabled={loading || !input.trim()}
                  className="px-3 py-2.5 rounded-lg bg-primary text-primary-foreground hover:brightness-110 transition-all disabled:opacity-30"
                >
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
