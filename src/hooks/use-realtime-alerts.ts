import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export interface RealtimeAlert {
  id: string;
  title: string;
  description: string | null;
  severity: string;
  metric_name: string | null;
  metric_value: number | null;
  threshold: number | null;
  is_read: boolean;
  created_at: string;
  user_id: string;
}

export function useRealtimeAlerts() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<RealtimeAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAlert, setNewAlert] = useState<RealtimeAlert | null>(null);

  const fetchAlerts = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("anomaly_alerts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    setAlerts((data as RealtimeAlert[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("anomaly-alerts-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "anomaly_alerts",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const alert = payload.new as RealtimeAlert;
          setAlerts((prev) => [alert, ...prev]);
          setNewAlert(alert);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "anomaly_alerts",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const updated = payload.new as RealtimeAlert;
          setAlerts((prev) =>
            prev.map((a) => (a.id === updated.id ? updated : a))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAsRead = useCallback(async (id: string) => {
    await supabase.from("anomaly_alerts").update({ is_read: true }).eq("id", id);
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, is_read: true } : a)));
  }, []);

  const markAllRead = useCallback(async () => {
    const unreadIds = alerts.filter((a) => !a.is_read).map((a) => a.id);
    if (!unreadIds.length) return;
    await supabase.from("anomaly_alerts").update({ is_read: true }).in("id", unreadIds);
    setAlerts((prev) => prev.map((a) => ({ ...a, is_read: true })));
  }, [alerts]);

  const dismissNewAlert = useCallback(() => setNewAlert(null), []);

  const unreadCount = alerts.filter((a) => !a.is_read).length;

  return {
    alerts,
    loading,
    unreadCount,
    newAlert,
    dismissNewAlert,
    markAsRead,
    markAllRead,
    refresh: fetchAlerts,
  };
}
