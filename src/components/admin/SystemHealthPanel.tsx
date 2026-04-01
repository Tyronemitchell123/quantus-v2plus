import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Activity, AlertTriangle, CheckCircle, Eye, RefreshCcw, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

type HealthEvent = {
  id: string;
  function_name: string;
  event_type: string;
  source_url: string | null;
  fallback_used: string | null;
  success_rate: number | null;
  severity: string;
  resolved: boolean;
  metadata: Record<string, any>;
  created_at: string;
};

const severityStyles: Record<string, string> = {
  info: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  warning: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  critical: "bg-red-500/20 text-red-400 border-red-500/30",
};

const eventLabels: Record<string, string> = {
  access_denied: "403 Blocked",
  site_down: "Site Down",
  visual_llm_recovery: "Visual-LLM Recovery",
  source_rotation: "Source Rotation",
  scrape_exception: "Scrape Exception",
  partial_degradation: "Partial Degradation",
  total_failure: "Total Failure",
  selector_error: "Selector Error",
};

const SystemHealthPanel = () => {
  const [events, setEvents] = useState<HealthEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("system_health" as any)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(25);
    setEvents((data as any as HealthEvent[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchEvents(); }, []);

  const recentRate = events.find(e => e.success_rate !== null)?.success_rate ?? 100;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-bold text-foreground">Resilience Architect</h3>
          <span className={`ml-2 px-2 py-0.5 text-xs rounded font-semibold ${
            recentRate >= 90 ? "bg-emerald-500/20 text-emerald-400" :
            recentRate >= 50 ? "bg-amber-500/20 text-amber-400" :
            "bg-red-500/20 text-red-400"
          }`}>
            {recentRate}% Success Rate
          </span>
        </div>
        <Button size="sm" variant="ghost" onClick={fetchEvents} disabled={loading}>
          <RefreshCcw className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-lg bg-card/50 border border-border text-center">
          <Activity className="w-4 h-4 mx-auto text-blue-400 mb-1" />
          <p className="text-lg font-bold text-foreground">{events.filter(e => e.event_type === "visual_llm_recovery").length}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Visual-LLM Recoveries</p>
        </div>
        <div className="p-3 rounded-lg bg-card/50 border border-border text-center">
          <AlertTriangle className="w-4 h-4 mx-auto text-amber-400 mb-1" />
          <p className="text-lg font-bold text-foreground">{events.filter(e => e.severity === "warning" || e.severity === "critical").length}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Incidents</p>
        </div>
        <div className="p-3 rounded-lg bg-card/50 border border-border text-center">
          <CheckCircle className="w-4 h-4 mx-auto text-emerald-400 mb-1" />
          <p className="text-lg font-bold text-foreground">{events.filter(e => e.resolved).length}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Auto-Resolved</p>
        </div>
      </div>

      {/* Event Feed */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {events.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No health events recorded yet. All systems nominal.</p>
        )}
        {events.map(e => (
          <div key={e.id} className={`p-3 rounded-lg border ${severityStyles[e.severity] || severityStyles.info}`}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase">{eventLabels[e.event_type] || e.event_type}</span>
                {e.resolved && <CheckCircle className="w-3 h-3 text-emerald-400" />}
              </div>
              <span className="text-[10px] opacity-70">{new Date(e.created_at).toLocaleString()}</span>
            </div>
            <p className="text-xs opacity-80">{e.function_name}</p>
            {e.source_url && <p className="text-[10px] opacity-60 truncate">{e.source_url}</p>}
            {e.fallback_used && <p className="text-[10px] mt-1">Fallback: <span className="font-semibold">{e.fallback_used}</span></p>}
            {e.success_rate !== null && <p className="text-[10px] mt-1">Success rate: <span className="font-semibold">{e.success_rate}%</span></p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SystemHealthPanel;
