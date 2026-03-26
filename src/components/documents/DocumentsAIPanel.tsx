import { useState, useRef } from "react";
import { Bot, Send, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DocumentsAIPanelProps {
  prompts: string[];
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

const DocumentsAIPanel = ({ prompts }: DocumentsAIPanelProps) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("concierge-chat", {
        body: { messages: newMessages.map(m => ({ role: m.role, content: m.content })) },
      });

      if (error) throw error;

      // Handle streaming response
      const reader = data?.body?.getReader?.();
      if (reader) {
        let result = "";
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n").filter(l => l.startsWith("data: "));
          for (const line of lines) {
            const json = line.slice(6);
            if (json === "[DONE]") continue;
            try {
              const parsed = JSON.parse(json);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) result += delta;
            } catch {}
          }
        }
        setMessages([...newMessages, { role: "assistant", content: result || "No response received." }]);
      } else {
        // Non-streaming fallback
        const text = typeof data === "string" ? data : JSON.stringify(data);
        setMessages([...newMessages, { role: "assistant", content: text }]);
      }
    } catch (e: any) {
      setMessages([...newMessages, { role: "assistant", content: "I apologise — an error occurred. Please try again." }]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }), 100);
    }
  };

  return (
    <div className="glass-card p-5 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={12} className="text-primary" />
        <span className="font-body text-[10px] tracking-[0.25em] uppercase text-primary/70">Document Intelligence</span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.length === 0 ? (
          <div className="glass-card p-3">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full border border-primary/30 flex items-center justify-center shrink-0 mt-0.5">
                <Bot size={8} className="text-primary" />
              </div>
              <p className="font-body text-xs text-muted-foreground leading-relaxed">
                Document suite ready.<br />
                <span className="text-primary/60 italic">How may I assist?</span>
              </p>
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`flex items-start gap-2 ${m.role === "user" ? "justify-end" : ""}`}>
              {m.role === "assistant" && (
                <div className="w-5 h-5 rounded-full border border-primary/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot size={8} className="text-primary" />
                </div>
              )}
              <div className={`max-w-[85%] px-3 py-2 font-body text-[11px] leading-relaxed ${
                m.role === "user"
                  ? "bg-primary/10 border border-primary/20 text-foreground"
                  : "glass-card text-muted-foreground"
              }`}>
                {m.content}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full border border-primary/30 flex items-center justify-center">
              <Loader2 size={8} className="text-primary animate-spin" />
            </div>
            <span className="font-body text-[10px] text-muted-foreground italic">Thinking...</span>
          </div>
        )}
      </div>

      <p className="font-body text-[9px] tracking-[0.2em] uppercase text-muted-foreground mb-2">Suggested</p>
      <div className="space-y-1.5 max-h-24 overflow-y-auto mb-4">
        {prompts.map((p) => (
          <button
            key={p}
            onClick={() => { setInput(p); }}
            className="w-full text-left px-3 py-2 border border-border hover:border-primary/20 font-body text-[11px] text-muted-foreground hover:text-foreground transition-all duration-300"
          >
            {p}
          </button>
        ))}
      </div>

      <div className="mt-auto flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask about documents..."
          className="flex-1 bg-secondary/50 border border-border px-3 py-2 font-body text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/30 transition-colors"
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="px-2.5 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Send size={12} />
        </button>
      </div>
    </div>
  );
};

export default DocumentsAIPanel;
