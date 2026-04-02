import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Palette, Dna as DnaIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listProfiles, getDefaultProfile, exportDNAForForge } from "@/lib/quantus-helix";
import type { HelixDNAProfile } from "@/lib/quantus-types";

const HelixDNA = () => {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [activeProfile, setActiveProfile] = useState<HelixDNAProfile>(getDefaultProfile());
  const allProfiles = listProfiles();

  const copyColor = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 1500);
  };

  const paletteEntries = Object.entries(activeProfile.palette).map(([key, hsl]) => ({
    name: key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()),
    hsl,
    token: `--${key.replace(/([A-Z])/g, (m) => `-${m.toLowerCase()}`)}`,
  }));

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

  const spacing = [
    { name: "Quantus Ratio™", rule: "1:3:9", description: "Base spacing multiplied by 1×, 3×, 9× for hierarchical rhythm" },
    { name: "Grid", rule: `${activeProfile.spacing.gridColumns}-col`, description: `Max-width 1440px, gold vertical line motifs at column boundaries` },
    { name: "Radius", rule: activeProfile.spacing.borderRadius, description: "Standard border radius — glass-morphism cards" },
    { name: "Shadow", rule: "Gold glow", description: "0 0 30px hsl(43 56% 52% / 0.08) for elevated surfaces" },
  ];

  return (
    <div className="space-y-8">
      {/* Profile Selector */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <DnaIcon className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium text-foreground">Active DNA Profile</h3>
        </div>
        <div className="flex gap-3 flex-wrap">
          {allProfiles.map((p) => (
            <Button
              key={p.id}
              variant={activeProfile.id === p.id ? "default" : "outline"}
              size="sm"
              className="text-[10px] tracking-wider uppercase gap-2"
              onClick={() => setActiveProfile(p)}
            >
              <div className="w-3 h-3 rounded-full border" style={{ backgroundColor: `hsl(${p.palette.primary})` }} />
              {p.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Colour Genome */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Palette className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium text-foreground">Colour Genome — {activeProfile.name}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paletteEntries.map((color, i) => (
            <motion.div key={color.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className="sovereign-card rounded-xl overflow-hidden">
                <div className="h-20 w-full" style={{ backgroundColor: `hsl(${color.hsl})` }} />
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-foreground">{color.name}</h3>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => copyColor(color.hsl)}>
                      {copiedColor === color.hsl ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-mono">{color.token}: {color.hsl}</p>
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
              <Card className="sovereign-card rounded-xl">
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
              <Card className="sovereign-card rounded-xl">
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
