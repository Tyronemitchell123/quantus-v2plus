/**
 * QUANTUS CORE — Sovereign Orchestration API
 *
 * Central intelligence layer for module-to-module routing,
 * agent lifecycle management, and pipeline orchestration.
 */

import { supabase } from "@/integrations/supabase/client";
import type {
  CoreTask,
  CoreModuleName,
  CorePipelinePhase,
  ModuleMessage,
  HelixDNAProfile,
  ForgeSiteConfig,
} from "./quantus-types";

// ─── Task Router ──────────────────────────────────────────
const taskQueue: CoreTask[] = [];

export function enqueueTask(task: Omit<CoreTask, "id" | "createdAt" | "status">): CoreTask {
  const enriched: CoreTask = {
    ...task,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: "queued",
  };
  taskQueue.push(enriched);
  return enriched;
}

export function getQueuedTasks(): CoreTask[] {
  return taskQueue.filter((t) => t.status === "queued");
}

export function completeTask(taskId: string): void {
  const task = taskQueue.find((t) => t.id === taskId);
  if (task) task.status = "completed";
}

// ─── Module Message Bus ───────────────────────────────────
type MessageHandler = (msg: ModuleMessage) => void;
const handlers: Map<string, MessageHandler[]> = new Map();

export function subscribe(module: string, handler: MessageHandler): () => void {
  const existing = handlers.get(module) || [];
  existing.push(handler);
  handlers.set(module, existing);
  return () => {
    const idx = existing.indexOf(handler);
    if (idx >= 0) existing.splice(idx, 1);
  };
}

export function dispatch(msg: Omit<ModuleMessage, "id" | "timestamp">): ModuleMessage {
  const enriched: ModuleMessage = {
    ...msg,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };
  const targetHandlers = handlers.get(msg.to) || [];
  targetHandlers.forEach((h) => h(enriched));
  return enriched;
}

// ─── Pipeline Queries ─────────────────────────────────────
export async function getPipelineStats(): Promise<Record<CorePipelinePhase, number>> {
  const { data } = await supabase.from("deals").select("status");
  const counts: Record<string, number> = {};
  (data || []).forEach((d) => {
    counts[d.status] = (counts[d.status] || 0) + 1;
  });
  return counts as Record<CorePipelinePhase, number>;
}

export async function getModuleStats(): Promise<
  { name: CoreModuleName; active: number; total: number; status: "online" | "standby" }[]
> {
  const { data } = await supabase.from("deals").select("status, category");
  const modules: CoreModuleName[] = [
    "aviation", "medical", "hospitality", "lifestyle", "longevity",
    "marine", "finance", "legal", "logistics", "staffing", "partnerships",
  ];
  return modules.map((m) => {
    const moduleDeals = (data || []).filter((d) => d.category === m);
    const active = moduleDeals.filter(
      (d) => d.status !== "completed" && d.status !== "cancelled"
    ).length;
    return { name: m, active, total: moduleDeals.length, status: active > 0 ? "online" : "standby" };
  });
}

// ─── Helix Bridge ─────────────────────────────────────────
export function requestHelixDNA(profileId: string): ModuleMessage {
  return dispatch({
    from: "core",
    to: "helix",
    type: "query",
    payload: { action: "getDNAProfile", profileId },
  });
}

// ─── Forge Bridge ─────────────────────────────────────────
export function requestForgeGeneration(config: ForgeSiteConfig): ModuleMessage {
  return dispatch({
    from: "core",
    to: "forge",
    type: "task",
    payload: { action: "generateSite", config },
  });
}

// ─── Agent Registry ───────────────────────────────────────
export async function getAgentLogs(limit = 20) {
  const { data } = await supabase
    .from("agent_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data || [];
}

// ─── Audit Trail ──────────────────────────────────────────
export async function getRecentAuditEvents(limit = 50) {
  const { data } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data || [];
}
