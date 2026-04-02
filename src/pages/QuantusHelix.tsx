import { motion } from "framer-motion";
import { Dna, Cpu, Shield, Sparkles, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import useDocumentHead from "@/hooks/use-document-head";
import HelixDNA from "@/components/helix/HelixDNA";
import HelixTone from "@/components/helix/HelixTone";
import HelixVisual from "@/components/helix/HelixVisual";
import HelixNarrative from "@/components/helix/HelixNarrative";
import HelixPersona from "@/components/helix/HelixPersona";

const QuantusHelix = () => {
  useDocumentHead({ title: "Quantus Helix — Brand Genome", description: "The brand DNA engine governing every Quantus touchpoint." });

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardTopBar onMobileMenuToggle={() => {}} notifications={[]} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-11 h-11 rounded-xl bg-primary/[0.06] border border-primary/10 flex items-center justify-center gold-glow-sm">
                <Dna className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-semibold text-foreground">Quantus Helix</h1>
                <p className="text-[10px] text-muted-foreground/60 tracking-[0.3em] uppercase">Brand Genome Engine — Identity Generation & Enforcement</p>
              </div>
            </div>
            <div className="sovereign-line" />
          </motion.div>

          {/* Stats Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Subsystems", value: 5, icon: Cpu, sub: "all active" },
              { label: "Lexicon Terms", value: 10, icon: Dna, sub: "registered" },
              { label: "Archetypes", value: 4, icon: Sparkles, sub: "mapped" },
              { label: "Brand Compliance", value: "100%", icon: CheckCircle2, sub: "enforced" },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.05 }}>
                <Card className="sovereign-card rounded-xl">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <stat.icon className="w-3.5 h-3.5 text-primary/60" />
                      <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60">{stat.label}</span>
                    </div>
                    <p className="text-2xl font-display font-semibold text-foreground">{stat.value}</p>
                    <p className="text-[10px] text-muted-foreground/40 mt-1">{stat.sub}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Subsystem Tabs */}
          <Tabs defaultValue="dna" className="space-y-4">
            <TabsList className="glass-sovereign border border-border/20 flex-wrap h-auto gap-1 p-1 rounded-xl">
              <TabsTrigger value="dna" className="text-[11px] tracking-wide data-[state=active]:bg-primary/[0.08] data-[state=active]:text-primary rounded-lg">Helix.DNA</TabsTrigger>
              <TabsTrigger value="tone" className="text-[11px] tracking-wide data-[state=active]:bg-primary/[0.08] data-[state=active]:text-primary rounded-lg">Helix.Tone</TabsTrigger>
              <TabsTrigger value="visual" className="text-[11px] tracking-wide data-[state=active]:bg-primary/[0.08] data-[state=active]:text-primary rounded-lg">Helix.Visual</TabsTrigger>
              <TabsTrigger value="narrative" className="text-[11px] tracking-wide data-[state=active]:bg-primary/[0.08] data-[state=active]:text-primary rounded-lg">Helix.Narrative</TabsTrigger>
              <TabsTrigger value="persona" className="text-[11px] tracking-wide data-[state=active]:bg-primary/[0.08] data-[state=active]:text-primary rounded-lg">Helix.Persona</TabsTrigger>
            </TabsList>

            <TabsContent value="dna"><HelixDNA /></TabsContent>
            <TabsContent value="tone"><HelixTone /></TabsContent>
            <TabsContent value="visual"><HelixVisual /></TabsContent>
            <TabsContent value="narrative"><HelixNarrative /></TabsContent>
            <TabsContent value="persona"><HelixPersona /></TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default QuantusHelix;
