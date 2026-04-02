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
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Dna className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-semibold text-foreground">Quantus Helix</h1>
                <p className="text-xs text-muted-foreground tracking-wider uppercase">Brand Genome Engine — Identity Generation & Enforcement</p>
              </div>
            </div>
          </motion.div>

          {/* Stats Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Subsystems", value: 5, icon: Cpu, sub: "all active" },
              { label: "Lexicon Terms", value: 10, icon: Dna, sub: "registered" },
              { label: "Archetypes", value: 4, icon: Sparkles, sub: "mapped" },
              { label: "Brand Compliance", value: "100%", icon: CheckCircle2, sub: "enforced" },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.03 }}>
                <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <stat.icon className="w-4 h-4 text-primary" />
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{stat.label}</span>
                    </div>
                    <p className="text-2xl font-display font-semibold text-foreground">{stat.value}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{stat.sub}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Subsystem Tabs */}
          <Tabs defaultValue="dna" className="space-y-4">
            <TabsList className="bg-card/60 border border-border/50 flex-wrap h-auto gap-1 p-1">
              <TabsTrigger value="dna" className="text-xs">Helix.DNA</TabsTrigger>
              <TabsTrigger value="tone" className="text-xs">Helix.Tone</TabsTrigger>
              <TabsTrigger value="visual" className="text-xs">Helix.Visual</TabsTrigger>
              <TabsTrigger value="narrative" className="text-xs">Helix.Narrative</TabsTrigger>
              <TabsTrigger value="persona" className="text-xs">Helix.Persona</TabsTrigger>
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
