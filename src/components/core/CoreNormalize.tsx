import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Terminal, Filter, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const normalisationRules = [
  { source: "External Payment API", target: "Quantus Commerce Engine", transforms: "Strip Stripe IDs → sovereign invoice refs", status: "active" },
  { source: "Wearable API Sync", target: "Biometric Pipeline", transforms: "HRV/SpO₂ → normalised health score", status: "active" },
  { source: "Availability Scraper", target: "Sovereign Intel", transforms: "Raw HTML → structured pricing JSON", status: "active" },
  { source: "Email Inbound", target: "Contact Classifier", transforms: "Raw text → intent + sentiment + priority", status: "active" },
  { source: "Quantum Circuit API", target: "Quantus Quantum Engine", transforms: "OpenQASM → result counts JSON", status: "standby" },
  { source: "Document Upload", target: "Vault Processor", transforms: "PDF/DOCX → extracted fields + metadata", status: "active" },
];

const CoreNormalize = () => {
  const [commandInput, setCommandInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([
    "› Core.Normalize boot — 6 pipelines registered",
    "› Guardian Shield: 12,340 validations — 0 breaches",
    "› Orchestrator loop #563 complete — 3 deals advanced",
    "› Concierge: 4 new client responses dispatched",
  ]);

  const { data: agentLogs } = useQuery({
    queryKey: ["agent-logs-normalize"],
    queryFn: async () => {
      const { data } = await supabase.from("agent_logs").select("*").order("created_at", { ascending: false }).limit(15);
      return data || [];
    },
  });

  const handleCommand = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && commandInput.trim()) {
      const cmd = commandInput.trim();
      setCommandHistory(prev => [...prev, `› ${cmd}`, `  ⤷ Routing to Director Agent…`]);
      setCommandInput("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Normalisation Pipelines */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium text-foreground">Normalisation Pipelines</h3>
        </div>
        <div className="space-y-3">
          {normalisationRules.map((rule, i) => (
            <motion.div key={rule.source} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant="secondary" className="text-[9px] bg-muted/50">{rule.source}</Badge>
                    <ArrowRight className="w-3 h-3 text-primary/40 shrink-0" />
                    <Badge variant="secondary" className="text-[9px] bg-primary/5 text-primary/80">{rule.target}</Badge>
                    <Badge variant="outline" className={rule.status === "active" ? "text-success border-success/30 text-[8px] ml-auto" : "text-muted-foreground text-[8px] ml-auto"}>
                      {rule.status}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2 pl-1">{rule.transforms}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Terminal Log */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Terminal className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium text-foreground">System Terminal</h3>
        </div>
        <Card className="bg-background border-border/50">
          <CardContent className="p-4">
            <div className="bg-background rounded-lg p-4 font-mono text-xs space-y-1 max-h-60 overflow-y-auto mb-3">
              {commandHistory.map((line, i) => (
                <div key={i} className={line.startsWith("  ") ? "text-primary/70 pl-2" : "text-muted-foreground"}>
                  {line}
                </div>
              ))}
              {agentLogs?.slice(0, 10).map((log) => (
                <div key={log.id} className="text-muted-foreground">
                  › [{log.agent_name}] {log.task_type} — {log.status}
                  {log.failure_reason && <span className="text-destructive"> ({log.failure_reason})</span>}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <Terminal className="w-4 h-4 text-primary shrink-0" />
              <Input
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                onKeyDown={handleCommand}
                placeholder="NLP command — e.g. 'Advance all aviation deals past sourcing'"
                className="bg-transparent border-none text-sm placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <Button size="sm" variant="ghost" className="text-primary shrink-0">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CoreNormalize;
