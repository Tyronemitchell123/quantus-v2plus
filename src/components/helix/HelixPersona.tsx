import { motion } from "framer-motion";
import { Users, Crown, Building2, Briefcase, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const archetypes = [
  {
    name: "The Sovereign",
    icon: Crown,
    tagline: "Controls everything, touches nothing",
    traits: ["Delegates entirely to autonomous systems", "Values privacy above all", "Measures success in optionality, not revenue"],
    tone: "Third-person institutional. No questions — only statements of capability",
    modules: ["Aviation", "Lifestyle", "Finance"],
  },
  {
    name: "The Architect",
    icon: Building2,
    tagline: "Builds systems that outlast the builder",
    traits: ["Thinks in decades, not quarters", "Obsessed with compounding infrastructure", "Views every asset as a node in a network"],
    tone: "Technical precision. Quantified outcomes with zero embellishment",
    modules: ["Legal", "Logistics", "Partnerships"],
  },
  {
    name: "The Operator",
    icon: Briefcase,
    tagline: "Execution is identity",
    traits: ["Speed and precision in equal measure", "Zero tolerance for operational friction", "Autonomy through automation"],
    tone: "Direct, action-oriented. Short sentences. Results-first",
    modules: ["Medical", "Staffing", "Marine"],
  },
  {
    name: "The Diplomat",
    icon: Globe,
    tagline: "Influence through invisible channels",
    traits: ["Multi-jurisdictional awareness", "Relationship-driven deal flow", "Discretion as a competitive advantage"],
    tone: "Warm but restrained. Acknowledges without flattering",
    modules: ["Hospitality", "Longevity", "Finance"],
  },
];

const clientTiers = [
  { tier: "Obsidian", description: "Full privacy mode — data masking, one-tap redaction, zero external visibility", color: "bg-foreground/10 text-foreground" },
  { tier: "Gold", description: "Premium orchestration with branded artefacts and priority pipeline access", color: "bg-primary/10 text-primary" },
  { tier: "Standard", description: "Core platform access with autonomous deal management", color: "bg-muted text-muted-foreground" },
];

const HelixPersona = () => {
  return (
    <div className="space-y-8">
      {/* Brand Archetypes */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium text-foreground">Brand Archetypes</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {archetypes.map((a, i) => (
            <motion.div key={a.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="bg-card/60 backdrop-blur-sm border-border/50 h-full">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center">
                      <a.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-foreground">{a.name}</h4>
                      <p className="text-[10px] text-primary/70 italic">{a.tagline}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Traits</span>
                      <ul className="mt-1 space-y-1">
                        {a.traits.map((t, j) => (
                          <li key={j} className="text-xs text-muted-foreground flex items-start gap-2">
                            <span className="text-primary/40 mt-0.5">›</span> {t}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Tone</span>
                      <p className="text-xs text-muted-foreground mt-1">{a.tone}</p>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {a.modules.map(m => (
                        <Badge key={m} variant="outline" className="text-[8px] border-primary/20 text-primary/60">{m}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Client Privacy Tiers */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Crown className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium text-foreground">Client Privacy Tiers</h3>
        </div>
        <div className="space-y-3">
          {clientTiers.map((t, i) => (
            <motion.div key={t.tier} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <Badge className={`${t.color} text-[10px] min-w-[80px] justify-center border-none`}>{t.tier}</Badge>
                  <p className="text-xs text-muted-foreground">{t.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HelixPersona;
