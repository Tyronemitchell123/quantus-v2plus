import { motion } from "framer-motion";
import { Activity, ArrowRightLeft, GitBranch, Workflow } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const modules = [
  { name: "Aviation", key: "aviation" },
  { name: "Medical", key: "medical" },
  { name: "Hospitality", key: "hospitality" },
  { name: "Lifestyle", key: "lifestyle" },
  { name: "Longevity", key: "longevity" },
  { name: "Marine", key: "marine" },
  { name: "Finance", key: "finance" },
  { name: "Legal", key: "legal" },
  { name: "Logistics", key: "logistics" },
];

const CoreOrchestrate = () => {
  const { data: deals } = useQuery({
    queryKey: ["core-orchestrate-deals"],
    queryFn: async () => {
      const { data } = await supabase.from("deals").select("status, category");
      return data || [];
    },
  });

  const moduleStats = modules.map(m => {
    const moduleDeals = deals?.filter(d => d.category === m.key) || [];
    const active = moduleDeals.filter(d => d.status !== "completed" && d.status !== "cancelled").length;
    return { ...m, active, total: moduleDeals.length, status: active > 0 ? "online" : "standby" };
  });

  const pipelinePhases = [
    { phase: "Intake", count: deals?.filter(d => d.status === "intake").length || 0 },
    { phase: "Matching", count: deals?.filter(d => d.status === "matching").length || 0 },
    { phase: "Sourcing", count: deals?.filter(d => d.status === "sourcing").length || 0 },
    { phase: "Outreach", count: deals?.filter(d => d.status === "outreach").length || 0 },
    { phase: "Negotiation", count: deals?.filter(d => d.status === "negotiation").length || 0 },
    { phase: "Execution", count: deals?.filter(d => d.status === "execution").length || 0 },
    { phase: "Documentation", count: deals?.filter(d => d.status === "documentation").length || 0 },
    { phase: "Completed", count: deals?.filter(d => d.status === "completed").length || 0 },
  ];

  const totalActive = deals?.filter(d => d.status !== "completed" && d.status !== "cancelled").length || 0;

  return (
    <div className="space-y-6">
      {/* Pipeline Flow */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Workflow className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium text-foreground">Pipeline Flow — {totalActive} Active</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {pipelinePhases.map((p, i) => (
            <motion.div key={p.phase} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{p.phase}</span>
                    {i < pipelinePhases.length - 1 && <ArrowRightLeft className="w-3 h-3 text-primary/30" />}
                  </div>
                  <p className="text-xl font-display font-semibold text-foreground">{p.count}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Module Routing Grid */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <GitBranch className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium text-foreground">Module Routing</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {moduleStats.map((mod, i) => (
            <motion.div key={mod.name} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}>
              <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-foreground">{mod.name}</h3>
                    <Badge variant="outline" className={mod.status === "online" ? "text-success border-success/30 text-[9px]" : "text-muted-foreground text-[9px]"}>
                      {mod.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{mod.active} active · {mod.total} total</span>
                    <Activity className="w-3 h-3" />
                  </div>
                  <Progress value={mod.active > 0 ? Math.min(100, mod.active * 10) : 0} className="mt-2 h-1" />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CoreOrchestrate;
