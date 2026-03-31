import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Zap, Play, Pause, RotateCcw, CheckCircle2, AlertTriangle, Clock, TrendingUp, ArrowRight, Shield, Settings2, Activity, Plus, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import useDocumentHead from "@/hooks/use-document-head";
import { supabase } from "@/integrations/supabase/client";

const statusToStage: Record<string, string> = {
  intake: "Intake", sourcing: "Sourcing", matching: "Vendor Match",
  shortlisted: "Shortlisted", negotiation: "Negotiation", execution: "Execution",
  documentation: "Documentation", completed: "Completed", cancelled: "Cancelled",
};
const statusToProgress: Record<string, number> = {
  intake: 10, sourcing: 25, matching: 40, shortlisted: 55,
  negotiation: 70, execution: 85, documentation: 93, completed: 100, cancelled: 0,
};

const formatCurrency = (cents: number) => {
  if (cents >= 100_000_00) return `$${(cents / 100_00).toFixed(1)}M`;
  if (cents >= 1_000_00) return `$${(cents / 100).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  return `$${(cents / 100).toFixed(2)}`;
};

const useAutopilotStats = () => {
  const [stats, setStats] = useState([
    { label: "Deals Processed", value: "—", change: "—", icon: Zap },
    { label: "Avg. Completion Time", value: "—", change: "—", icon: Clock },
    { label: "Revenue Generated", value: "—", change: "—", icon: TrendingUp },
    { label: "Success Rate", value: "—", change: "—", icon: CheckCircle2 },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
      const lastMonthEnd = thisMonthStart;

      // Fetch all data in parallel
      const [dealsRes, commissionsRes, lastMonthCommRes, completedDealsRes] = await Promise.all([
        supabase.from("deals").select("id, status, completed_at, created_at", { count: "exact" }),
        supabase.from("commission_logs").select("commission_cents").gte("created_at", thisMonthStart),
        supabase.from("commission_logs").select("commission_cents").gte("created_at", lastMonthStart).lt("created_at", lastMonthEnd),
        supabase.from("deals").select("created_at, completed_at").eq("status", "completed").not("completed_at", "is", null),
      ]);

      // Deals processed (total)
      const totalDeals = dealsRes.count || 0;

      // Revenue this month from commissions
      const revenueThisMonth = (commissionsRes.data || []).reduce((sum, r) => sum + (r.commission_cents || 0), 0);
      const revenueLastMonth = (lastMonthCommRes.data || []).reduce((sum, r) => sum + (r.commission_cents || 0), 0);
      const revenueChange = revenueLastMonth > 0
        ? `${revenueThisMonth >= revenueLastMonth ? "+" : ""}${Math.round(((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100)}%`
        : revenueThisMonth > 0 ? "+100%" : "—";

      // Avg completion time (hours) for completed deals
      const completedDeals = (completedDealsRes.data || []).filter(d => d.completed_at && d.created_at);
      let avgHours = 0;
      if (completedDeals.length > 0) {
        const totalHours = completedDeals.reduce((sum, d) => {
          const diff = new Date(d.completed_at!).getTime() - new Date(d.created_at).getTime();
          return sum + diff / (1000 * 60 * 60);
        }, 0);
        avgHours = totalHours / completedDeals.length;
      }

      // Success rate
      const completedCount = (dealsRes.data || []).filter(d => d.status === "completed").length;
      const cancelledCount = (dealsRes.data || []).filter(d => d.status === "cancelled").length;
      const resolvedTotal = completedCount + cancelledCount;
      const successRate = resolvedTotal > 0 ? ((completedCount / resolvedTotal) * 100).toFixed(1) : "—";

      setStats([
        { label: "Deals Processed", value: totalDeals.toLocaleString(), change: `${totalDeals} total`, icon: Zap },
        { label: "Avg. Completion Time", value: avgHours > 0 ? `${avgHours.toFixed(1)}h` : "—", change: `${completedDeals.length} completed`, icon: Clock },
        { label: "Revenue Generated", value: revenueThisMonth > 0 ? formatCurrency(revenueThisMonth) : "$0", change: revenueChange, icon: TrendingUp },
        { label: "Success Rate", value: successRate !== "—" ? `${successRate}%` : "—", change: `${completedCount}/${resolvedTotal}`, icon: CheckCircle2 },
      ]);
    };

    fetchStats();
  }, []);

  return stats;
};

const DealAutopilot = () => {
  const [autopilotEnabled, setAutopilotEnabled] = useState(true);
  const [selectedDeal, setSelectedDeal] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [dealDescription, setDealDescription] = useState("");
  const [dealCategory, setDealCategory] = useState("");
  const [dealBudget, setDealBudget] = useState("");
  const [livePipeline, setLivePipeline] = useState<any[]>([]);
  const autopilotStats = useAutopilotStats();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDeals = async () => {
      const { data } = await supabase
        .from("deals")
        .select("id, deal_number, category, status, deal_value_estimate, budget_currency, updated_at, priority_score")
        .not("status", "eq", "cancelled")
        .order("updated_at", { ascending: false })
        .limit(20);

      setLivePipeline((data || []).map((d: any) => ({
        id: d.id,
        dealNumber: d.deal_number,
        category: d.category?.charAt(0).toUpperCase() + d.category?.slice(1),
        stage: statusToStage[d.status] || d.status,
        progress: statusToProgress[d.status] || 0,
        status: d.status === "completed" ? "completed" : d.priority_score > 80 ? "attention" : "active",
        eta: d.status === "completed" ? "Done" : "Auto",
        value: d.deal_value_estimate ? `$${(d.deal_value_estimate / 1000).toFixed(0)}K` : "—",
      })));
    };
    fetchDeals();
  }, []);

  useDocumentHead({
    title: "AI Deal Autopilot — Autonomous Deal Execution | QUANTUS V2+",
    description: "Fully autonomous deal execution from intake to completion. Zero human input required.",
    canonical: "https://quantus-loom.lovable.app/autopilot",
  });

  const getStatusColor = (status: string) => {
    if (status === "attention") return "text-amber-400";
    return "text-emerald-400";
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopBar />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                  <Bot size={22} className="text-primary" />
                </div>
                AI Deal Autopilot
                <Badge variant="outline" className="text-[10px] border-primary/30 text-primary bg-primary/5">PREMIUM</Badge>
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Fully autonomous deal execution — intake to completion with zero human input.</p>
            </div>
            <div className="flex items-center gap-3">
              <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus size={14} /> New Deal
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Bot size={18} className="text-primary" /> Create Autopilot Deal
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-2">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">What do you need?</label>
                      <Textarea
                        placeholder="E.g., I need a private jet charter from London to Dubai for 8 passengers next month…"
                        rows={3}
                        value={dealDescription}
                        onChange={e => setDealDescription(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Category</label>
                        <Select value={dealCategory} onValueChange={setDealCategory}>
                          <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="aviation">Aviation</SelectItem>
                            <SelectItem value="medical">Medical</SelectItem>
                            <SelectItem value="staffing">Staffing</SelectItem>
                            <SelectItem value="lifestyle">Lifestyle</SelectItem>
                            <SelectItem value="logistics">Logistics</SelectItem>
                            <SelectItem value="partnerships">Partnerships</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Budget (approx.)</label>
                        <Input placeholder="$50,000" value={dealBudget} onChange={e => setDealBudget(e.target.value)} />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1 gap-2"
                        disabled={!dealDescription.trim()}
                        onClick={() => { setCreateOpen(false); navigate("/intake"); }}
                      >
                        <Send size={14} /> Launch on Autopilot
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => { setCreateOpen(false); navigate("/intake"); }}
                      >
                        Manual Intake
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <div className="flex items-center gap-3 glass-card px-4 py-2.5 rounded-xl">
                <span className="text-sm font-medium text-foreground">Autopilot</span>
                <Switch checked={autopilotEnabled} onCheckedChange={setAutopilotEnabled} />
                <motion.div
                  animate={{ scale: autopilotEnabled ? [1, 1.2, 1] : 1 }}
                  transition={{ repeat: autopilotEnabled ? Infinity : 0, duration: 2 }}
                  className={`w-2.5 h-2.5 rounded-full ${autopilotEnabled ? "bg-emerald-400 shadow-lg shadow-emerald-400/50" : "bg-muted-foreground"}`}
                />
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {autopilotStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="glass-card border-border/50">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <stat.icon size={18} className="text-primary" />
                      <span className="text-xs font-semibold text-emerald-400">{stat.change}</span>
                    </div>
                    <div className="font-display text-2xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Tabs defaultValue="pipeline" className="space-y-4">
            <TabsList className="bg-secondary/50">
              <TabsTrigger value="pipeline">Live Pipeline</TabsTrigger>
              <TabsTrigger value="config">Autopilot Config</TabsTrigger>
              <TabsTrigger value="logs">Activity Log</TabsTrigger>
            </TabsList>

            <TabsContent value="pipeline" className="space-y-3">
              {livePipeline.map((deal, i) => (
                <motion.div
                  key={deal.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => setSelectedDeal(selectedDeal === deal.id ? null : deal.id)}
                  className="cursor-pointer"
                >
                  <Card className={`glass-card border-border/50 hover:border-primary/30 transition-all ${selectedDeal === deal.id ? "ring-1 ring-primary/30" : ""}`}>
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <motion.div
                            animate={autopilotEnabled && deal.status === "active" ? { rotate: 360 } : {}}
                            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                            className="p-1.5 rounded-lg bg-primary/10"
                          >
                            <Activity size={14} className="text-primary" />
                          </motion.div>
                          <div>
                            <span className="font-mono text-sm font-semibold text-foreground">{deal.dealNumber}</span>
                            <Badge variant="outline" className="ml-2 text-[10px]">{deal.category}</Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-display text-sm font-bold text-foreground">{deal.value}</span>
                          <div className="flex items-center gap-1.5">
                            <Clock size={12} className="text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">ETA {deal.eta}</span>
                          </div>
                          <div className={`flex items-center gap-1 ${getStatusColor(deal.status)}`}>
                            {deal.status === "attention" ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-muted-foreground">{deal.stage}</span>
                            <span className="text-foreground font-medium">{deal.progress}%</span>
                          </div>
                          <Progress value={deal.progress} className="h-1.5" />
                        </div>
                      </div>

                      <AnimatePresence>
                        {selectedDeal === deal.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-3 gap-4">
                              <div className="text-center">
                                <div className="text-xs text-muted-foreground mb-1">AI Actions</div>
                                <div className="text-sm font-semibold text-foreground">24 completed</div>
                              </div>
                              <div className="text-center">
                                <div className="text-xs text-muted-foreground mb-1">Vendors Contacted</div>
                                <div className="text-sm font-semibold text-foreground">8 matched</div>
                              </div>
                              <div className="text-center">
                                <div className="text-xs text-muted-foreground mb-1">Confidence</div>
                                <div className="text-sm font-semibold text-emerald-400">94%</div>
                              </div>
                            </div>
                            <div className="mt-3 flex gap-2">
                              <Button size="sm" variant="outline" className="text-xs gap-1.5">
                                <Pause size={12} /> Pause
                              </Button>
                              <Button size="sm" variant="outline" className="text-xs gap-1.5">
                                <RotateCcw size={12} /> Retry Stage
                              </Button>
                              <Button
                                size="sm"
                                className="text-xs gap-1.5 ml-auto"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/deals`);
                                }}
                              >
                                <ArrowRight size={12} /> View Deal
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </TabsContent>

            <TabsContent value="config">
              <Card className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings2 size={18} className="text-primary" />
                    Autopilot Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    { label: "Auto-classify incoming deals", desc: "AI categorizes and routes deals instantly", enabled: true },
                    { label: "Autonomous vendor sourcing", desc: "AI finds, scores, and contacts vendors", enabled: true },
                    { label: "Auto-negotiate pricing", desc: "AI handles initial price negotiations", enabled: false },
                    { label: "Auto-generate contracts", desc: "Create and send contracts automatically", enabled: false },
                    { label: "Human approval for deals > $500K", desc: "Require manual sign-off on high-value deals", enabled: true },
                  ].map((config, i) => (
                    <div key={i} className="flex items-center justify-between py-2">
                      <div>
                        <div className="text-sm font-medium text-foreground">{config.label}</div>
                        <div className="text-xs text-muted-foreground">{config.desc}</div>
                      </div>
                      <Switch defaultChecked={config.enabled} />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="logs">
              <Card className="glass-card border-border/50">
                <CardContent className="p-5 space-y-3">
                  {[
                    { time: "2 min ago", action: "Auto-classified deal QAI-5D2B1C8G as Logistics", type: "info" },
                    { time: "8 min ago", action: "Sent vendor outreach to 3 suppliers for QAI-1B5F6D3E", type: "success" },
                    { time: "15 min ago", action: "Negotiation stall detected on QAI-1B5F6D3E — escalated", type: "warning" },
                    { time: "22 min ago", action: "Generated comparison report for QAI-9E4D8C2A", type: "info" },
                    { time: "35 min ago", action: "Deal QAI-3C7A9E4F entering final completion stage", type: "success" },
                    { time: "1h ago", action: "Budget optimization: saved $42K on QAI-7A3F2B1C sourcing", type: "success" },
                  ].map((log, i) => (
                    <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-3 py-2.5 border-b border-border/30 last:border-0">
                      <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${log.type === "success" ? "bg-emerald-400" : log.type === "warning" ? "bg-amber-400" : "bg-primary"}`} />
                      <div className="flex-1">
                        <p className="text-sm text-foreground">{log.action}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{log.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default DealAutopilot;
