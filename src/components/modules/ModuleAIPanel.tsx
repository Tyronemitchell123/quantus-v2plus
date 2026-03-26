import { Bot, Send, Sparkles, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { streamChat } from "@/lib/stream-chat";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

interface ModuleAIPanelProps {
  prompts: string[];
}

type Message = { role: "user" | "assistant"; content: string };

const ModuleAIPanel = ({ prompts }: ModuleAIPanelProps) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const assistantRef = useRef("");
  const sendingRef = useRef(false);
  const endRef = useRef<HTMLDivElement>(null);

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
      },
      onError: (msg) => {
        sendingRef.current = false;
        setLoading(false);
        toast.error(msg);
      },
    });
  };

  const showPrompts = messages.length === 0;

  return (
    <div className="glass-card p-5 h-full flex flex-col rounded-xl">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={12} className="text-primary" />
        <span className="font-body text-[10px] tracking-[0.25em] uppercase text-primary/70">Quantus Core</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
        {showPrompts && (
          <>
            <div className="glass-card p-3 rounded-lg">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full border border-primary/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot size={8} className="text-primary" />
                </div>
                <p className="font-body text-xs text-muted-foreground leading-relaxed">
                  Ready to assist.<br />
                  <span className="text-primary/60 italic">Select a prompt or ask freely.</span>
                </p>
              </div>
            </div>

            <p className="font-body text-[9px] tracking-[0.2em] uppercase text-muted-foreground mb-1">Suggested</p>
            <div className="space-y-1.5">
              {prompts.map((p) => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  className="w-full text-left px-3 py-2 border border-border rounded-lg hover:border-primary/20 font-body text-[11px] text-muted-foreground hover:text-foreground transition-all duration-300"
                >
                  {p}
                </button>
              ))}
            </div>
          </>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : ""}`}>
            {m.role === "assistant" && (
              <div className="w-5 h-5 rounded-full border border-primary/30 flex items-center justify-center shrink-0 mt-0.5">
                <Bot size={8} className="text-primary" />
              </div>
            )}
            <div className={`max-w-[90%] rounded-lg px-3 py-2 text-[11px] leading-relaxed ${
              m.role === "user"
                ? "bg-primary text-primary-foreground rounded-br-sm"
                : "glass-card rounded-bl-sm text-foreground"
            }`}>
              {m.role === "assistant" ? (
                <div className="prose prose-sm prose-invert max-w-none text-[11px] prose-headings:text-foreground prose-p:text-foreground prose-strong:text-primary">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              ) : m.content}
            </div>
          </div>
        ))}

        {loading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex gap-2">
            <div className="w-5 h-5 rounded-full border border-primary/30 flex items-center justify-center shrink-0">
              <Bot size={8} className="text-primary" />
            </div>
            <div className="glass-card rounded-lg px-3 py-2">
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

      <div className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask Quantus..."
          className="flex-1 bg-secondary/50 border border-border rounded-lg px-3 py-2 font-body text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/30 transition-colors"
        />
        <button
          onClick={() => send()}
          disabled={loading || !input.trim()}
          className="px-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-30"
        >
          <Send size={12} />
        </button>
      </div>
    </div>
  );
};

export default ModuleAIPanel;
