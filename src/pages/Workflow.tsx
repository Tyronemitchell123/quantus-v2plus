import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plane, Heart, Users, Globe, Truck, Handshake, Sparkles, Loader2,
  ArrowLeft, ArrowRight, CheckCircle2, Clock, AlertTriangle, Shield,
  Calendar, FileText, MessageSquare, Send, Eye, Zap, ChevronDown,
  ChevronUp, RefreshCw, Gavel, BarChart3, Activity, CircleDot,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import useDocumentHead from "@/hooks/use-document-head";

const categoryIcons: Record<string, typeof Plane> = {
  aviation: Plane, medical: Heart, staffing: Users,
  lifestyle: Globe, logistics: Truck, partnerships: Handshake,
};

type Deal = {
  id: string;
  deal_number: string;
  category: string;
  sub_category: string | null;
  intent: string | null;
  priority_score: number;
  status: string;
  budget_max: number | null;
  budget_currency: string;
};

type WorkflowTask = {
  id: string;
  deal_id: string;
  phase: string;
  task_type: string;
  title: string;
  description: string | null;
  status: string;
  priority: number;
  assigned_to: string | null;
  due_at: string | null;
  completed_at: string | null;
  risk_level: string | null;
  risk_notes: string | null;
  metadata: Record<string, any>;
  created_at: string;
};

type RiskAssessment = {
  overall_status: string;
  completion_percentage: number;
  bottlenecks: string[];
  overdue_actions: string[];
  risk_alerts: { severity: string; description: string; mitigation: string }[];
  recommended_actions: string[];
  eta_adjustment_days: number;
};

const taskTypeIcons: Record<string, typeof Calendar> = {
  scheduling: Calendar,
  document: FileText,
  communication: MessageSquare,
  coordination: Send,
  risk_monitoring: Shield,
  verification: Eye,
  payment: BarChart3,
};

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Pending", color: "text-muted-foreground", bg: "bg-muted" },
  in_progress: { label: "In Progress", color: "text-blue-400", bg: "bg-blue-400/10" },
  awaiting_response: { label: "Awaiting Response", color: "text-amber-400", bg: "bg-amber-400/10" },
  completed: { label: "Completed", color: "text-emerald-400", bg: "bg-emerald-400/10" },
  blocked: { label: "Blocked", color: "text-red-400", bg: "bg-red-400/10" },
  skipped: { label: "Skipped", color: "text-muted-foreground", bg: "bg-muted" },
};

const riskStatusColors: Record<string, string> = {
  on_track: "text-emerald-400 border-emerald-400/30",
  at_risk: "text-amber-400 border-amber-400/30",
  delayed: "text-red-400 border-red-400/30",
  critical: "text-red-500 border-red-500/50",
};

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-primary rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
    </div>
  );
}

