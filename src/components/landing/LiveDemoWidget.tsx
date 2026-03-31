import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, Sparkles, X, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { streamChat } from "@/lib/stream-chat";
import { useVoice } from "@/hooks/use-voice";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

type Message = { role: "user" | "assistant"; content: string };

const DEMO_PROMPTS = [
  "Source a private jet London → Dubai",
  "Find a luxury villa in Monaco",
  "Arrange a specialist consultation",
  "Coordinate yacht charter in Croatia",
];

const LiveDemoWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Welcome to the **QUANTUS V2+** demo. I'm your AI concierge — ask me anything about aviation, luxury real estate, medical travel, yachting, or lifestyle management.\n\nTry a prompt below, or speak naturally.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const assistantRef = useRef("");
  const sendingRef = useRef(false);

  const { listening, speaking, supported, startListening, stopListening, speak, stopSpeaking } =
    useVoice({ onResult: (t) => setInput(t) });

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = useCallback(
    async (overrideText?: string) => {
      const text = (overrideText || input).trim();
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
          if (ttsEnabled && assistantRef.current) {
            const plain = assistantRef.current.replace(/[#*_`~>\[\]()!|-]/g, "").slice(0, 500);
            speak(plain);
          }
        },
        onError: () => {
          sendingRef.current = false;
          setLoading(false);
          // Graceful fallback for unauthenticated demo users
          const fallback =
            "Thank you for trying the live demo! To unlock the full AI concierge experience — including real-time sourcing, vendor outreach, and deal orchestration — **[create your account](/auth)** in seconds. No credit card required.";
          assistantRef.current = fallback;
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.role === "assistant" && prev.length > allMessages.length) {
              return prev.map((m, i) =>
                i === prev.length - 1 ? { ...m, content: fallback } : m
              );
            }
            return [...prev, { role: "assistant", content: fallback }];
          });
        },
      });
    },
    [input, loading, messages, ttsEnabled, speak]
  );

  return (
    <>
      {/* Trigger button on hero */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 px-8 py-4 font-body text-[10px] font-medium tracking-[0.3em] uppercase border border-primary/40 text-primary rounded-xl hover:bg-primary/[0.06] hover:border-primary/60 transition-all duration-500 group"
          >
            <Sparkles size={14} className="group-hover:animate-pulse" />
            Try Live Demo
          </motion.button>
        )}
      </AnimatePresence>

      {/* Demo panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/80 backdrop-blur-lg"
          >
            <motion.div
              className="w-full max-w-lg h-[80vh] max-h-[700px] rounded-2xl border border-border/50 flex flex-col overflow-hidden shadow-2xl shadow-primary/10"
              style={{ background: "hsl(0 0% 4% / 0.97)" }}
            >
              {/* Header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-border/40">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-primary/30">
                  <Bot size={18} className="text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-sm font-semibold text-foreground tracking-wide">
                    QUANTUS V2+ — Live Demo
                  </h3>
                  <p className="text-[10px] text-foreground/60 tracking-wider uppercase">
                    No signup required
                  </p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-9 h-9 rounded-full bg-secondary hover:bg-destructive/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2 ${m.role === "user" ? "justify-end" : ""}`}
                  >
                    {m.role === "assistant" && (
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 ring-1 ring-primary/20">
                        <Bot size={10} className="text-primary" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                        m.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-card border border-border/40 rounded-bl-sm text-foreground"
                      }`}
                    >
                      {m.role === "assistant" ? (
                        <div className="prose prose-xs prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground/95 prose-strong:text-primary prose-li:text-foreground/90 prose-p:my-1">
                          <ReactMarkdown>{m.content}</ReactMarkdown>
                        </div>
                      ) : (
                        m.content
                      )}
                    </div>
                  </motion.div>
                ))}

                {loading && messages[messages.length - 1]?.role !== "assistant" && (
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 ring-1 ring-primary/20">
                      <Bot size={10} className="text-primary" />
                    </div>
                    <div className="bg-card border border-border/40 rounded-xl rounded-bl-sm px-3 py-2">
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

              {/* Suggested prompts */}
              {messages.length <= 2 && (
                <div className="px-4 pb-2">
                  <div className="flex flex-wrap gap-1.5">
                    {DEMO_PROMPTS.map((p) => (
                      <button
                        key={p}
                        onClick={() => send(p)}
                        disabled={loading}
                        className="text-[10px] tracking-wider uppercase px-3 py-1.5 rounded-full border border-primary/20 text-primary/70 hover:bg-primary/[0.06] hover:border-primary/40 transition-all disabled:opacity-30"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="border-t border-border/40 p-3">
                <div className="flex gap-1.5 items-center">
                  {supported.stt && (
                    <button
                      onClick={listening ? stopListening : startListening}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shrink-0 ${
                        listening
                          ? "bg-destructive text-destructive-foreground animate-pulse shadow-lg shadow-destructive/30"
                          : "bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {listening ? <MicOff size={12} /> : <Mic size={12} />}
                    </button>
                  )}

                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    placeholder={listening ? "Listening..." : "Ask the concierge anything..."}
                    className="flex-1 bg-secondary/80 border border-border rounded-full px-5 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                  />

                  {supported.tts && (
                    <button
                      onClick={() => {
                        if (speaking) stopSpeaking();
                        setTtsEnabled((v) => !v);
                      }}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shrink-0 ${
                        ttsEnabled
                          ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                          : "bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {ttsEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
                    </button>
                  )}

                  <button
                    onClick={() => send()}
                    disabled={loading || !input.trim()}
                    className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-all disabled:opacity-30 shadow-lg shadow-primary/20 shrink-0"
                  >
                    <Send size={12} />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LiveDemoWidget;
