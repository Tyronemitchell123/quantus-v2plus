import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plane, Heart, Users, Globe, Truck, Handshake, Sparkles, Loader2,
  ArrowLeft, ArrowRight, CheckCircle2, Clock, AlertTriangle, Shield,
  Calendar, FileText, MessageSquare, Send, Eye, Zap, ChevronDown,
  ChevronUp, RefreshCw, Gavel, BarChart3, Activity, CircleDot,
  CreditCard, ChevronRight, ToggleLeft, ToggleRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import useDocumentHead from "@/hooks/use-document-head";
import DealPhaseLayout from "@/components/deal/DealPhaseLayout";

const categoryIcons: Record<string, typeof Plane> = {
  aviation: Plane, medical: Heart, staffing: Users,
  lifestyle: Globe, logistics: Truck, partnerships: Handshake,
};

type Deal = {
  id: string; deal_number: string; category: string;
  sub_category: string | null; intent: string | null;
  priority_score: number; status: string;
  budget_max: number | null; budget_currency: string;
};

type WorkflowTask = {
  id: string; deal_id: string; phase: string; task_type: string;
  title: string; description: string | null; status: string;
  priority: number; assigned_to: string | null; due_at: string | null;
  completed_at: string | null; risk_level: string | null;
  risk_notes: string | null; metadata: Record<string, any>; created_at: string;
};

type RiskAssessment = {
  overall_status: string; completion_percentage: number;
  bottlenecks: string[]; overdue_actions: string[];
  risk_alerts: { severity: string; description: string; mitigation: string }[];
  recommended_actions: string[]; eta_adjustment_days: number;
};

const taskTypeIcons: Record<string, typeof Calendar> = {
  scheduling: Calendar, document: FileText, communication: MessageSquare,
  coordination: Send, risk_monitoring: Shield, verification: Eye, payment: BarChart3,
};

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "text-[hsl(var(--muted-foreground))]" },
  in_progress: { label: "In Progress", color: "text-blue-400" },
  awaiting_response: { label: "Awaiting", color: "text-amber-400" },
  completed: { label: "Completed", color: "text-emerald-400" },
  blocked: { label: "Blocked", color: "text-red-400" },
};

