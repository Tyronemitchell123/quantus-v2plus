import { motion } from "framer-motion";
import { Brain, Sparkles, MessageSquare, ScanSearch, FileText, Gauge } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const models = [
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", provider: "Quantus AI", role: "Primary reasoning & classification", usage: "Intake, Negotiation, Brand Audit", status: "active", icon: Brain },
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", provider: "Quantus AI", role: "Fast inference & summarisation", usage: "Concierge, Outreach drafts", status: "active", icon: Sparkles },
  { id: "gpt-5", name: "Sovereign Reasoning Engine", provider: "Quantus AI", role: "Complex multi-step planning", usage: "Director Agent, Deal Autopilot", status: "active", icon: MessageSquare },
  { id: "gpt-5-mini", name: "Sovereign Mini", provider: "Quantus AI", role: "Cost-efficient classification", usage: "Contact triage, Sentiment", status: "active", icon: ScanSearch },
  { id: "nlp-extract", name: "NLP Extraction Pipeline", provider: "Quantus Core", role: "Entity extraction & normalisation", usage: "NLP Tools, Document parsing", status: "active", icon: FileText },
  { id: "anomaly", name: "Anomaly Detection", provider: "Quantus Core", role: "Statistical outlier detection", usage: "Revenue anomalies, Pipeline health", status: "standby", icon: Gauge },
];

const CoreModels = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {models.map((model, i) => (
        <motion.div key={model.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
          <Card className="bg-card/60 backdrop-blur-sm border-border/50 hover:border-primary/20 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center shrink-0 mt-0.5">
                  <model.icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-medium text-foreground">{model.name}</h3>
                    <Badge variant="outline" className={model.status === "active" ? "text-success border-success/30 text-[9px]" : "text-muted-foreground text-[9px]"}>
                      {model.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{model.role}</p>
                  <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span className="text-primary/60">{model.provider}</span>
                    <span>·</span>
                    <span>{model.usage}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default CoreModels;
