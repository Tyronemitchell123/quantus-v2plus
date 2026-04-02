import { motion } from "framer-motion";
import { Eye, Type, Layers, Sparkles, Monitor, Smartphone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const typography = [
  { name: "Playfair Display", role: "Hero & luxury headers", sample: "Silent Wealth", family: "Playfair Display, serif" },
  { name: "Inter", role: "UI & operational text", sample: "Sovereign Operations", family: "Inter, sans-serif" },
  { name: "Geist Mono", role: "Data & financial figures", sample: "$2,450,000", family: "monospace" },
];

const visualRules = [
  { category: "Glass-morphism", rules: [
    "backdrop-blur-xl with bg-card/60 opacity",
    "1px border with border-border/50",
    "12px border radius on all surfaces",
    "Gold glow shadow: 0 0 30px hsl(43 56% 52% / 0.08)",
  ]},
  { category: "Animations", rules: [
    "Framer Motion spring physics on magnetic buttons",
    "Scroll-linked parallax with 0.3s ease-out",
    "Liquid page transitions — no hard cuts",
    "Gold pulse keyframe on active status indicators",
  ]},
  { category: "Imagery", rules: [
    "Black-and-white hero photography with gold overlay",
    "Gold-line silhouettes for aircraft, candidates, properties",
    "No stock photography — generative or editorial only",
    "SVG dial gauges and ScoreRing components for data visualisation",
  ]},
  { category: "Responsive", rules: [
    "Desktop: 12-column obsidian grid, max-width 1440px",
    "Tablet: 8-column grid, collapsing sidebar to icons",
    "Mobile: single-column, bottom navigation, 44px tap targets",
    "All breakpoints maintain Quantus Ratio™ spacing",
  ]},
];

const componentPrimitives = [
  { name: "Glass Card", description: "bg-card/60 backdrop-blur-sm border-border/50 rounded-lg" },
  { name: "Gold Badge", description: "text-primary border-primary/30 text-[9px] uppercase tracking" },
  { name: "ScoreRing", description: "Animated SVG circular gauge with gold stroke" },
  { name: "Magnetic Button", description: "Spring physics hover with cursor tracking" },
  { name: "Status Indicator", description: "Pulsing dot with semantic colour (success/warning/destructive)" },
  { name: "Terminal Log", description: "Font-mono, dark bg, gold-tinted response lines" },
];

const HelixVisual = () => {
  return (
    <div className="space-y-8">
      {/* Typography */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Type className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium text-foreground">Typography System</h3>
        </div>
        <div className="space-y-3">
          {typography.map((font, i) => (
            <motion.div key={font.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Type className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">{font.name}</span>
                    </div>
                    <Badge variant="outline" className="text-[9px]">{font.role}</Badge>
                  </div>
                  <p className="text-3xl text-foreground" style={{ fontFamily: font.family }}>{font.sample}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Visual Language Rules */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Eye className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium text-foreground">Visual Language Instructions</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visualRules.map((group, i) => (
            <motion.div key={group.category} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className="bg-card/60 backdrop-blur-sm border-border/50 h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    {group.category === "Animations" ? <Sparkles className="w-4 h-4 text-primary" /> :
                     group.category === "Responsive" ? <Smartphone className="w-4 h-4 text-primary" /> :
                     <Layers className="w-4 h-4 text-primary" />}
                    <h4 className="text-xs font-medium text-foreground uppercase tracking-wider">{group.category}</h4>
                  </div>
                  <ul className="space-y-2">
                    {group.rules.map((rule, j) => (
                      <li key={j} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="text-primary/40 mt-0.5">›</span>
                        {rule}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Component Primitives */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Monitor className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium text-foreground">Obsidian Standard Primitives</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {componentPrimitives.map((c, i) => (
            <motion.div key={c.name} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}>
              <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                <CardContent className="p-3">
                  <h4 className="text-xs font-medium text-foreground mb-1">{c.name}</h4>
                  <p className="text-[10px] font-mono text-muted-foreground">{c.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HelixVisual;
