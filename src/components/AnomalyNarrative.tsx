import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Loader2, AlertTriangle, CheckCircle, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  alertId: string;
}

interface Narrative {
  root_cause: string;
  impact: string;
  recommendation: string;
  confidence: "high" | "medium" | "low";
}

const confidenceConfig = {
  high: { icon: CheckCircle, color: "text-emerald", label: "High confidence" },
  medium: { icon: HelpCircle, color: "text-primary", label: "Medium confidence" },
  low: { icon: AlertTriangle, color: "text-destructive", label: "Low confidence" },
};

export default function AnomalyNarrative({ alertId }: Props) {
  const [narrative, setNarrative] = useState<Narrative | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/anomaly-narratives`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ alert_id: alertId }),
        }
      );
      const result = await resp.json();
      if (!resp.ok) throw new Error(result.error || "Analysis failed");
      setNarrative(result);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!narrative && !loading) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={analyze}
        className="text-xs text-quantum-purple hover:text-quantum-purple/80 gap-1"
      >
        <Brain size={12} />
        Explain why
      </Button>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
        <Loader2 size={12} className="animate-spin" />
        Analyzing…
      </div>
    );
  }

  if (error) {
    return <p className="text-xs text-destructive py-1">{error}</p>;
  }

  if (!narrative) return null;

  const conf = confidenceConfig[narrative.confidence];
  const ConfIcon = conf.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        className="mt-2 p-3 rounded-lg bg-quantum-purple/5 border border-quantum-purple/10 space-y-2"
      >
        <div className="flex items-center gap-1.5">
          <Brain size={12} className="text-quantum-purple" />
          <span className="text-[10px] font-medium text-quantum-purple uppercase tracking-wider">AI Analysis</span>
          <span className="ml-auto flex items-center gap-1 text-[10px]">
            <ConfIcon size={10} className={conf.color} />
            <span className={conf.color}>{conf.label}</span>
          </span>
        </div>
        <div className="space-y-1.5 text-xs">
          <p><strong className="text-foreground">Root cause:</strong> <span className="text-muted-foreground">{narrative.root_cause}</span></p>
          <p><strong className="text-foreground">Impact:</strong> <span className="text-muted-foreground">{narrative.impact}</span></p>
          <p><strong className="text-foreground">Recommended:</strong> <span className="text-muted-foreground">{narrative.recommendation}</span></p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
