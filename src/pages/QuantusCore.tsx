import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Activity, Cpu, Shield, Zap, Play, Pause, RotateCcw, CheckCircle2,
  AlertTriangle, XCircle, Terminal, Layers, Globe, Search, ArrowRight,
  Radio, Eye, Command,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import useDocumentHead from "@/hooks/use-document-head";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

/* ── Agent definition ─────────────────────────────── */
interface AgentState {
  id: string;
  name: string;
  icon: typeof Cpu;
  status: "active" | "idle" | "healing" | "failed";
  lastRun: string;
  tasksCompleted: number;
  description: string;
}

const initialAgents: AgentState[] = [
  { id: "director", name: "Director Agent", icon: Command, status: "active", lastRun: "2 min ago", tasksCompleted: 847, description: "Recursive planner — orchestrates all autonomous interventions" },
  { id: "guardian", name: "Guardian Shield", icon: Shield, status: "active", lastRun: "45 sec ago", tasksCompleted: 12340, description: "Zero-trust security enforcer — 3-factor transaction validation" },
  { id: "scraper", name: "Sovereign Intel", icon: Globe, status: "active", lastRun: "5 min ago", tasksCompleted: 2190, description: "Availability & pricing intelligence across all verticals" },
  { id: "orchestrator", name: "Autonomous Orchestrator", icon: Layers, status: "active", lastRun: "12 min ago", tasksCompleted: 563, description: "15-min loop — pipeline advancement, outreach, content" },
  { id: "healer", name: "Self-Healing Architect", icon: RotateCcw, status: "idle", lastRun: "1 hr ago", tasksCompleted: 89, description: "Visual-LLM fallback + proxy rotation for resilient scraping" },
  { id: "concierge", name: "Concierge Engine", icon: Radio, status: "active", lastRun: "30 sec ago", tasksCompleted: 4521, description: "Client communication — luxury-grade auto-responses" },
];

const statusColor: Record<string, string> = {
  active: "bg-success/20 text-success border-success/30",
  idle: "bg-muted text-muted-foreground border-border",
  healing: "bg-warning/20 text-warning border-warning/30",
  failed: "bg-destructive/20 text-destructive border-destructive/30",
};

const statusIcon: Record<string, typeof CheckCircle2> = {
  active: CheckCircle2,
  idle: Pause,
  healing: RotateCcw,
  failed: XCircle,
};

/* ── Module status definitions ───────────────────── */
const modules = [
  { name: "Aviation", status: "online", deals: 14 },
  { name: "Medical", status: "online", deals: 8 },
  { name: "Hospitality", status: "online", deals: 21 },
  { name: "Lifestyle", status: "online", deals: 6 },
  { name: "Longevity", status: "online", deals: 3 },
  { name: "Marine", status: "standby", deals: 0 },
  { name: "Finance", status: "online", deals: 11 },
  { name: "Legal", status: "online", deals: 5 },
  { name: "Logistics", status: "standby", deals: 0 },
];

