import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Palette, Dna as DnaIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const brandColors = [
  { name: "Obsidian Black", hsl: "240 10% 4%", hex: "#0A0A0C", role: "Primary background" },
  { name: "Champagne Gold", hsl: "43 56% 52%", hex: "#D4AF37", role: "Accent / CTA" },
  { name: "White Quartz", hsl: "0 0% 95%", hex: "#F2F2F2", role: "Foreground text" },
  { name: "Deep Space", hsl: "225 80% 4%", hex: "#020617", role: "Sovereign backdrop" },
  { name: "Warm Amber", hsl: "43 100% 70%", hex: "#FFD966", role: "Highlight / glow" },
  { name: "Muted Platinum", hsl: "220 10% 50%", hex: "#7A7F8A", role: "Secondary text" },
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

const designTokens = [
  { token: "--background", value: "225 80% 4%", usage: "Page background" },
  { token: "--foreground", value: "0 0% 95%", usage: "Primary text" },
  { token: "--primary", value: "43 56% 52%", usage: "Gold accent" },
  { token: "--muted-foreground", value: "220 10% 78%", usage: "Secondary text" },
  { token: "--card", value: "224 40% 8%", usage: "Surface cards" },
  { token: "--border", value: "220 15% 18%", usage: "Dividers" },
];

const spacing = [
  { name: "Quantus Ratio™", rule: "1:3:9", description: "Base spacing multiplied by 1×, 3×, 9× for hierarchical rhythm" },
  { name: "Grid", rule: "12-column obsidian", description: "Max-width 1440px, gold vertical line motifs at column boundaries" },
  { name: "Radius", rule: "12px", description: "Standard border radius — glass-morphism cards" },
  { name: "Shadow", rule: "Gold glow", description: "0 0 30px hsl(43 56% 52% / 0.08) for elevated surfaces" },
];

const HelixDNA = () => {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const copyColor = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 1500);
  };

  return (
    <div className="space-y-8">
      {/* Brand Identity Model */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Palette className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium text-foreground">Colour Genome</h3>
        </div>
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
      </div>

      {/* Design Tokens */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <DnaIcon className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium text-foreground">Design Tokens</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {designTokens.map((t, i) => (
            <motion.div key={t.token} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="w-6 h-6 rounded border border-border/50 shrink-0" style={{ backgroundColor: `hsl(${t.value})` }} />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-mono text-foreground">{t.token}</span>
                    <p className="text-[10px] text-muted-foreground">{t.usage}</p>
                  </div>
                  <span className="text-[9px] font-mono text-muted-foreground shrink-0">{t.value}</span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Spacing & Grid */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <DnaIcon className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium text-foreground">Quantus Ratio™ & Grid</h3>
        </div>
        <div className="space-y-3">
          {spacing.map((s, i) => (
            <motion.div key={s.name} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <Badge variant="outline" className="text-primary border-primary/30 text-[10px] shrink-0">{s.rule}</Badge>
                  <div>
                    <h4 className="text-xs font-medium text-foreground">{s.name}</h4>
                    <p className="text-[10px] text-muted-foreground">{s.description}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lexicon */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <DnaIcon className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium text-foreground">Quantus Lexicon™</h3>
        </div>
        <div className="space-y-2">
          {lexicon.map((entry, i) => (
            <motion.div key={entry.term} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
              <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                <CardContent className="p-3 flex items-start gap-3">
                  <Badge variant="outline" className="text-primary border-primary/30 text-[10px] shrink-0 mt-0.5">{entry.term}</Badge>
                  <p className="text-xs text-muted-foreground">{entry.definition}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HelixDNA;