function TaskCard({
  task, onUpdateStatus, onSendComm, updating,
}: {
  task: WorkflowTask;
  onUpdateStatus: (id: string, status: string) => void;
  onSendComm: (id: string, type: string) => void;
  updating: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const st = statusConfig[task.status] || statusConfig.pending;
  const TIcon = taskTypeIcons[task.task_type] || CircleDot;
  const isOverdue = task.due_at && task.status !== "completed" && new Date(task.due_at) < new Date();
  const meta = task.metadata || {};

  return (
    <motion.div layout className={`border bg-card overflow-hidden transition-colors ${isOverdue ? "border-red-400/30" : task.status === "completed" ? "border-emerald-400/10" : "border-border"}`}>
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left p-4 flex items-center gap-3">
        <div className={`w-8 h-8 flex items-center justify-center shrink-0 border ${task.status === "completed" ? "border-emerald-400/30 bg-emerald-400/10" : "border-border bg-muted"}`}>
          {task.status === "completed" ? (
            <CheckCircle2 size={14} className="text-emerald-400" />
          ) : (
            <TIcon size={14} className="text-primary/60" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className={`text-[9px] font-body tracking-widest uppercase ${st.color}`}>{st.label}</span>
            {isOverdue && (
              <span className="text-[9px] font-body tracking-wider uppercase text-red-400 flex items-center gap-0.5">
                <AlertTriangle size={8} /> Overdue
              </span>
            )}
            {task.risk_level === "high" && (
              <span className="text-[9px] font-body tracking-wider uppercase text-amber-400 flex items-center gap-0.5">
                <Shield size={8} /> High Risk
              </span>
            )}
          </div>
          <p className={`font-body text-sm ${task.status === "completed" ? "text-muted-foreground line-through" : "text-foreground"}`}>{task.title}</p>
        </div>
        <div className="text-right shrink-0 space-y-0.5">
          {task.due_at && (
            <p className={`font-body text-[10px] flex items-center gap-1 justify-end ${isOverdue ? "text-red-400" : "text-muted-foreground"}`}>
              <Clock size={9} /> {new Date(task.due_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
            </p>
          )}
          {task.assigned_to && (
            <p className="font-body text-[9px] text-muted-foreground">{task.assigned_to}</p>
          )}
        </div>
        {expanded ? <ChevronUp size={14} className="text-muted-foreground shrink-0" /> : <ChevronDown size={14} className="text-muted-foreground shrink-0" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4 space-y-3 border-t border-border/50 pt-3">
              {task.description && (
                <p className="font-body text-xs text-foreground/60 leading-relaxed">{task.description}</p>
              )}
              {task.risk_notes && (
                <p className="font-body text-[10px] text-amber-400/80 flex items-start gap-1">
                  <AlertTriangle size={10} className="shrink-0 mt-0.5" /> {task.risk_notes}
                </p>
              )}

              {/* Messages preview */}
              {meta.client_message && (
                <div className="border border-primary/10 bg-primary/5 p-3">
                  <p className="font-body text-[9px] tracking-wider uppercase text-primary/60 mb-1">Client Message</p>
                  <p className="font-body text-[11px] text-foreground/60 italic leading-relaxed">"{meta.client_message}"</p>
                </div>
              )}

              {/* Actions */}
              {task.status !== "completed" && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {task.status === "pending" && (
                    <button onClick={() => onUpdateStatus(task.id, "in_progress")} disabled={updating === task.id}
                      className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground font-body text-[9px] tracking-widest uppercase hover:bg-primary/90 disabled:opacity-50">
                      {updating === task.id ? <Loader2 size={9} className="animate-spin" /> : <Activity size={9} />} Start
                    </button>
                  )}
                  {task.status !== "completed" && (
                    <button onClick={() => onUpdateStatus(task.id, "completed")} disabled={updating === task.id}
                      className="flex items-center gap-1 px-3 py-1.5 bg-muted border border-border font-body text-[9px] tracking-widest uppercase text-foreground hover:bg-muted/80 disabled:opacity-50">
                      <CheckCircle2 size={9} /> Complete
                    </button>
                  )}
                  {meta.client_message && (
                    <button onClick={() => onSendComm(task.id, "client")}
                      className="flex items-center gap-1 px-3 py-1.5 bg-muted border border-border font-body text-[9px] tracking-widest uppercase text-muted-foreground hover:text-foreground">
                      <Send size={9} /> Send to Client
                    </button>
                  )}
                  {meta.vendor_message && (
                    <button onClick={() => onSendComm(task.id, "vendor")}
                      className="flex items-center gap-1 px-3 py-1.5 bg-muted border border-border font-body text-[9px] tracking-widest uppercase text-muted-foreground hover:text-foreground">
                      <Send size={9} /> Send to Vendor
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Workflow() {
  useDocumentHead({
    title: "Workflow Orchestration — Quantus A.I",
    description: "Automated workflow scheduling and coordination for UHNW deals.",
  });

  const [searchParams] = useSearchParams();
  const dealId = searchParams.get("deal");
  const [deal, setDeal] = useState<Deal | null>(null);
  const [tasks, setTasks] = useState<WorkflowTask[]>([]);
  const [riskData, setRiskData] = useState<RiskAssessment | null>(null);
  const [clientSummary, setClientSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [checkingRisk, setCheckingRisk] = useState(false);
  const [activePhase, setActivePhase] = useState<string | null>(null);

  useEffect(() => {
    if (dealId) loadData(dealId);
  }, [dealId]);

  async function loadData(id: string) {
    setLoading(true);
    const { data: d } = await supabase.from("deals").select("*").eq("id", id).single();
    if (d) setDeal(d as unknown as Deal);

    const { data: wfTasks } = await supabase
      .from("workflow_tasks")
      .select("*")
      .eq("deal_id", id)
      .order("due_at", { ascending: true });

    if (wfTasks) setTasks(wfTasks as unknown as WorkflowTask[]);
    setLoading(false);
  }

  async function generateWorkflow() {
    if (!dealId || generating) return;
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("workflow-engine", {
        body: { action: "generate", deal_id: dealId },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      setClientSummary(data.client_summary);
      toast.success(`Workflow created: ${data.tasks_created} tasks`);
      await loadData(dealId);
    } catch (e: any) {
      toast.error(e.message || "Failed to generate workflow");
    } finally {
      setGenerating(false);
    }
  }

  async function handleUpdateStatus(taskId: string, status: string) {
    setUpdating(taskId);
    try {
      const { error } = await supabase.functions.invoke("workflow-engine", {
        body: { action: "update_task", task_id: taskId, status },
      });
      if (error) throw new Error(error.message);
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status, completed_at: status === "completed" ? new Date().toISOString() : t.completed_at } : t));
      toast.success(`Task ${status === "completed" ? "completed" : "updated"}`);
    } catch (e: any) {
      toast.error(e.message || "Update failed");
    } finally {
      setUpdating(null);
    }
  }

  async function handleSendComm(taskId: string, type: string) {
    try {
      const { error } = await supabase.functions.invoke("workflow-engine", {
        body: { action: "send_communication", task_id: taskId, deal_id: dealId, message_type: type },
      });
      if (error) throw new Error(error.message);
      toast.success("Communication sent");
    } catch (e: any) {
      toast.error(e.message || "Send failed");
    }
  }

  async function runRiskCheck() {
    if (!dealId || checkingRisk) return;
    setCheckingRisk(true);
    try {
      const { data, error } = await supabase.functions.invoke("workflow-engine", {
        body: { action: "risk_check", deal_id: dealId },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      setRiskData(data as RiskAssessment);
      toast.success("Risk assessment complete");
    } catch (e: any) {
      toast.error(e.message || "Risk check failed");
    } finally {
      setCheckingRisk(false);
    }
  }

  async function handleFinalize() {
    if (!dealId) return;
    try {
      const { error } = await supabase.functions.invoke("workflow-engine", {
        body: { action: "finalize", deal_id: dealId },
      });
      if (error) throw new Error(error.message);
      toast.success("Workflow complete — advancing to Documentation & Billing");
    } catch (e: any) {
      toast.error(e.message || "Finalization failed");
    }
  }

  const CatIcon = deal ? categoryIcons[deal.category] || Sparkles : Sparkles;

  // Group tasks by phase
  const phases = tasks.reduce<Record<string, WorkflowTask[]>>((acc, t) => {
    if (!acc[t.phase]) acc[t.phase] = [];
    acc[t.phase].push(t);
    return acc;
  }, {});

  const phaseOrder = Object.keys(phases);
  const completedCount = tasks.filter(t => t.status === "completed").length;
  const totalCount = tasks.length;
  const completionPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const overdueTasks = tasks.filter(t => t.status !== "completed" && t.due_at && new Date(t.due_at) < new Date());

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-6 max-w-5xl">
        <Link to={dealId ? `/negotiation?deal=${dealId}` : "/negotiation"} className="inline-flex items-center gap-1.5 font-body text-xs text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft size={14} /> Back to Negotiation
        </Link>

        {loading ? (
          <div className="text-center py-20"><Loader2 size={24} className="animate-spin text-primary mx-auto" /></div>
        ) : !deal ? (
          <div className="text-center py-20">
            <p className="font-body text-sm text-muted-foreground">No deal selected. <Link to="/intake" className="text-primary hover:underline">Submit a request first</Link>.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-card border border-border flex items-center justify-center">
                  <CatIcon size={20} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-body text-xs tracking-[0.3em] uppercase text-primary/60 mb-1">Phase 5 — Workflow Orchestration</p>
                  <h1 className="font-display text-3xl md:text-4xl font-medium text-foreground mb-2">{deal.intent || deal.sub_category || "Deal"}</h1>
                  <div className="flex flex-wrap gap-3 font-body text-xs text-muted-foreground">
                    <span className="capitalize">{deal.category}</span>
                    <span>·</span>
                    <span>{deal.deal_number}</span>
                  </div>
                </div>
              </div>

              {/* Progress bar if tasks exist */}
              {tasks.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-body text-xs text-muted-foreground">{completedCount} of {totalCount} tasks complete</p>
                    <p className="font-display text-sm text-primary">{completionPct}%</p>
                  </div>
                  <ProgressBar value={completionPct} />
                </div>
              )}

              {/* Stats */}
              {tasks.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  {[
                    { label: "Total Tasks", value: totalCount, icon: CircleDot },
                    { label: "Completed", value: completedCount, icon: CheckCircle2 },
                    { label: "In Progress", value: tasks.filter(t => t.status === "in_progress").length, icon: Activity },
                    { label: "Overdue", value: overdueTasks.length, icon: AlertTriangle },
                  ].map((s) => (
                    <div key={s.label} className="bg-card border border-border p-4">
                      <s.icon size={14} className="text-primary/40 mb-2" />
                      <p className="font-display text-2xl text-foreground">{s.value}</p>
                      <p className="font-body text-[10px] tracking-wider uppercase text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Generate button */}
              {tasks.length === 0 && !generating && (
                <button onClick={generateWorkflow}
                  className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground font-body text-xs tracking-widest uppercase hover:bg-primary/90 transition-all">
                  <Zap size={14} /> Generate Workflow Blueprint
                </button>
              )}

              {/* Risk check & actions */}
              {tasks.length > 0 && !generating && (
                <div className="flex flex-wrap gap-2">
                  <button onClick={runRiskCheck} disabled={checkingRisk}
                    className="flex items-center gap-1.5 px-5 py-2 bg-muted border border-border text-foreground font-body text-[10px] tracking-widest uppercase hover:bg-muted/80 disabled:opacity-50">
                    {checkingRisk ? <Loader2 size={10} className="animate-spin" /> : <Shield size={10} />} Risk Assessment
                  </button>
                </div>
              )}
            </motion.div>

            {/* Generating */}
            <AnimatePresence>
              {generating && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-16">
                  <div className="inline-flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full border-2 border-primary/20 flex items-center justify-center">
                      <Loader2 size={24} className="animate-spin text-primary" />
                    </div>
                    <div>
                      <p className="font-display text-lg text-foreground mb-1">Generating Workflow Blueprint</p>
                      <p className="font-body text-xs text-muted-foreground">Creating tasks, scheduling, document requirements, and risk monitoring…</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Client Summary */}
            {clientSummary && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="border border-primary/20 bg-primary/5 p-5 mb-8">
                <p className="font-body text-[10px] tracking-[0.2em] uppercase text-primary mb-2">Client Communication</p>
                <p className="font-body text-sm text-foreground/80 leading-relaxed italic">"{clientSummary}"</p>
              </motion.div>
            )}

            {/* Risk Assessment */}
            {riskData && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border border-border bg-card p-5 mb-8 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground">Risk Assessment</p>
                  <span className={`px-3 py-1 border text-[10px] font-body tracking-widest uppercase ${riskStatusColors[riskData.overall_status] || "text-muted-foreground border-border"}`}>
                    {riskData.overall_status?.replace("_", " ")}
                  </span>
                </div>
                <ProgressBar value={riskData.completion_percentage} />
                <p className="font-body text-xs text-muted-foreground">{riskData.completion_percentage}% workflow completion</p>

                {riskData.risk_alerts && riskData.risk_alerts.length > 0 && (
                  <div className="space-y-2">
                    <p className="font-body text-[10px] tracking-wider uppercase text-amber-400/70">Alerts</p>
                    {riskData.risk_alerts.map((a, i) => (
                      <div key={i} className={`p-3 border ${a.severity === "critical" ? "border-red-400/30 bg-red-400/5" : a.severity === "high" ? "border-amber-400/30 bg-amber-400/5" : "border-border bg-muted/20"}`}>
                        <p className="font-body text-xs text-foreground/70">{a.description}</p>
                        <p className="font-body text-[10px] text-muted-foreground mt-1">Mitigation: {a.mitigation}</p>
                      </div>
                    ))}
                  </div>
                )}

                {riskData.recommended_actions && riskData.recommended_actions.length > 0 && (
                  <div>
                    <p className="font-body text-[10px] tracking-wider uppercase text-primary/70 mb-1.5">Recommended Actions</p>
                    <ul className="space-y-1">
                      {riskData.recommended_actions.map((a, i) => (
                        <li key={i} className="font-body text-xs text-foreground/60 flex items-start gap-1.5">
                          <ArrowRight size={10} className="text-primary shrink-0 mt-0.5" /> {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}

            {/* Task Phases */}
            {tasks.length > 0 && !generating && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                {/* Phase tabs */}
                <div className="flex flex-wrap gap-2 mb-2">
                  <button
                    onClick={() => setActivePhase(null)}
                    className={`px-3 py-1.5 font-body text-[10px] tracking-widest uppercase border transition-colors ${!activePhase ? "bg-primary text-primary-foreground border-primary" : "bg-muted border-border text-muted-foreground hover:text-foreground"}`}
                  >
                    All ({totalCount})
                  </button>
                  {phaseOrder.map((phase) => {
                    const phaseCompleted = phases[phase].filter(t => t.status === "completed").length;
                    return (
                      <button
                        key={phase}
                        onClick={() => setActivePhase(phase)}
                        className={`px-3 py-1.5 font-body text-[10px] tracking-widest uppercase border transition-colors ${activePhase === phase ? "bg-primary text-primary-foreground border-primary" : "bg-muted border-border text-muted-foreground hover:text-foreground"}`}
                      >
                        {phase.replace(/_/g, " ")} ({phaseCompleted}/{phases[phase].length})
                      </button>
                    );
                  })}
                </div>

                {/* Task list */}
                <div className="space-y-2">
                  {(activePhase ? phases[activePhase] || [] : tasks).map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onUpdateStatus={handleUpdateStatus}
                      onSendComm={handleSendComm}
                      updating={updating}
                    />
                  ))}
                </div>

                {/* Finalize */}
                <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <p className="font-display text-lg text-foreground">Workflow Complete?</p>
                    <p className="font-body text-xs text-muted-foreground">Advance to Phase 6 — Documentation & Billing</p>
                  </div>
                  <Link to={`/documents?deal=${selectedDeal}`}
                    className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground font-body text-xs tracking-widest uppercase hover:bg-primary/90 transition-all">
                    <Gavel size={14} /> Begin Phase 6 <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