const QuantusCore = () => {
  useDocumentHead({ title: "Quantus Core — Sovereign OS", description: "The brain and orchestration engine of the Quantus operating system." });

  const [agents, setAgents] = useState(initialAgents);
  const [commandInput, setCommandInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([
    "› System boot — all agents initialised",
    "› Guardian Shield: 12,340 validations — 0 breaches",
    "› Orchestrator loop #563 complete — 3 deals advanced",
    "› Concierge: 4 new client responses dispatched",
  ]);

  // Fetch real agent logs
  const { data: agentLogs } = useQuery({
    queryKey: ["agent-logs-core"],
    queryFn: async () => {
      const { data } = await supabase
        .from("agent_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      return data || [];
    },
  });

  // Fetch deal counts
  const { data: dealStats } = useQuery({
    queryKey: ["deal-stats-core"],
    queryFn: async () => {
      const { data } = await supabase
        .from("deals")
        .select("status, category");
      return data || [];
    },
  });

  const activeDealCount = dealStats?.filter(d => d.status !== "completed" && d.status !== "cancelled").length || 0;
  const completedDealCount = dealStats?.filter(d => d.status === "completed").length || 0;

  const handleCommand = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && commandInput.trim()) {
      const cmd = commandInput.trim();
      setCommandHistory(prev => [...prev, `› ${cmd}`, `  ⤷ Processing: "${cmd}" — routing to Director Agent…`]);
      setCommandInput("");
    }
  };

  const toggleAgent = (id: string) => {
    setAgents(prev => prev.map(a =>
      a.id === id ? { ...a, status: a.status === "active" ? "idle" : "active" } : a
    ));
  };

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
                <p className="text-xs text-muted-foreground tracking-wider uppercase">Sovereign Operating System — Command Centre</p>
              </div>
            </div>
          </motion.div>

          {/* NLP Command Bar */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-6">
            <Card className="border-primary/20 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Terminal className="w-5 h-5 text-primary shrink-0" />
                  <Input
                    value={commandInput}
                    onChange={(e) => setCommandInput(e.target.value)}
                    onKeyDown={handleCommand}
                    placeholder="Natural language command — e.g. 'Advance all aviation deals past sourcing' or 'Show agent health'"
                    className="bg-transparent border-none text-sm placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  <Button size="sm" variant="ghost" className="text-primary shrink-0">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Active Agents", value: agents.filter(a => a.status === "active").length, icon: Zap, sub: `of ${agents.length}` },
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

          <Tabs defaultValue="agents" className="space-y-4">
            <TabsList className="bg-card/60 border border-border/50">
              <TabsTrigger value="agents" className="text-xs">Agent Monitor</TabsTrigger>
              <TabsTrigger value="modules" className="text-xs">Module Orchestration</TabsTrigger>
              <TabsTrigger value="terminal" className="text-xs">Terminal Log</TabsTrigger>
            </TabsList>

            {/* Agent Monitor */}
            <TabsContent value="agents" className="space-y-3">
              {agents.map((agent, i) => {
                const StatusIcon = statusIcon[agent.status];
                return (
                  <motion.div key={agent.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                    <Card className="bg-card/60 backdrop-blur-sm border-border/50 hover:border-primary/20 transition-colors">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                          <agent.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-medium text-foreground">{agent.name}</h3>
                            <Badge variant="outline" className={`text-[9px] ${statusColor[agent.status]}`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {agent.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{agent.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
                            <span>Last run: {agent.lastRun}</span>
                            <span>Tasks: {agent.tasksCompleted.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                            onClick={() => toggleAgent(agent.id)}
                          >
                            {agent.status === "active" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-primary">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </TabsContent>

            {/* Module Orchestration */}
            <TabsContent value="modules" className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {modules.map((mod, i) => (
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
                          <span>{mod.deals} active deals</span>
                          <Activity className="w-3 h-3" />
                        </div>
                        <Progress value={mod.deals > 0 ? Math.min(100, mod.deals * 5) : 0} className="mt-2 h-1" />
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Terminal Log */}
            <TabsContent value="terminal">
              <Card className="bg-background border-border/50">
                <CardContent className="p-4">
                  <div className="bg-background rounded-lg p-4 font-mono text-xs space-y-1 max-h-80 overflow-y-auto">
                    {commandHistory.map((line, i) => (
                      <div key={i} className={line.startsWith("  ") ? "text-primary/70 pl-2" : "text-muted-foreground"}>
                        {line}
                      </div>
                    ))}
                    {agentLogs?.slice(0, 10).map((log) => (
                      <div key={log.id} className="text-muted-foreground">
                        › [{log.agent_name}] {log.task_type} — {log.status}
                        {log.failure_reason && <span className="text-destructive"> ({log.failure_reason})</span>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default QuantusCore;
