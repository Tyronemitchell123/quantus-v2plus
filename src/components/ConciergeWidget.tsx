import { useState, useRef, useEffect, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, Sparkles } from "lucide-react";
import conciergeGlowBg from "@/assets/concierge-glow-bg.jpg";
import holoAvatarTexture from "@/assets/holographic-avatar-texture.jpg";
import { streamChat } from "@/lib/stream-chat";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";

const HolographicAvatar = lazy(() => import("@/components/HolographicAvatar"));

type Message = { role: "user" | "assistant"; content: string };

const ConciergeWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your NEXUS concierge. How can I assist you?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const assistantRef = useRef("");
  const sendingRef = useRef(false);
  const location = useLocation();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Hide on the dedicated /chat page
  if (location.pathname === "/chat") return null;

  const send = async () => {
    const text = input.trim();
    if (!text || loading || sendingRef.current) return;
    sendingRef.current = true;
    setInput("");
    const userMsg: Message = { role: "user", content: text };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setLoading(true);
    assistantRef.current = "";

    await streamChat({
      messages: allMessages,
      onDelta: (chunk) => {
        assistantRef.current += chunk;
        const soFar = assistantRef.current;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && prev.length > allMessages.length) {
            return prev.map((m, i) =>
              i === prev.length - 1 ? { ...m, content: soFar } : m
            );
          }
          return [...prev, { role: "assistant", content: soFar }];
        });
      },
      onDone: () => {
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

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/30 flex items-center justify-center hover:shadow-primary/50 transition-shadow group"
          >
            {/* Mini avatar inside button */}
            <div className="w-full h-full rounded-full overflow-hidden relative">
              <Suspense
                fallback={
                  <div className="w-full h-full flex items-center justify-center">
                    <MessageCircle size={24} />
                  </div>
                }
              >
                <HolographicAvatar speaking={loading} />
              </Suspense>
            </div>
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-full border-2 border-primary/40 animate-ping" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat popup */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-6 right-6 z-50 w-[380px] h-[520px] rounded-2xl overflow-hidden flex flex-col border border-border/50 shadow-2xl shadow-black/40"
            style={{
              background: "hsl(0 0% 5% / 0.95)",
              backdropFilter: "blur(24px)",
            }}
          >
            {/* Header with glow bg */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 relative overflow-hidden">
              <img src={conciergeGlowBg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
              <div className="absolute inset-0 bg-background/70" />
              <div className="w-10 h-10 rounded-full overflow-hidden relative shrink-0 ring-2 ring-primary/30">
                <img src={holoAvatarTexture} alt="NEXUS" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0 relative">
                <h3 className="font-display text-sm font-semibold text-foreground tracking-wide">
                  NEXUS Concierge
                </h3>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse" />
                  <span className="text-[10px] text-muted-foreground">Online</span>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3">
              <div className="space-y-3">
                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex gap-2 ${m.role === "user" ? "justify-end" : ""}`}
                  >
                    {m.role === "assistant" && (
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 ring-1 ring-primary/20">
                        <Bot size={10} className="text-primary" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                        m.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "glass-card rounded-bl-sm text-foreground"
                      }`}
                    >
                      {m.role === "assistant" ? (
                        <div className="prose prose-xs prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-primary prose-p:my-1 prose-headings:my-1">
                          <ReactMarkdown>{m.content}</ReactMarkdown>
                        </div>
                      ) : (
                        m.content
                      )}
                    </div>
                    {m.role === "user" && (
                      <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                        <User size={10} className="text-muted-foreground" />
                      </div>
                    )}
                  </motion.div>
                ))}

                {loading && messages[messages.length - 1]?.role !== "assistant" && (
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 ring-1 ring-primary/20">
                      <Bot size={10} className="text-primary" />
                    </div>
                    <div className="glass-card rounded-xl rounded-bl-sm px-3 py-2">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse [animation-delay:0.4s]" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={endRef} />
              </div>
            </div>

            {/* Input */}
            <div className="border-t border-border/50 p-3">
              <div className="flex gap-2 items-center">
                <div className="flex-1 relative">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    placeholder="Ask anything..."
                    className="w-full bg-secondary/80 border border-border rounded-full px-4 py-2.5 pr-9 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                  />
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                    <Sparkles size={10} className="text-muted-foreground/40" />
                  </div>
                </div>
                <button
                  onClick={send}
                  disabled={loading || !input.trim()}
                  className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-all disabled:opacity-30 shadow-lg shadow-primary/20 shrink-0"
                >
                  <Send size={13} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ConciergeWidget;
