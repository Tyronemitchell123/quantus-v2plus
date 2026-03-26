import { useState } from "react";
import { Bot, Send, Sparkles } from "lucide-react";

interface DocumentsAIPanelProps {
  prompts: string[];
}

const DocumentsAIPanel = ({ prompts }: DocumentsAIPanelProps) => {
  const [input, setInput] = useState("");

  return (
    <div className="glass-card p-5 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={12} className="text-primary" />
        <span className="font-body text-[10px] tracking-[0.25em] uppercase text-primary/70">Document Intelligence</span>
      </div>

      <div className="glass-card p-3 mb-4">
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

      <p className="font-body text-[9px] tracking-[0.2em] uppercase text-muted-foreground mb-2">Suggested</p>
      <div className="space-y-1.5 flex-1 overflow-y-auto">
        {prompts.map((p) => (
          <button
            key={p}
            onClick={() => setInput(p)}
            className="w-full text-left px-3 py-2 border border-border hover:border-primary/20 font-body text-[11px] text-muted-foreground hover:text-foreground transition-all duration-300"
          >
            {p}
          </button>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about documents..."
          className="flex-1 bg-secondary/50 border border-border px-3 py-2 font-body text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/30 transition-colors"
        />
        <button className="px-2.5 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
          <Send size={12} />
        </button>
      </div>
    </div>
  );
};

export default DocumentsAIPanel;
