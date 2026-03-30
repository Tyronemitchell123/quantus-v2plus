import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Brain, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

interface PortfolioAsset {
  name: string;
  value: number;
  change: number;
  allocation: number;
}

interface Props {
  portfolio: PortfolioAsset[];
}

const INTERPRET_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/portfolio-interpret`;

const PortfolioAINarrative = ({ portfolio }: Props) => {
  const [narrative, setNarrative] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const generate = useCallback(async () => {
    setIsLoading(true);
    setNarrative("");

    try {
      const resp = await fetch(INTERPRET_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ portfolio }),
      });

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) {
          toast.error("Rate limit reached. Please try again in a moment.");
        } else if (resp.status === 402) {
          toast.error("AI credits exhausted. Please add funds to continue.");
        } else {
          toast.error("Portfolio analysis unavailable.");
        }
        setIsLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              accumulated += content;
              setNarrative(accumulated);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      setHasGenerated(true);
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate portfolio analysis.");
    } finally {
      setIsLoading(false);
    }
  }, [portfolio]);

  return (
    <Card className="border-primary/10 bg-gradient-to-br from-primary/[0.03] via-card to-card relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <CardContent className="p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/[0.08] flex items-center justify-center">
              <Brain size={15} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-body font-medium text-foreground">AI Portfolio Intelligence</p>
              <p className="text-[9px] tracking-[0.3em] uppercase text-primary/40 font-body">Sovereign Analysis Engine</p>
            </div>
          </div>
          <button
            onClick={generate}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 glass-card text-[9px] tracking-[0.25em] uppercase font-body text-muted-foreground hover:text-foreground hover:border-primary/20 transition-all duration-500 disabled:opacity-40"
          >
            {isLoading ? (
              <RefreshCw size={12} className="animate-spin" />
            ) : hasGenerated ? (
              <RefreshCw size={12} />
            ) : (
              <Sparkles size={12} />
            )}
            {isLoading ? "Analysing" : hasGenerated ? "Refresh" : "Generate"}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {!narrative && !isLoading && (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-8 text-center"
            >
              <Sparkles size={24} className="text-primary/20 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground/50 font-body">
                Generate an AI-powered narrative analysis of your portfolio.
              </p>
              <p className="text-[10px] text-muted-foreground/30 font-body mt-1">
                Risk assessment · Opportunities · Compounding outlook
              </p>
            </motion.div>
          )}

          {(narrative || isLoading) && (
            <motion.div
              key="narrative"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="prose prose-sm prose-invert max-w-none"
            >
              <div className="text-sm font-body text-foreground/90 leading-relaxed [&_h2]:text-primary/80 [&_h2]:text-xs [&_h2]:tracking-[0.2em] [&_h2]:uppercase [&_h2]:font-body [&_h2]:font-medium [&_h2]:mt-5 [&_h2]:mb-2 [&_p]:text-muted-foreground [&_p]:text-[13px] [&_strong]:text-foreground [&_li]:text-muted-foreground [&_li]:text-[13px]">
                <ReactMarkdown>{narrative}</ReactMarkdown>
              </div>
              {isLoading && (
                <div className="flex items-center gap-2 mt-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-[9px] tracking-[0.2em] uppercase text-primary/40 font-body">Interpreting portfolio…</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default PortfolioAINarrative;
