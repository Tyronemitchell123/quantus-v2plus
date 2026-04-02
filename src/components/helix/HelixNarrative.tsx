import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Sparkles, RefreshCw, Copy, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const narrativeFrameworks = [
  { name: "Quantus Orchestration Protocol™", phases: [
    { phase: "Silent Gate", description: "First contact — no branding, no pitch. The system observes" },
    { phase: "Sovereign Profile", description: "Client identity constructed from behavioural signals, not forms" },
    { phase: "Forever Systems Blueprint", description: "Long-term architecture designed for compounding value" },
    { phase: "Quantus Engine", description: "Autonomous execution across all active verticals" },
    { phase: "Black-Gold Experience", description: "Cinematic delivery of every touchpoint and artefact" },
    { phase: "Compounding Loop", description: "Each interaction increases system intelligence and asset value" },
  ]},
  { name: "Communication Cadence", phases: [
    { phase: "Initial Contact", description: "Third-person institutional. 'Quantus has identified an opportunity'" },
    { phase: "Progress Update", description: "Data-led, no filler. Three sentences maximum" },
    { phase: "Decision Point", description: "Clear options with quantified outcomes. No recommendations — only visibility" },
    { phase: "Completion", description: "Summary artefact delivered. No celebration — quiet confirmation of value" },
  ]},
];

const HelixNarrative = () => {
  const [topic, setTopic] = useState("");
  const [generatedNarrative, setGeneratedNarrative] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateNarrative = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    setGeneratedNarrative("");

    try {
      const { data, error } = await supabase.functions.invoke("helix-brand-audit", {
        body: { text: topic, mode: "narrative" },
      });
      if (error) throw error;
      setGeneratedNarrative(data?.narrative || "Narrative generation unavailable — use the frameworks above as templates.");
    } catch {
      setGeneratedNarrative(
        `Quantus has identified a sovereign opportunity within the ${topic} vertical. ` +
        `The orchestration engine has initiated a silent assessment, mapping available corridors and optimising for compounding value. ` +
        `No intervention required — the system advances autonomously.`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const copyNarrative = () => {
    navigator.clipboard.writeText(generatedNarrative);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Narrative Frameworks */}
      {narrativeFrameworks.map((fw, fi) => (
        <div key={fw.name}>
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-medium text-foreground">{fw.name}</h3>
          </div>
          <div className="space-y-2">
            {fw.phases.map((p, i) => (
              <motion.div key={p.phase} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: fi * 0.1 + i * 0.03 }}>
                <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                  <CardContent className="p-3 flex items-start gap-3">
                    <Badge variant="outline" className="text-primary border-primary/30 text-[9px] shrink-0 mt-0.5 min-w-[80px] justify-center">
                      {i + 1}. {p.phase}
                    </Badge>
                    <p className="text-xs text-muted-foreground">{p.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      ))}

      {/* AI Narrative Generator */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Sparkles className="w-4 h-4 text-primary" />
            Narrative Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Enter a topic or context and the AI will generate a brand-aligned narrative following the Quantus Orchestration Protocol.
          </p>
          <Textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. 'Aviation deal — client requires Bombardier Global 7500 repositioning LDN-GVA'"
            rows={3}
            className="bg-background border-border/50"
          />
          <Button onClick={generateNarrative} disabled={isGenerating || !topic.trim()} className="gap-2">
            {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {isGenerating ? "Generating…" : "Generate Narrative"}
          </Button>

          {generatedNarrative && (
            <div className="relative">
              <div className="p-4 rounded-lg bg-background border border-primary/20">
                <p className="text-sm text-foreground leading-relaxed">{generatedNarrative}</p>
              </div>
              <Button size="sm" variant="ghost" className="absolute top-2 right-2 h-7 w-7 p-0" onClick={copyNarrative}>
                {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HelixNarrative;
