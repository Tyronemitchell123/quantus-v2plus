import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, Zap, Target, Loader2, TrendingDown, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Priority = "cost" | "speed" | "accuracy";

interface Recommendation {
  arn: string;
  name: string;
  estimatedCost: number;
  speedScore: number;
  accuracyScore: number;
  type: string;
}

export default function CostOptimizer({ onSelectDevice }: { onSelectDevice?: (arn: string, shots: number) => void }) {
  const [qubits, setQubits] = useState(3);
  const [shots, setShots] = useState(100);
  const [priority, setPriority] = useState<Priority>("cost");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    recommendations: Recommendation[];
    bestPick: Recommendation;
    potentialSavings: number;
    aiAdvice: string | null;
  } | null>(null);
  const { toast } = useToast();

  const optimize = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("quantum-cost-optimizer", {
        body: { qubits, shots, prioritize: priority },
      });
      if (error) throw error;
      setResults(data);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const priorities: { key: Priority; icon: typeof DollarSign; label: string }[] = [
    { key: "cost", icon: DollarSign, label: "Lowest Cost" },
    { key: "speed", icon: Zap, label: "Fastest" },
    { key: "accuracy", icon: Target, label: "Most Accurate" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <TrendingDown size={14} className="text-green-400" />
        <span className="text-xs font-medium text-green-400 uppercase tracking-wider">Cost Optimizer</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {priorities.map(p => (
          <button
            key={p.key}
            onClick={() => setPriority(p.key)}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              priority === p.key
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-secondary/50 text-muted-foreground border border-transparent hover:border-border"
            }`}
          >
            <p.icon size={12} />
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          type="number"
          value={qubits}
          onChange={e => setQubits(Math.max(1, Math.min(50, +e.target.value || 1)))}
          className="bg-secondary/50 border-border text-sm"
          aria-label="Qubits"
          min={1}
          max={50}
        />
        <Input
          type="number"
          value={shots}
          onChange={e => setShots(Math.max(1, +e.target.value || 1))}
          className="bg-secondary/50 border-border text-sm"
          aria-label="Shots"
          min={1}
        />
        <Button onClick={optimize} disabled={loading} size="sm" className="bg-green-600 text-white hover:bg-green-700 shrink-0">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <TrendingDown size={14} />}
          <span className="ml-1.5">Optimize</span>
        </Button>
      </div>

      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 overflow-hidden"
          >
            {results.aiAdvice && (
              <p className="text-xs text-green-400/80 bg-green-500/5 border border-green-500/10 rounded-lg px-3 py-2">
                {results.aiAdvice}
              </p>
            )}

            {results.potentialSavings > 0 && (
              <div className="text-xs text-muted-foreground">
                Potential savings: <span className="text-green-400 font-semibold">${results.potentialSavings}</span> vs most expensive option
              </div>
            )}

            <div className="space-y-1.5">
              {results.recommendations.map((r, i) => (
                <motion.button
                  key={r.arn}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => onSelectDevice?.(r.arn, shots)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-xs transition-all ${
                    i === 0
                      ? "bg-green-500/10 border border-green-500/20 hover:border-green-500/40"
                      : "bg-secondary/30 border border-transparent hover:border-border"
                  }`}
                >
                  <Cpu size={14} className={i === 0 ? "text-green-400" : "text-muted-foreground"} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground truncate">
                      {r.name}
                      {i === 0 && <span className="ml-2 text-green-400">★ Best</span>}
                    </div>
                    <div className="text-muted-foreground">{r.type}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={i === 0 ? "text-green-400 font-semibold" : "text-foreground"}>${r.estimatedCost}</div>
                    <div className="text-muted-foreground">⚡{r.speedScore} 🎯{r.accuracyScore}</div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
