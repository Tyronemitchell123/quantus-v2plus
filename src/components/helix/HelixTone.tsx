import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquareText, ShieldCheck, AlertTriangle, CheckCircle2, RefreshCw, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { auditTone, getDefaultProfile } from "@/lib/quantus-helix";
import type { HelixToneFinding } from "@/lib/quantus-types";

const toneRules = [
  { label: "Voice", value: "Authoritative yet understated — never sells, only reveals" },
  { label: "Register", value: "Executive boardroom, not marketing collateral" },
  { label: "Emotion", value: "Controlled confidence — the calm of absolute certainty" },
  { label: "Prohibited", value: "Exclamation marks, emojis, superlatives, sales language" },
  { label: "Sentence Length", value: "Short, declarative. Maximum 25 words per sentence" },
  { label: "Person", value: "Third-person institutional — 'Quantus orchestrates' not 'we orchestrate'" },
];

const HelixTone = () => {
  const [auditText, setAuditText] = useState("");
  const [auditResult, setAuditResult] = useState<"passed" | null>(null);
  const [findings, setFindings] = useState<HelixToneFinding[]>([]);
  const [isAuditing, setIsAuditing] = useState(false);

  const runAIAudit = async () => {
    if (!auditText.trim()) return;
    setIsAuditing(true);
    setFindings([]);
    setAuditResult(null);

    try {
      // Try AI audit first
      const { data, error } = await supabase.functions.invoke("helix-brand-audit", {
        body: { text: auditText, mode: "tone" },
      });

      if (error) throw error;

      if (data?.findings && data.findings.length > 0) {
        setFindings(data.findings);
      } else {
        setAuditResult("passed");
        toast.success("Tone audit passed — fully aligned with Quantus voice");
      }
    } catch {
      // Fallback to local Helix API
      const profile = getDefaultProfile();
      const result = auditTone(auditText, profile.tone);

      if (result.passed) {
        setAuditResult("passed");
        toast.success("Tone audit passed — fully aligned");
      } else {
        setFindings(result.findings);
      }
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tone Rules */}
      <div className="space-y-3">
        {toneRules.map((rule, i) => (
          <motion.div key={rule.label} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Card className="sovereign-card rounded-xl">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquareText className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-medium text-foreground">{rule.label}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{rule.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* AI Tone Enforcer */}
      <Card className="sovereign-card rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <ShieldCheck className="w-4 h-4 text-primary" />
            AI Tone Enforcer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Paste any outbound communication to audit against Quantus tone and voice guidelines.
          </p>
          <Textarea
            value={auditText}
            onChange={(e) => setAuditText(e.target.value)}
            placeholder="Paste text to audit against tone guidelines…"
            rows={5}
            className="bg-background border-border/50"
          />
          <Button onClick={runAIAudit} disabled={isAuditing || !auditText.trim()} className="gap-2">
            {isAuditing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {isAuditing ? "Auditing…" : "Run Tone Audit"}
          </Button>

          {findings.length > 0 && (
            <div className="space-y-2 mt-4">
              {findings.map((r, i) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${r.severity === "violation" ? "bg-destructive/5 border-destructive/20" : "bg-warning/5 border-warning/20"}`}>
                  <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${r.severity === "violation" ? "text-destructive" : "text-warning"}`} />
                  <div>
                    <Badge variant="outline" className="text-[9px] mb-1">{r.term}</Badge>
                    <p className="text-xs text-muted-foreground">{r.issue}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {auditResult === "passed" && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-success/5 border border-success/20">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <p className="text-xs text-success">All tone checks passed — fully aligned with Quantus voice</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HelixTone;
