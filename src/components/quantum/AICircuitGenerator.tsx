import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AICircuitGeneratorProps {
  onGenerated: (circuit: string) => void;
}

export default function AICircuitGenerator({ onGenerated }: AICircuitGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const { toast } = useToast();

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setExplanation(null);

    try {
      const { data, error } = await supabase.functions.invoke("ai-circuit-generator", {
        body: { description: prompt.trim() },
      });

      if (error) throw error;
      if (data?.error) {
        toast({ title: "Generation failed", description: data.error, variant: "destructive" });
        return;
      }

      if (data?.circuit) {
        onGenerated(data.circuit);
        setExplanation(data.explanation || null);
        toast({ title: "Circuit generated!", description: data.explanation || "Ready to submit." });
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to generate circuit", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Wand2 size={14} className="text-quantum-purple" />
        <span className="text-xs font-medium text-quantum-purple uppercase tracking-wider">AI Circuit Generator</span>
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="Describe what you want… e.g. 'create a 3-qubit GHZ state'"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && generate()}
          className="bg-secondary/50 border-border text-sm"
        />
        <Button
          onClick={generate}
          disabled={loading || !prompt.trim()}
          size="sm"
          className="bg-quantum-purple text-white hover:bg-quantum-purple/90 gap-1.5 shrink-0"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          Generate
        </Button>
      </div>
      <AnimatePresence>
        {explanation && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-xs text-quantum-purple/80 bg-quantum-purple/5 border border-quantum-purple/10 rounded-lg px-3 py-2"
          >
            {explanation}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
