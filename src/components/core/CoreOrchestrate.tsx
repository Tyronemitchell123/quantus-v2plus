import { motion } from "framer-motion";
import { Activity, ArrowRightLeft, GitBranch, Workflow } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { getPipelineStats, getModuleStats } from "@/lib/quantus-core";

const CoreOrchestrate = () => {
  const { data: pipelineStats } = useQuery({
    queryKey: ["core-pipeline-stats"],
    queryFn: getPipelineStats,
  });

  const { data: moduleStats } = useQuery({
    queryKey: ["core-module-stats"],
    queryFn: getModuleStats,
  });

  const pipelinePhases = [
    { phase: "Intake", count: pipelineStats?.intake || 0 },
    { phase: "Matching", count: pipelineStats?.matching || 0 },
    { phase: "Sourcing", count: pipelineStats?.sourcing || 0 },
    { phase: "Negotiation", count: pipelineStats?.negotiation || 0 },
    { phase: "Execution", count: pipelineStats?.execution || 0 },
    { phase: "Completed", count: pipelineStats?.completed || 0 },
  ];

  const totalActive = pipelinePhases.slice(0, -1).reduce((a, b) => a + b.count, 0);

  return (
    <div className="space-y-6">
      {/* Pipeline Flow */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Workflow className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium text-foreground">Pipeline Flow — {totalActive} Active</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {pipelinePhases.map((p, i) => (
            <motion.div key={p.phase} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="sovereign-card rounded-xl">
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
          {(moduleStats || []).map((mod, i) => (
            <motion.div key={mod.name} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}>
              <Card className="sovereign-card rounded-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-foreground capitalize">{mod.name}</h3>
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
