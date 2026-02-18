import { useState, useRef, useEffect, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Sparkles, Shield, Zap, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { useVoice } from "@/hooks/use-voice";

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
  const endRef = useRef<HTMLDivElement>(null);

  const { listening, speaking, supported, startListening, stopListening, speak, stopSpeaking } =
    useVoice({
      onResult: (transcript) => setInput(transcript),
    });

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    setTimeout(() => {
      const reply =
        "Thank you for your message. The AI backend will be connected soon to deliver real-time intelligent responses. For now, explore the platform and its features.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply },
      ]);
      setLoading(false);
      if (ttsEnabled) speak(reply);
    }, 1500);
  };

  return (
    <div className="pt-16 flex flex-col h-screen bg-background relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/[0.03] rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/[0.03] rounded-full blur-[80px]" />
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
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-primary/20">
                <Bot size={18} className="text-primary" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald border-2 border-background" />
            </div>
            <div>
              <h2 className="font-display text-sm font-semibold text-foreground tracking-wide">
                NEXUS Concierge
              </h2>
              <p className="text-xs text-muted-foreground">Holographic AI • Premium Tier</p>
            </div>
            {/* Mobile avatar peek */}
            <div className="lg:hidden ml-auto w-16 h-16 relative">
              <Suspense fallback={null}>
                <HolographicAvatar speaking={loading || speaking} />
              </Suspense>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="max-w-2xl mx-auto space-y-5">
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
                      className={`max-w-[78%] rounded-2xl px-5 py-3 text-sm leading-relaxed ${
                        m.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-md shadow-lg shadow-primary/20"
                          : "glass-card rounded-bl-md text-foreground"
                      }`}
                    >
                      {m.content}
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
                    className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shrink-0 ${
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
                    className="w-full bg-secondary/80 border border-border rounded-full px-5 py-3 pr-12 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
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
                    className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shrink-0 ${
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
                  className="w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-all disabled:opacity-30 shadow-lg shadow-primary/20 hover:shadow-primary/40 shrink-0"
                >
                  <Send size={16} />
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
