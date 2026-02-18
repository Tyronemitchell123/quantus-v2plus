import { useState, useRef, useEffect, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Sparkles, Shield, Zap, Mic, MicOff, Volume2, VolumeX, AArrowUp, AArrowDown } from "lucide-react";
import conciergeGlowBg from "@/assets/concierge-glow-bg.jpg";
import holoAvatarTexture from "@/assets/holographic-avatar-texture.jpg";
import { useVoice } from "@/hooks/use-voice";
import { streamChat } from "@/lib/stream-chat";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

const HolographicAvatar = lazy(() => import("@/components/HolographicAvatar"));

type Message = { role: "user" | "assistant"; content: string };

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Welcome to NEXUS AI. I'm your premium AI concierge — here to assist with strategy, analytics, market intelligence, and anything else you need. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [largeText, setLargeText] = useState(() => localStorage.getItem("nexus-large-text") === "true");
  const endRef = useRef<HTMLDivElement>(null);

  const { listening, speaking, supported, startListening, stopListening, speak, stopSpeaking } =
    useVoice({
      onResult: (transcript) => setInput(transcript),
    });

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const assistantRef = useRef("");
  const sendingRef = useRef(false);

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
            return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: soFar } : m));
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
      onError: (msg) => {
        sendingRef.current = false;
        setLoading(false);
        toast.error(msg);
      },
    });
  };

  return (
    <div className="pt-16 flex flex-col h-screen bg-background relative overflow-hidden">
      {/* Ambient background effects — generated luxury glow */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src={conciergeGlowBg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-background/60" />
      </div>

      {/* Full-width scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-[1] opacity-[0.015]"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 3px, hsl(var(--primary) / 0.08) 3px, hsl(var(--primary) / 0.08) 6px)`,
        }}
      />

      <div className="flex-1 flex relative z-[2]">
        {/* Left: Holographic Avatar Panel */}
        <div className="hidden lg:flex w-[420px] flex-col items-center justify-center relative border-r border-border/50">
          {/* Holographic avatar */}
          <div className="w-full h-[60%] relative">
            <Suspense
              fallback={
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                </div>
              }
            >
              <HolographicAvatar speaking={loading || speaking} />
            </Suspense>
          </div>

          {/* Status indicators */}
          <div className="absolute bottom-8 left-0 right-0 px-8 space-y-3">
            <div className="glass-card rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald animate-pulse" />
              <span className="text-xs font-body text-muted-foreground tracking-wider uppercase">
                Concierge Online
              </span>
            </div>
            <div className="flex gap-2">
              {[
                { icon: Shield, label: "Encrypted" },
                { icon: Zap, label: "Real-time" },
                { icon: Sparkles, label: "AI-Powered" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex-1 glass-card rounded-lg px-2 py-2 flex flex-col items-center gap-1"
                >
                  <Icon size={12} className="text-primary" />
                  <span className="text-[10px] text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Chat Panel */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="border-b border-border/50 glass px-6 py-4 flex items-center gap-4">
            <div className="relative">
              <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-primary/20">
                <img src={holoAvatarTexture} alt="NEXUS AI" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald border-2 border-background" />
            </div>
            <div>
              <h2 className="font-display text-sm font-semibold text-foreground tracking-wide">
                NEXUS Concierge
              </h2>
              <p className="text-xs text-muted-foreground">Holographic AI • Premium Tier</p>
            </div>
            {/* Font size toggle */}
            <button
              onClick={() => setLargeText((v) => { const next = !v; localStorage.setItem("nexus-large-text", String(next)); return next; })}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 ${
                largeText
                  ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
              title={largeText ? "Normal text" : "Large text"}
            >
              {largeText ? <AArrowDown size={16} /> : <AArrowUp size={16} />}
            </button>
            {/* Mobile avatar peek */}
            <div className="lg:hidden ml-auto w-16 h-16 relative">
              <Suspense fallback={null}>
                <HolographicAvatar speaking={loading || speaking} />
              </Suspense>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="max-w-2xl mx-auto space-y-6">
              <AnimatePresence>
                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}
                  >
                    {m.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1 ring-1 ring-primary/20">
                        <Bot size={14} className="text-primary" />
                      </div>
                    )}
                    <div
                      className={`max-w-[78%] rounded-2xl ${largeText ? "px-7 py-5 text-lg" : "px-6 py-4 text-base"} leading-relaxed ${
                        m.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-md shadow-lg shadow-primary/20"
                          : "glass-card rounded-bl-md text-foreground"
                      }`}
                    >
                      {m.role === "assistant" ? (
                        <div className={`prose ${largeText ? "prose-lg" : "prose-base"} prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-primary prose-li:text-foreground prose-a:text-accent`}>
                          <ReactMarkdown>{m.content}</ReactMarkdown>
                        </div>
                      ) : (
                        m.content
                      )}
                    </div>
                    {m.role === "user" && (
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-1">
                        <User size={14} className="text-muted-foreground" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 ring-1 ring-primary/20">
                    <Bot size={14} className="text-primary" />
                  </div>
                  <div className="glass-card rounded-2xl rounded-bl-md px-5 py-3">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse [animation-delay:0.2s]" />
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse [animation-delay:0.4s]" />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={endRef} />
            </div>
          </div>

          {/* Input area */}
          <div className="border-t border-border/50 glass p-4">
            <div className="max-w-2xl mx-auto">
              <div className="flex gap-2 items-center">
                {/* Voice toggle */}
                {supported.stt && (
                  <button
                    onClick={listening ? stopListening : startListening}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shrink-0 ${
                      listening
                        ? "bg-destructive text-destructive-foreground animate-pulse shadow-lg shadow-destructive/30"
                        : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                    }`}
                    title={listening ? "Stop listening" : "Voice input"}
                  >
                    {listening ? <MicOff size={16} /> : <Mic size={16} />}
                  </button>
                )}

                <div className="flex-1 relative">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    placeholder={listening ? "Listening..." : "Ask the concierge anything..."}
                    className={`w-full bg-secondary/80 border border-border rounded-full ${largeText ? "px-7 py-5 pr-16 text-lg" : "px-6 py-4 pr-14 text-base"} text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Sparkles size={14} className="text-muted-foreground/40" />
                  </div>
                </div>

                {/* TTS toggle */}
                {supported.tts && (
                  <button
                    onClick={() => {
                      if (speaking) stopSpeaking();
                      setTtsEnabled((v) => !v);
                    }}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shrink-0 ${
                      ttsEnabled
                        ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                    title={ttsEnabled ? "Mute voice" : "Enable voice"}
                  >
                    {ttsEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                  </button>
                )}

                <button
                  onClick={send}
                  disabled={loading || !input.trim()}
                  className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-all disabled:opacity-30 shadow-lg shadow-primary/20 hover:shadow-primary/40 shrink-0"
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="text-center text-[10px] text-muted-foreground/50 mt-2 tracking-wider">
                {listening ? "🎙️ VOICE INPUT ACTIVE" : "END-TO-END ENCRYPTED • NEXUS AI v2.0"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
