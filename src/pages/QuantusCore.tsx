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
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Cpu className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-semibold text-foreground">Quantus Core</h1>
                <p className="text-xs text-muted-foreground tracking-wider uppercase">Sovereign Operating System — Central Intelligence Layer</p>
              </div>
            </div>
          </motion.div>

          {/* Stats Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Subsystems", value: 5, icon: Cpu, sub: "all operational" },
              { label: "Active Deals", value: activeDealCount, icon: Activity, sub: "in pipeline" },
              { label: "Completed", value: completedDealCount, icon: CheckCircle2, sub: "all time" },
              { label: "System Health", value: "99.7%", icon: Shield, sub: "uptime" },
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
          <Tabs defaultValue="orchestrate" className="space-y-4">
            <TabsList className="bg-card/60 border border-border/50 flex-wrap h-auto gap-1 p-1">
              <TabsTrigger value="orchestrate" className="text-xs">Core.Orchestrate</TabsTrigger>
              <TabsTrigger value="agents" className="text-xs">Core.Agents</TabsTrigger>
              <TabsTrigger value="models" className="text-xs">Core.Models</TabsTrigger>
              <TabsTrigger value="permissions" className="text-xs">Core.Permissions</TabsTrigger>
              <TabsTrigger value="normalize" className="text-xs">Core.Normalize</TabsTrigger>
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
