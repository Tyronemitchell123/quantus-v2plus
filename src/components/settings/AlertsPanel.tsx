import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, AlertTriangle, Info, Shield, Check, Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface Alert {
  id: string;
  title: string;
  description: string | null;
  severity: string;
  metric_name: string | null;
  metric_value: number | null;
  threshold: number | null;
  is_read: boolean;
  created_at: string;
}

const severityConfig: Record<string, { icon: any; color: string; bg: string }> = {
  critical: { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
  warning: { icon: Bell, color: "text-primary", bg: "bg-primary/10" },
  info: { icon: Info, color: "text-neon-blue", bg: "bg-neon-blue/10" },
};

const AlertsPanel = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [detecting, setDetecting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchAlerts = async () => {
    const { data, error } = await supabase
      .from("anomaly_alerts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      toast({ title: "Error loading alerts", description: error.message, variant: "destructive" });
    } else {
      setAlerts((data as Alert[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const markAsRead = async (id: string) => {
    await supabase.from("anomaly_alerts").update({ is_read: true }).eq("id", id);
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, is_read: true } : a)));
  };

  const markAllRead = async () => {
    const unreadIds = alerts.filter((a) => !a.is_read).map((a) => a.id);
    if (!unreadIds.length) return;
    await supabase.from("anomaly_alerts").update({ is_read: true }).in("id", unreadIds);
    setAlerts((prev) => prev.map((a) => ({ ...a, is_read: true })));
    toast({ title: "All alerts marked as read" });
  };

  const runDetection = async () => {
    if (!user) return;
    setDetecting(true);
    try {
      const { data, error } = await supabase.functions.invoke("anomaly-detection", {
        body: { user_id: user.id },
      });
      if (error) throw error;
      toast({
        title: "Detection complete",
        description: `${data.alerts_created} new alert${data.alerts_created !== 1 ? "s" : ""} created.`,
      });
      await fetchAlerts();
    } catch (err: any) {
      toast({ title: "Detection failed", description: err.message, variant: "destructive" });
    } finally {
      setDetecting(false);
    }
  };

  const unreadCount = alerts.filter((a) => !a.is_read).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold text-foreground">Anomaly Alerts</h3>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? "s" : ""}` : "All alerts read"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={runDetection}
            disabled={detecting}
            className="flex items-center gap-1.5 text-xs text-primary hover:underline font-medium disabled:opacity-50"
          >
            {detecting ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
            Run Detection
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-primary hover:underline font-medium"
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="text-primary animate-spin" size={24} />
        </div>
      ) : alerts.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center">
          <Shield size={32} className="text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No anomaly alerts yet. Alerts will appear here when unusual patterns are detected in your data.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {alerts.map((alert) => {
              const config = severityConfig[alert.severity] || severityConfig.info;
              const Icon = config.icon;
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`glass-card rounded-xl p-4 ${!alert.is_read ? "ring-1 ring-primary/20" : "opacity-75"}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center shrink-0`}>
                      <Icon size={16} className={config.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-foreground">{alert.title}</span>
                        <span className={`text-[10px] font-semibold uppercase tracking-wider ${config.color}`}>
                          {alert.severity}
                        </span>
                      </div>
                      {alert.description && (
                        <p className="text-xs text-muted-foreground mb-2">{alert.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                        <span>{new Date(alert.created_at).toLocaleString()}</span>
                        {alert.metric_name && (
                          <span>{alert.metric_name}: {alert.metric_value}</span>
                        )}
                      </div>
                    </div>
                    {!alert.is_read && (
                      <button
                        onClick={() => markAsRead(alert.id)}
                        className="text-xs text-primary hover:underline shrink-0"
                      >
                        <Check size={14} />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default AlertsPanel;