/* ── Milestone Timeline (Left Column) ── */
function MilestoneTimeline({ tasks }: { tasks: WorkflowTask[] }) {
  const milestones = tasks
    .filter(t => t.status === "completed" || t.priority >= 70)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .slice(0, 12);

  const pendingMilestones = [
    { title: "All vendor confirmations received", done: tasks.filter(t => t.task_type === "coordination").every(t => t.status === "completed") },
    { title: "Document package generated", done: tasks.filter(t => t.task_type === "document").every(t => t.status === "completed") },
    { title: "Compliance checks completed", done: tasks.filter(t => t.task_type === "verification").every(t => t.status === "completed") },
    { title: "Payment links issued", done: tasks.filter(t => t.task_type === "payment").every(t => t.status === "completed") },
    { title: "Final confirmation received", done: tasks.every(t => t.status === "completed") },
  ];

  return (
    <div className="space-y-0">
      <h3 className="font-display text-sm text-[hsl(var(--foreground))] mb-4">
        Timeline & Milestones
        <div className="w-12 h-px bg-[hsl(var(--primary))] mt-1" />
      </h3>

      <div className="relative pl-6">
        {/* Gold vertical line */}
        <div className="absolute left-[9px] top-2 bottom-2 w-px bg-gradient-to-b from-[hsl(var(--primary))] via-[hsl(var(--primary)/0.4)] to-transparent" />

        {milestones.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="relative mb-4"
          >
            <div className={`absolute -left-6 top-2 w-[10px] h-[10px] rounded-full border-2 ${
              t.status === "completed"
                ? "bg-[hsl(var(--primary))] border-[hsl(var(--primary))]"
                : "bg-transparent border-[hsl(var(--primary)/0.5)]"
            }`} />
            <div className="border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                {t.status === "completed" ? (
                  <CheckCircle2 size={10} className="text-emerald-400" />
                ) : (
                  <Clock size={10} className="text-[hsl(var(--primary)/0.6)]" />
                )}
                <span className={`text-[9px] font-body tracking-widest uppercase ${statusConfig[t.status]?.color || "text-[hsl(var(--muted-foreground))]"}`}>
                  {statusConfig[t.status]?.label || t.status}
                </span>
              </div>
              <p className="font-body text-xs text-[hsl(var(--foreground)/0.8)]">{t.title}</p>
              {t.due_at && (
                <p className="font-body text-[9px] text-[hsl(var(--muted-foreground))] mt-1">
                  {new Date(t.due_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </p>
              )}
            </div>
          </motion.div>
        ))}

        {/* Pending milestones */}
        {pendingMilestones.map((m, i) => (
          <motion.div
            key={m.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: milestones.length * 0.08 + i * 0.06 }}
            className="relative mb-3"
          >
            <div className={`absolute -left-6 top-1.5 w-[10px] h-[10px] rounded-full border-2 ${
              m.done
                ? "bg-[hsl(var(--primary))] border-[hsl(var(--primary))]"
                : "bg-transparent border-[hsl(var(--primary)/0.2)]"
            }`} />
            <p className={`font-body text-[11px] ${m.done ? "text-[hsl(var(--primary))] line-through" : "text-[hsl(var(--muted-foreground))]"}`}>
              {m.title}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ── Task Card (Center Column) ── */
function TaskCard({
  task, onUpdateStatus, onSendComm, updating, index,
}: {
  task: WorkflowTask;
  onUpdateStatus: (id: string, status: string) => void;
  onSendComm: (id: string, type: string) => void;
  updating: string | null;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const st = statusConfig[task.status] || statusConfig.pending;
  const TIcon = taskTypeIcons[task.task_type] || CircleDot;
  const isOverdue = task.due_at && task.status !== "completed" && new Date(task.due_at) < new Date();
  const meta = task.metadata || {};

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className={`border rounded-xl bg-[hsl(var(--card))] overflow-hidden transition-all hover:border-[hsl(var(--primary)/0.3)] ${
        isOverdue ? "border-red-400/30" : task.status === "completed" ? "border-emerald-400/10" : "border-[hsl(var(--border))]"
      }`}
    >
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left p-4 flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
          task.status === "completed"
            ? "border-emerald-400/30 bg-emerald-400/10"
            : "border-[hsl(var(--primary)/0.2)] bg-[hsl(var(--primary)/0.05)]"
        }`}>
          {task.status === "completed" ? (
            <CheckCircle2 size={14} className="text-emerald-400" />
          ) : (
            <TIcon size={14} className="text-[hsl(var(--primary)/0.7)]" />
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
          <p className={`font-body text-sm ${task.status === "completed" ? "text-[hsl(var(--muted-foreground))] line-through" : "text-[hsl(var(--foreground))]"}`}>
            {task.title}
          </p>
        </div>

        <div className="text-right shrink-0 space-y-0.5">
          {task.due_at && (
            <p className={`font-body text-[10px] flex items-center gap-1 justify-end ${isOverdue ? "text-red-400" : "text-[hsl(var(--muted-foreground))]"}`}>
              <Clock size={9} /> {new Date(task.due_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
            </p>
          )}
          {task.assigned_to && (
            <p className="font-body text-[9px] text-[hsl(var(--muted-foreground))]">{task.assigned_to}</p>
          )}
        </div>
        {expanded ? <ChevronUp size={14} className="text-[hsl(var(--muted-foreground))] shrink-0" /> : <ChevronDown size={14} className="text-[hsl(var(--muted-foreground))] shrink-0" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4 space-y-3 border-t border-[hsl(var(--border)/0.5)] pt-3">
              {task.description && (
                <p className="font-body text-xs text-[hsl(var(--foreground)/0.6)] leading-relaxed">{task.description}</p>
              )}
              {task.risk_notes && (
                <p className="font-body text-[10px] text-amber-400/80 flex items-start gap-1">
                  <AlertTriangle size={10} className="shrink-0 mt-0.5" /> {task.risk_notes}
                </p>
              )}

              {meta.client_message && (
                <div className="border border-[hsl(var(--primary)/0.15)] bg-[hsl(var(--primary)/0.05)] p-3 rounded-lg">
                  <p className="font-body text-[9px] tracking-wider uppercase text-[hsl(var(--primary)/0.6)] mb-1">AI‑Generated Action</p>
                  <p className="font-body text-[11px] text-[hsl(var(--foreground)/0.6)] italic leading-relaxed">"{meta.client_message}"</p>
                </div>
              )}

              {task.status !== "completed" && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {task.status === "pending" && (
                    <button onClick={() => onUpdateStatus(task.id, "in_progress")} disabled={updating === task.id}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg font-body text-[9px] tracking-widest uppercase hover:opacity-90 disabled:opacity-50 transition-all">
                      {updating === task.id ? <Loader2 size={9} className="animate-spin" /> : <Activity size={9} />} Execute Action
                    </button>
                  )}
                  {task.status !== "completed" && (
                    <button onClick={() => onUpdateStatus(task.id, "completed")} disabled={updating === task.id}
                      className="flex items-center gap-1.5 px-4 py-2 border border-[hsl(var(--border))] rounded-lg font-body text-[9px] tracking-widest uppercase text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] disabled:opacity-50 transition-all">
                      <CheckCircle2 size={9} /> Complete
                    </button>
                  )}
                  {meta.client_message && (
                    <button onClick={() => onSendComm(task.id, "client")}
                      className="flex items-center gap-1.5 px-4 py-2 border border-[hsl(var(--border))] rounded-lg font-body text-[9px] tracking-widest uppercase text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-all">
                      <Send size={9} /> Send
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

/* ── Operational Panel (Right Column) ── */
function OperationalPanel({
  tasks, riskData, onRunRisk, checkingRisk,
}: {
  tasks: WorkflowTask[];
  riskData: RiskAssessment | null;
  onRunRisk: () => void;
  checkingRisk: boolean;
}) {
  const [autoConfirm, setAutoConfirm] = useState(false);
  const [autoUpdates, setAutoUpdates] = useState(true);
  const [autoCompliance, setAutoCompliance] = useState(true);

  const inProgress = tasks.filter(t => t.status === "in_progress").length;
  const pending = tasks.filter(t => t.status === "pending" || t.status === "awaiting_response").length;
  const docs = tasks.filter(t => t.task_type === "document" && t.status !== "completed").length;
  const completedCount = tasks.filter(t => t.status === "completed").length;
  const totalCount = tasks.length;
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const recommendations = [
    tasks.some(t => t.risk_level === "high") && "Prioritize high-risk vendor tasks due to time sensitivity.",
    docs > 0 && `${docs} document${docs > 1 ? "s" : ""} awaiting review or signature.`,
    pending > 2 && "Consider auto-sending confirmations to accelerate workflow.",
    pct > 80 && "Workflow nearing completion — payment links can be issued now.",
  ].filter(Boolean) as string[];

  const riskAlerts = tasks
    .filter(t => t.risk_level === "high" || (t.due_at && t.status !== "completed" && new Date(t.due_at) < new Date()))
    .map(t => ({
      text: t.risk_notes || `${t.title} may cause delays.`,
      severity: t.risk_level === "high" ? "high" : "medium",
    }))
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <div className="border border-[hsl(var(--primary)/0.2)] bg-[hsl(var(--card))] rounded-xl p-4" style={{ boxShadow: "inset 0 1px 20px hsl(var(--primary) / 0.03)" }}>
        <h3 className="font-display text-sm text-[hsl(var(--foreground))] mb-1">
          Current Status
          <div className="w-10 h-px bg-[hsl(var(--primary))] mt-1" />
        </h3>
        <div className="mt-3 space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-body text-[11px] text-[hsl(var(--muted-foreground))]">Overall Progress</span>
            <span className="font-display text-sm text-[hsl(var(--primary))]">{pct}%</span>
          </div>
          <div className="w-full h-1.5 bg-[hsl(var(--muted))] rounded-full overflow-hidden">
            <motion.div className="h-full bg-[hsl(var(--primary))] rounded-full" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.2 }} />
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3">
            {[
              { n: inProgress, l: "In Progress", c: "text-blue-400" },
              { n: pending, l: "Pending", c: "text-amber-400" },
              { n: docs, l: "Docs Due", c: "text-[hsl(var(--primary))]" },
            ].map(s => (
              <div key={s.l} className="text-center">
                <p className={`font-display text-lg ${s.c}`}>{s.n}</p>
                <p className="font-body text-[8px] tracking-wider uppercase text-[hsl(var(--muted-foreground))]">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <div className="border border-[hsl(var(--border))] bg-[hsl(var(--card))] rounded-xl p-4">
          <h3 className="font-display text-sm text-[hsl(var(--foreground))] mb-3">
            AI Recommendations
            <div className="w-10 h-px bg-[hsl(var(--primary))] mt-1" />
          </h3>
          <div className="space-y-2">
            {recommendations.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-start gap-2"
              >
                <Sparkles size={10} className="text-[hsl(var(--primary))] shrink-0 mt-0.5" />
                <p className="font-body text-[11px] text-[hsl(var(--foreground)/0.7)] leading-relaxed">{r}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Auto-Execution Toggles */}
      <div className="border border-[hsl(var(--border))] bg-[hsl(var(--card))] rounded-xl p-4">
        <h3 className="font-display text-sm text-[hsl(var(--foreground))] mb-3">
          Auto‑Execution
          <div className="w-10 h-px bg-[hsl(var(--primary))] mt-1" />
        </h3>
        <div className="space-y-3">
          {[
            { label: "Auto‑send confirmations", val: autoConfirm, set: setAutoConfirm },
            { label: "Auto‑request updates", val: autoUpdates, set: setAutoUpdates },
            { label: "Auto‑trigger compliance", val: autoCompliance, set: setAutoCompliance },
          ].map(toggle => (
            <button
              key={toggle.label}
              onClick={() => toggle.set(!toggle.val)}
              className="w-full flex items-center justify-between group"
            >
              <span className="font-body text-[11px] text-[hsl(var(--foreground)/0.7)]">{toggle.label}</span>
              {toggle.val ? (
                <ToggleRight size={20} className="text-[hsl(var(--primary))]" />
              ) : (
                <ToggleLeft size={20} className="text-[hsl(var(--muted-foreground))]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Risk & Delay Alerts */}
      {riskAlerts.length > 0 && (
        <div className="border border-[hsl(var(--border))] bg-[hsl(var(--card))] rounded-xl p-4">
          <h3 className="font-display text-sm text-[hsl(var(--foreground))] mb-3">
            Risk & Delay Alerts
            <div className="w-10 h-px bg-red-400/50 mt-1" />
          </h3>
          <div className="space-y-2">
            {riskAlerts.map((a, i) => (
              <div key={i} className={`p-2.5 rounded-lg border text-[11px] font-body leading-relaxed ${
                a.severity === "high"
                  ? "border-red-400/20 bg-red-400/5 text-red-300"
                  : "border-amber-400/20 bg-amber-400/5 text-amber-300"
              }`}>
                <AlertTriangle size={10} className="inline mr-1.5" />
                {a.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risk Assessment Button */}
      <button
        onClick={onRunRisk}
        disabled={checkingRisk}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-[hsl(var(--border))] rounded-xl font-body text-[10px] tracking-widest uppercase text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] disabled:opacity-50 transition-all"
      >
        {checkingRisk ? <Loader2 size={10} className="animate-spin" /> : <Shield size={10} />}
        Run Risk Assessment
      </button>

      {/* Risk Assessment Results */}
      {riskData && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border border-[hsl(var(--primary)/0.2)] bg-[hsl(var(--card))] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-body text-[10px] tracking-widest uppercase text-[hsl(var(--muted-foreground))]">Assessment Result</p>
            <span className={`px-2 py-0.5 rounded text-[9px] font-body tracking-wider uppercase border ${
              riskData.overall_status === "on_track" ? "text-emerald-400 border-emerald-400/30" :
              riskData.overall_status === "at_risk" ? "text-amber-400 border-amber-400/30" :
              "text-red-400 border-red-400/30"
            }`}>
              {riskData.overall_status?.replace("_", " ")}
            </span>
          </div>
          {riskData.recommended_actions?.slice(0, 3).map((a, i) => (
            <div key={i} className="flex items-start gap-1.5">
              <ArrowRight size={9} className="text-[hsl(var(--primary))] shrink-0 mt-0.5" />
              <p className="font-body text-[10px] text-[hsl(var(--foreground)/0.6)]">{a}</p>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

/* ── Main Page ── */
export default function Workflow() {
  useDocumentHead({
    title: "Workflow & Execution — Quantus V2+",
    description: "Phase 6: Precision workflow execution for UHNW deal orchestration.",
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

  useEffect(() => { if (dealId) loadData(dealId); }, [dealId]);

  async function loadData(id: string) {
    setLoading(true);
    const { data: d } = await supabase.from("deals").select("*").eq("id", id).single();
    if (d) setDeal(d as unknown as Deal);
    const { data: wfTasks } = await supabase.from("workflow_tasks").select("*").eq("deal_id", id).order("due_at", { ascending: true });
    if (wfTasks) setTasks(wfTasks as unknown as WorkflowTask[]);
    setLoading(false);
  }

  async function generateWorkflow() {
    if (!dealId || generating) return;
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("workflow-engine", { body: { action: "generate", deal_id: dealId } });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      setClientSummary(data.client_summary);
      toast.success(`Workflow created: ${data.tasks_created} tasks`);
      await loadData(dealId);
    } catch (e: any) { toast.error(e.message || "Failed to generate workflow"); }
    finally { setGenerating(false); }
  }

  async function handleUpdateStatus(taskId: string, status: string) {
    setUpdating(taskId);
    try {
      const { error } = await supabase.functions.invoke("workflow-engine", { body: { action: "update_task", task_id: taskId, status } });
      if (error) throw new Error(error.message);
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status, completed_at: status === "completed" ? new Date().toISOString() : t.completed_at } : t));
      toast.success(`Task ${status === "completed" ? "completed" : "updated"}`);
    } catch (e: any) { toast.error(e.message || "Update failed"); }
    finally { setUpdating(null); }
  }

  async function handleSendComm(taskId: string, type: string) {
    try {
      const { error } = await supabase.functions.invoke("workflow-engine", { body: { action: "send_communication", task_id: taskId, deal_id: dealId, message_type: type } });
      if (error) throw new Error(error.message);
      toast.success("Communication sent");
    } catch (e: any) { toast.error(e.message || "Send failed"); }
  }

  async function runRiskCheck() {
    if (!dealId || checkingRisk) return;
    setCheckingRisk(true);
    try {
      const { data, error } = await supabase.functions.invoke("workflow-engine", { body: { action: "risk_check", deal_id: dealId } });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      setRiskData(data as RiskAssessment);
      toast.success("Risk assessment complete");
    } catch (e: any) { toast.error(e.message || "Risk check failed"); }
    finally { setCheckingRisk(false); }
  }

  const phases = tasks.reduce<Record<string, WorkflowTask[]>>((acc, t) => {
    if (!acc[t.phase]) acc[t.phase] = [];
    acc[t.phase].push(t);
    return acc;
  }, {});
  const phaseOrder = Object.keys(phases);
  const completedCount = tasks.filter(t => t.status === "completed").length;
  const totalCount = tasks.length;
  const completionPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const allComplete = totalCount > 0 && completedCount === totalCount;

  return (
    <DealPhaseLayout currentPhase={6} dealId={dealId} phaseTitle="Workflow & Execution">
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="text-center py-20"><Loader2 size={24} className="animate-spin text-[hsl(var(--primary))] mx-auto" /></div>
        ) : !deal ? (
          <div className="text-center py-20">
            <p className="font-body text-sm text-[hsl(var(--muted-foreground))]">No deal selected. <Link to="/intake" className="text-[hsl(var(--primary))] hover:underline">Submit a request first</Link>.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
              <p className="font-body text-[10px] tracking-[0.3em] uppercase text-[hsl(var(--primary)/0.6)] mb-2">
                Phase 6 — Workflow & Execution
              </p>
              <h1 className="font-display text-3xl md:text-4xl text-[hsl(var(--foreground))] mb-2">
                Executing your workflow.
                <motion.div
                  className="h-px bg-gradient-to-r from-[hsl(var(--primary))] to-transparent mt-2"
                  initial={{ width: 0 }}
                  animate={{ width: "50%" }}
                  transition={{ duration: 1.2, delay: 0.3 }}
                />
              </h1>
              <p className="font-body text-sm text-[hsl(var(--primary)/0.7)]">
                Quantus V2+ is coordinating all vendors, documents, and timelines.
              </p>
            </motion.div>

            {/* Generate Button */}
            {tasks.length === 0 && !generating && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
                <div className="w-20 h-20 rounded-full border border-[hsl(var(--primary)/0.3)] flex items-center justify-center mx-auto mb-6">
                  <Zap size={28} className="text-[hsl(var(--primary))]" />
                </div>
                <h2 className="font-display text-xl text-[hsl(var(--foreground))] mb-2">Ready to Execute</h2>
                <p className="font-body text-xs text-[hsl(var(--muted-foreground))] mb-6 max-w-sm mx-auto">
                  Generate a comprehensive workflow blueprint with tasks, timelines, and risk monitoring.
                </p>
                <button onClick={generateWorkflow}
                  className="inline-flex items-center gap-2 px-10 py-3.5 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-xl font-body text-xs tracking-widest uppercase hover:opacity-90 transition-all shadow-[0_0_30px_hsl(var(--primary)/0.2)]">
                  <Zap size={14} /> Generate Workflow Blueprint
                </button>
              </motion.div>
            )}

            {/* Generating Animation */}
            <AnimatePresence>
              {generating && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-16">
                  <div className="w-20 h-20 rounded-full border-2 border-[hsl(var(--primary)/0.3)] flex items-center justify-center mx-auto mb-4">
                    <Loader2 size={28} className="animate-spin text-[hsl(var(--primary))]" />
                  </div>
                  <p className="font-display text-lg text-[hsl(var(--foreground))] mb-1">Generating Workflow Blueprint</p>
                  <p className="font-body text-xs text-[hsl(var(--muted-foreground))]">Creating tasks, scheduling, and risk monitoring…</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Client Summary */}
            {clientSummary && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="border border-[hsl(var(--primary)/0.2)] bg-[hsl(var(--primary)/0.03)] p-5 rounded-xl mb-8">
                <p className="font-body text-[10px] tracking-[0.2em] uppercase text-[hsl(var(--primary))] mb-2">Client Communication</p>
                <p className="font-body text-sm text-[hsl(var(--foreground)/0.8)] leading-relaxed italic">"{clientSummary}"</p>
              </motion.div>
            )}

            {/* Three-Column Grid */}
            {tasks.length > 0 && !generating && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-[260px_1fr_280px] gap-6">
                {/* Left — Timeline */}
                <div className="hidden lg:block">
                  <MilestoneTimeline tasks={tasks} />
                </div>

                {/* Center — Active Tasks */}
                <div className="space-y-4">
                  {/* Phase tabs */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    <button
                      onClick={() => setActivePhase(null)}
                      className={`px-3 py-1.5 rounded-lg font-body text-[10px] tracking-widest uppercase border transition-colors ${
                        !activePhase ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-[hsl(var(--primary))]" : "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                      }`}
                    >
                      All ({totalCount})
                    </button>
                    {phaseOrder.map(phase => {
                      const done = phases[phase].filter(t => t.status === "completed").length;
                      return (
                        <button key={phase} onClick={() => setActivePhase(phase)}
                          className={`px-3 py-1.5 rounded-lg font-body text-[10px] tracking-widest uppercase border transition-colors ${
                            activePhase === phase ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-[hsl(var(--primary))]" : "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                          }`}>
                          {phase.replace(/_/g, " ")} ({done}/{phases[phase].length})
                        </button>
                      );
                    })}
                  </div>

                  {/* Task Cards */}
                  <div className="space-y-3">
                    {(activePhase ? phases[activePhase] || [] : tasks).map((task, i) => (
                      <TaskCard key={task.id} task={task} onUpdateStatus={handleUpdateStatus} onSendComm={handleSendComm} updating={updating} index={i} />
                    ))}
                  </div>

                  {/* Finalize CTA */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="border-t border-[hsl(var(--border))] pt-8 mt-8"
                  >
                    <Link
                      to={`/documents?deal=${dealId}`}
                      className={`w-full flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-body text-xs tracking-widest uppercase transition-all ${
                        allComplete
                          ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-[0_0_40px_hsl(var(--primary)/0.3)] hover:opacity-90"
                          : "bg-[hsl(var(--primary)/0.3)] text-[hsl(var(--primary-foreground)/0.5)] cursor-default"
                      }`}
                    >
                      <FileText size={14} />
                      Proceed to Finalization
                      <ArrowRight size={14} />
                    </Link>
                    {!allComplete && (
                      <p className="text-center font-body text-[10px] text-[hsl(var(--muted-foreground))] mt-2">
                        Complete all tasks to proceed to Phase 7
                      </p>
                    )}
                  </motion.div>
                </div>

                {/* Right — Operational Panel */}
                <div className="hidden lg:block">
                  <OperationalPanel tasks={tasks} riskData={riskData} onRunRisk={runRiskCheck} checkingRisk={checkingRisk} />
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </DealPhaseLayout>
  );
}
