import { motion } from "framer-motion";
import { Activity, Cpu, Shield, Zap, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import useDocumentHead from "@/hooks/use-document-head";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import CoreOrchestrate from "@/components/core/CoreOrchestrate";
import CoreAgents from "@/components/core/CoreAgents";
import CoreModels from "@/components/core/CoreModels";
import CorePermissions from "@/components/core/CorePermissions";
import CoreNormalize from "@/components/core/CoreNormalize";

const QuantusCore = () => {
  useDocumentHead({ title: "Quantus Core — Sovereign OS", description: "The brain and orchestration engine of the Quantus operating system." });

  const { data: dealStats } = useQuery({
    queryKey: ["deal-stats-core"],
    queryFn: async () => {
      const { data } = await supabase.from("deals").select("status, category");
      return data || [];
    },
  });

  const activeDealCount = dealStats?.filter(d => d.status !== "completed" && d.status !== "cancelled").length || 0;
  const completedDealCount = dealStats?.filter(d => d.status === "completed").length || 0;

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
                <Cpu className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-semibold text-foreground">Quantus Core</h1>
                <p className="text-[10px] text-muted-foreground/60 tracking-[0.3em] uppercase">Sovereign Operating System — Central Intelligence Layer</p>
              </div>
            </div>
            <div className="sovereign-line" />
          </motion.div>

          {/* Stats Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Subsystems", value: 5, icon: Cpu, sub: "all operational" },
              { label: "Active Deals", value: activeDealCount, icon: Activity, sub: "in pipeline" },
              { label: "Completed", value: completedDealCount, icon: CheckCircle2, sub: "all time" },
              { label: "System Health", value: "99.7%", icon: Shield, sub: "uptime" },
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
          <Tabs defaultValue="orchestrate" className="space-y-4">
            <TabsList className="glass-sovereign border border-border/20 flex-wrap h-auto gap-1 p-1 rounded-xl">
              <TabsTrigger value="orchestrate" className="text-[11px] tracking-wide data-[state=active]:bg-primary/[0.08] data-[state=active]:text-primary rounded-lg">Core.Orchestrate</TabsTrigger>
              <TabsTrigger value="agents" className="text-[11px] tracking-wide data-[state=active]:bg-primary/[0.08] data-[state=active]:text-primary rounded-lg">Core.Agents</TabsTrigger>
              <TabsTrigger value="models" className="text-[11px] tracking-wide data-[state=active]:bg-primary/[0.08] data-[state=active]:text-primary rounded-lg">Core.Models</TabsTrigger>
              <TabsTrigger value="permissions" className="text-[11px] tracking-wide data-[state=active]:bg-primary/[0.08] data-[state=active]:text-primary rounded-lg">Core.Permissions</TabsTrigger>
              <TabsTrigger value="normalize" className="text-[11px] tracking-wide data-[state=active]:bg-primary/[0.08] data-[state=active]:text-primary rounded-lg">Core.Normalize</TabsTrigger>
            </TabsList>

            <TabsContent value="orchestrate"><CoreOrchestrate /></TabsContent>
            <TabsContent value="agents"><CoreAgents /></TabsContent>
            <TabsContent value="models"><CoreModels /></TabsContent>
            <TabsContent value="permissions"><CorePermissions /></TabsContent>
            <TabsContent value="normalize"><CoreNormalize /></TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default QuantusCore;
