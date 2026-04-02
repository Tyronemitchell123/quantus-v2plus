import { useState } from "react";
import { motion } from "framer-motion";
import {
  Dna, Palette, Type, MessageSquareText, ShieldCheck, Copy, Check,
  RefreshCw, AlertTriangle, Sparkles, Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import useDocumentHead from "@/hooks/use-document-head";
import { toast } from "sonner";

/* ── Brand DNA tokens ───────────────────────────── */
const brandColors = [
  { name: "Obsidian Black", hsl: "240 10% 4%", hex: "#0A0A0C", role: "Primary background" },
  { name: "Champagne Gold", hsl: "43 56% 52%", hex: "#D4AF37", role: "Accent / CTA" },
  { name: "White Quartz", hsl: "0 0% 95%", hex: "#F2F2F2", role: "Foreground text" },
  { name: "Deep Space", hsl: "225 80% 4%", hex: "#020617", role: "Sovereign backdrop" },
  { name: "Warm Amber", hsl: "43 100% 70%", hex: "#FFD966", role: "Highlight / glow" },
  { name: "Muted Platinum", hsl: "220 10% 50%", hex: "#7A7F8A", role: "Secondary text" },
];

const typography = [
  { name: "Playfair Display", role: "Hero & luxury headers", sample: "Silent Wealth" },
  { name: "Inter", role: "UI & operational text", sample: "Sovereign Operations" },
  { name: "Geist Mono", role: "Data & financial figures", sample: "$2,450,000" },
];

const lexicon = [
  { term: "Silent Wealth", definition: "Assets & influence that compound invisibly — never displayed, always felt" },
  { term: "Autonomous Systems", definition: "AI-driven loops that execute without human prompting" },
  { term: "Forever Architecture", definition: "Infrastructure designed to outlast its creator" },
  { term: "Invisible Assets", definition: "Value stores that exist beyond traditional balance sheets" },
  { term: "Sovereign Operations", definition: "Self-governing processes with zero external dependencies" },
  { term: "Compounding Infrastructure", definition: "Systems that grow more valuable with each interaction" },
  { term: "Modular Orchestration", definition: "Plug-and-play capability layers that snap into the core OS" },
  { term: "Precision Protocols", definition: "Zero-tolerance execution standards for high-stakes transactions" },
  { term: "Black-Gold Experience", definition: "The cinematic sensory identity of every Quantus touchpoint" },
  { term: "Founder Removal Protocol", definition: "Designed so the founder becomes unnecessary to operations" },
];

const toneGuidelines = [
  { label: "Voice", value: "Authoritative yet understated — never sells, only reveals" },
  { label: "Register", value: "Executive boardroom, not marketing collateral" },
  { label: "Emotion", value: "Controlled confidence — the calm of absolute certainty" },
  { label: "Prohibited", value: "Exclamation marks, emojis, superlatives, sales language" },
];

const QuantusHelix = () => {
  useDocumentHead({ title: "Quantus Helix — Brand Genome", description: "The brand DNA engine governing every Quantus touchpoint." });

  const [auditText, setAuditText] = useState("");
  const [auditResults, setAuditResults] = useState<{ term: string; issue: string; severity: "warning" | "violation" }[]>([]);
  const [isAuditing, setIsAuditing] = useState(false);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const runBrandAudit = () => {
    if (!auditText.trim()) return;
    setIsAuditing(true);

    setTimeout(() => {
      const results: typeof auditResults = [];
      const lower = auditText.toLowerCase();

      // Check for prohibited patterns
      if (auditText.includes("!")) results.push({ term: "Tone", issue: "Exclamation mark detected — prohibited in Quantus Lexicon", severity: "violation" });
      if (/amazing|incredible|best|awesome|revolutionary/i.test(auditText)) results.push({ term: "Register", issue: "Superlative detected — use understated authority", severity: "violation" });
      if (/buy now|limited time|hurry|don't miss/i.test(auditText)) results.push({ term: "Voice", issue: "Sales language detected — Quantus reveals, never sells", severity: "violation" });
      if (/supabase|stripe|aws|firecrawl|10web/i.test(auditText)) results.push({ term: "Sovereignty", issue: "External brand name detected — all services must be wrapped", severity: "violation" });
      if (/😀|🎉|👍|🚀|💡|✨/u.test(auditText)) results.push({ term: "Tone", issue: "Emoji detected — prohibited in all Quantus communications", severity: "violation" });

      // Positive checks
      if (lower.includes("sovereign") || lower.includes("autonomous")) {
        // Good — using lexicon terms
      } else if (auditText.length > 50) {
        results.push({ term: "Lexicon", issue: "Consider using Quantus Lexicon terms for brand alignment", severity: "warning" });
      }

      setAuditResults(results);
      setIsAuditing(false);

      if (results.length === 0) toast.success("Brand audit passed — fully aligned with Quantus Helix DNA");
    }, 1200);
  };

  const copyColor = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 1500);
  };

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardTopBar onMobileMenuToggle={() => {}} notifications={[]} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Dna className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-semibold text-foreground">Quantus Helix</h1>
                <p className="text-xs text-muted-foreground tracking-wider uppercase">Brand Genome Engine — DNA Configuration & Enforcement</p>
              </div>
            </div>
          </motion.div>

          <Tabs defaultValue="palette" className="space-y-4">
            <TabsList className="bg-card/60 border border-border/50 flex-wrap h-auto gap-1">
              <TabsTrigger value="palette" className="text-xs">Colour Genome</TabsTrigger>
              <TabsTrigger value="typography" className="text-xs">Typography</TabsTrigger>
              <TabsTrigger value="lexicon" className="text-xs">Lexicon</TabsTrigger>
              <TabsTrigger value="tone" className="text-xs">Tone of Voice</TabsTrigger>
              <TabsTrigger value="audit" className="text-xs">AI Enforcer</TabsTrigger>
            </TabsList>

            {/* Colour Genome */}
            <TabsContent value="palette">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {brandColors.map((color, i) => (
                  <motion.div key={color.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <Card className="bg-card/60 backdrop-blur-sm border-border/50 overflow-hidden">
                      <div className="h-20 w-full" style={{ backgroundColor: color.hex }} />
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-medium text-foreground">{color.name}</h3>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => copyColor(color.hex)}>
                            {copiedColor === color.hex ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
                          </Button>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-mono mb-1">{color.hex} · HSL({color.hsl})</p>
                        <p className="text-xs text-muted-foreground">{color.role}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Typography */}
            <TabsContent value="typography" className="space-y-4">
              {typography.map((font, i) => (
                <motion.div key={font.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Type className="w-4 h-4 text-primary" />
                          <h3 className="text-sm font-medium text-foreground">{font.name}</h3>
                        </div>
                        <Badge variant="outline" className="text-[9px]">{font.role}</Badge>
                      </div>
                      <p className="text-3xl text-foreground" style={{ fontFamily: font.name === "Playfair Display" ? "Playfair Display, serif" : font.name === "Geist Mono" ? "monospace" : "Inter, sans-serif" }}>
                        {font.sample}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </TabsContent>

            {/* Lexicon */}
            <TabsContent value="lexicon" className="space-y-3">
              {lexicon.map((entry, i) => (
                <motion.div key={entry.term} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                    <CardContent className="p-4 flex items-start gap-4">
                      <Badge variant="outline" className="text-primary border-primary/30 text-[10px] shrink-0 mt-0.5">
                        {entry.term}
                      </Badge>
                      <p className="text-sm text-muted-foreground">{entry.definition}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </TabsContent>

            {/* Tone of Voice */}
            <TabsContent value="tone" className="space-y-4">
              {toneGuidelines.map((rule, i) => (
                <motion.div key={rule.label} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Card className="bg-card/60 backdrop-blur-sm border-border/50">
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
            </TabsContent>

            {/* AI Brand Enforcer */}
            <TabsContent value="audit">
              <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    AI Brand Enforcer
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-xs text-muted-foreground">
                    Paste any outbound communication — emails, outreach drafts, marketing copy — and the enforcer will audit against the Quantus Lexicon and tone guidelines.
                  </p>
                  <Textarea
                    value={auditText}
                    onChange={(e) => setAuditText(e.target.value)}
                    placeholder="Paste text to audit against the Quantus Brand Genome…"
                    rows={6}
                    className="bg-background border-border/50"
                  />
                  <Button onClick={runBrandAudit} disabled={isAuditing || !auditText.trim()} className="gap-2">
                    {isAuditing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {isAuditing ? "Auditing…" : "Run Brand Audit"}
                  </Button>

                  {auditResults.length > 0 && (
                    <div className="space-y-2 mt-4">
                      <h4 className="text-xs uppercase tracking-wider text-muted-foreground">Findings</h4>
                      {auditResults.map((r, i) => (
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

                  {auditResults.length === 0 && auditText.trim() && !isAuditing && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-success/5 border border-success/20">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      <p className="text-xs text-success">All checks passed — fully aligned with Quantus Helix DNA</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

// Fix: import was missing
import { CheckCircle2 } from "lucide-react";

export default QuantusHelix;
