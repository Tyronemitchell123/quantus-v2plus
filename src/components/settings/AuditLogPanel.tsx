import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Clock, Filter, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AuditLog {
  id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

const ACTION_COLORS: Record<string, string> = {
  login: "bg-emerald/20 text-emerald border-emerald/30",
  signup: "bg-quantum-cyan/20 text-quantum-cyan border-quantum-cyan/30",
  logout: "bg-muted text-muted-foreground",
  "quantum_job.submit": "bg-quantum-purple/20 text-quantum-purple border-quantum-purple/30",
  "settings.update": "bg-primary/20 text-primary border-primary/30",
  "api_key.create": "bg-accent/20 text-accent border-accent/30",
  "api_key.delete": "bg-destructive/20 text-destructive border-destructive/30",
  "webhook.create": "bg-accent/20 text-accent border-accent/30",
  "payment.create": "bg-gold/20 text-gold border-gold/30",
};

export default function AuditLogPanel() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  const fetchLogs = async () => {
    if (!user) return;
    setLoading(true);
    let query = supabase
      .from("audit_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (filter !== "all") {
      query = query.eq("resource_type", filter);
    }

    const { data } = await query;
    setLogs((data as AuditLog[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, [user, filter, page]);

  const resourceTypes = ["all", "auth", "quantum_job", "api_key", "webhook", "payment", "settings"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Shield size={18} className="text-quantum-cyan" />
            Audit Log
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Track all actions on your account</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-muted-foreground" />
          <Select value={filter} onValueChange={(v) => { setFilter(v); setPage(0); }}>
            <SelectTrigger className="w-[140px] h-8 text-xs bg-secondary/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {resourceTypes.map((t) => (
                <SelectItem key={t} value={t} className="text-xs">
                  {t === "all" ? "All Events" : t.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground text-sm">Loading…</div>
      ) : logs.length === 0 ? (
        <div className="py-12 text-center">
          <Clock size={32} className="mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">No audit events yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Actions will be logged as you use the platform</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {logs.map((log, i) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
              className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border hover:border-border/80 transition-colors"
            >
              <Badge className={`text-[10px] shrink-0 ${ACTION_COLORS[log.action] || "bg-secondary text-muted-foreground"}`}>
                {log.action}
              </Badge>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground truncate">
                  {log.resource_type}
                  {log.resource_id && <span className="text-muted-foreground ml-1 font-mono">#{log.resource_id.slice(0, 8)}</span>}
                </p>
                {log.metadata && Object.keys(log.metadata).length > 0 && (
                  <p className="text-[10px] text-muted-foreground truncate">
                    {Object.entries(log.metadata).map(([k, v]) => `${k}: ${v}`).join(", ")}
                  </p>
                )}
              </div>
              <time className="text-[10px] text-muted-foreground tabular-nums shrink-0">
                {new Date(log.created_at).toLocaleString()}
              </time>
            </motion.div>
          ))}
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
          Previous
        </Button>
        <Button variant="outline" size="sm" disabled={logs.length < PAGE_SIZE} onClick={() => setPage(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
