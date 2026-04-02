import { useState } from "react";
import { motion } from "framer-motion";
import {
  Cpu, Shield, Play, Pause, RotateCcw, CheckCircle2, XCircle,
  Layers, Globe, Radio, Eye, Command,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AgentState {
  id: string;
  name: string;
  icon: typeof Cpu;
  status: "active" | "idle" | "healing" | "failed";
  lastRun: string;
  tasksCompleted: number;
  description: string;
  subsystem: string;
}

const initialAgents: AgentState[] = [
  { id: "director", name: "Director Agent", icon: Command, status: "active", lastRun: "2 min ago", tasksCompleted: 847, description: "Recursive planner — orchestrates all autonomous interventions", subsystem: "Core.Orchestrate" },
  { id: "guardian", name: "Guardian Shield", icon: Shield, status: "active", lastRun: "45 sec ago", tasksCompleted: 12340, description: "Zero-trust security enforcer — 3-factor transaction validation", subsystem: "Core.Permissions" },
  { id: "scraper", name: "Sovereign Intel", icon: Globe, status: "active", lastRun: "5 min ago", tasksCompleted: 2190, description: "Availability & pricing intelligence across all verticals", subsystem: "Core.Normalize" },
  { id: "orchestrator", name: "Autonomous Orchestrator", icon: Layers, status: "active", lastRun: "12 min ago", tasksCompleted: 563, description: "15-min loop — pipeline advancement, outreach, content", subsystem: "Core.Orchestrate" },
  { id: "healer", name: "Self-Healing Architect", icon: RotateCcw, status: "idle", lastRun: "1 hr ago", tasksCompleted: 89, description: "Visual-LLM fallback + proxy rotation for resilient scraping", subsystem: "Core.Agents" },
  { id: "concierge", name: "Concierge Engine", icon: Radio, status: "active", lastRun: "30 sec ago", tasksCompleted: 4521, description: "Client communication — luxury-grade auto-responses", subsystem: "Core.Models" },
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

const CoreAgents = () => {
  const [agents, setAgents] = useState(initialAgents);

  const toggleAgent = (id: string) => {
    setAgents(prev => prev.map(a =>
      a.id === id ? { ...a, status: a.status === "active" ? "idle" : "active" } : a
    ));
  };

  return (
    <div className="space-y-3">
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
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-sm font-medium text-foreground">{agent.name}</h3>
                    <Badge variant="outline" className={`text-[9px] ${statusColor[agent.status]}`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {agent.status}
                    </Badge>
                    <Badge variant="secondary" className="text-[8px] bg-primary/5 text-primary/70 border-none">
                      {agent.subsystem}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{agent.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
                    <span>Last run: {agent.lastRun}</span>
                    <span>Tasks: {agent.tasksCompleted.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-primary" onClick={() => toggleAgent(agent.id)}>
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
    </div>
  );
};

export default CoreAgents;
