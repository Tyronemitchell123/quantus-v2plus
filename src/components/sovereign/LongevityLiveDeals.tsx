import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { HeartPulse, Ghost, RefreshCcw, Eye, Zap, Terminal, Send, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

type LongevityDeal = {
  id: string;
  clinic_name: string;
  specialties: string[];
  avg_price_cents: number;
  city: string;
  country: string;
  is_active: boolean;
};

const statusConfig: Record<string, { color: string; icon: typeof Eye }> = {
  Perishing: { color: "text-rose-400 bg-rose-400/10", icon: Zap },
  Outreach_Sent: { color: "text-amber-400 bg-amber-400/10", icon: Send },
  Recovered: { color: "text-emerald-400 bg-emerald-400/10", icon: RefreshCcw },
  Ghosted: { color: "text-red-400 bg-red-400/10", icon: Ghost },
};

const LongevityLiveDeals = () => {
  const { user } = useAuth();
  const [autoPilot, setAutoPilot] = useState(false);
  const [providers, setProviders] = useState<LongevityDeal[]>([]);
  const [auditLogs, setAuditLogs] = useState<{ time: string; text: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [provRes, logsRes] = await Promise.all([
        supabase.from("longevity_providers").select("*").eq("is_active", true).order("created_at", { ascending: false }).limit(20),
        supabase.from("agent_logs").select("*").eq("agent_name", "longevity-scanner").order("created_at", { ascending: false }).limit(10),
      ]);
      if (provRes.data) setProviders(provRes.data);
      if (logsRes.data) {
        setAuditLogs(logsRes.data.map(l => ({
          time: new Date(l.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
          text: `${l.task_type} — ${l.status}${l.failure_reason ? ` (${l.failure_reason})` : ""}`,
        })));
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const totalValue = providers.reduce((s, p) => s + p.avg_price_cents, 0);
  const commission = Math.floor(totalValue * 0.10);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
        <Loader2 size={16} className="animate-spin" /> Loading longevity providers…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Auto-Pilot + Commission Ticker */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setAutoPilot(!autoPilot)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-body tracking-wider transition-all border ${
            autoPilot ? "border-rose-400/40 text-rose-400 bg-rose-400/10" : "border-border/50 text-muted-foreground"
          }`}
        >
          {autoPilot ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
          Auto-Recovery {autoPilot ? "ON" : "OFF"}
        </button>

        <motion.div
          animate={{ boxShadow: commission > 0 ? ["0 0 10px rgba(212,175,55,0)", "0 0 20px rgba(212,175,55,0.3)", "0 0 10px rgba(212,175,55,0)"] : "none" }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#D4AF37]/30 bg-[#D4AF37]/5"
        >
          <HeartPulse size={14} className="text-[#D4AF37]" />
          <span className="font-display text-sm font-semibold text-[#D4AF37]">
            ${(commission / 100).toLocaleString()} Access Fee
          </span>
        </motion.div>
      </div>

      {/* Provider Cards */}
      {providers.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <HeartPulse size={24} className="text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No active longevity providers. Add providers via the Longevity Scan panel.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {providers.map((provider, i) => (
            <motion.div
              key={provider.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="glass-card p-4 space-y-2"
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg text-rose-400 bg-rose-400/10">
                  <HeartPulse size={13} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-xs text-foreground truncate">{provider.clinic_name}</p>
                  <p className="font-body text-[10px] text-muted-foreground">
                    {provider.city}, {provider.country} • {provider.specialties.join(", ")}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-display text-sm font-medium text-foreground">
                    ${(provider.avg_price_cents / 100).toLocaleString()}
                  </p>
                  <span className="font-body text-[9px] uppercase tracking-wider text-emerald-400">Active</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Audit Terminal */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Terminal size={14} className="text-rose-400" />
          <span className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Longevity Audit Terminal</span>
        </div>
        <div className="bg-muted/20 rounded-lg p-3 space-y-1.5 max-h-40 overflow-y-auto font-mono text-[11px]">
          {auditLogs.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No audit events yet. Run a longevity scan to populate.</p>
          ) : (
            auditLogs.map((entry, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-rose-400 shrink-0">[{entry.time}]</span>
                <span className="text-foreground/70">{entry.text}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LongevityLiveDeals;
