import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plane, Stethoscope, Hotel, HeartPulse, TrendingDown, Globe, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

type PillarData = {
  label: string;
  icon: typeof Plane;
  color: string;
  recovered: number;
  commission: number;
  leadsActive: number;
};

const SovereignMasterView = () => {
  const { user } = useAuth();
  const [totalCommissions, setTotalCommissions] = useState(0);
  const [leakTicker, setLeakTicker] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("commissions")
        .select("quantus_cut")
        .eq("user_id", user.id);
      const total = (data || []).reduce((s, c) => s + Number(c.quantus_cut || 0), 0);
      setTotalCommissions(total);
    };
    fetch();
  }, [user]);

  // Simulated global revenue leak ticker
  useEffect(() => {
    const base = 2_400_000;
    const update = () => setLeakTicker(base + Math.floor(Math.random() * 600000));
    update();
    const iv = setInterval(update, 10000);
    return () => clearInterval(iv);
  }, []);

  const pillars: PillarData[] = [
    { label: "Aviation", icon: Plane, color: "text-blue-400", recovered: 245000, commission: 24500, leadsActive: 12 },
    { label: "Medical", icon: Stethoscope, color: "text-emerald-400", recovered: 187000, commission: 18700, leadsActive: 8 },
    { label: "Hospitality", icon: Hotel, color: "text-amber-400", recovered: 132000, commission: 6600, leadsActive: 15 },
    { label: "Longevity", icon: HeartPulse, color: "text-rose-400", recovered: 96000, commission: 9600, leadsActive: 5 },
  ];

  const totalRecovered = pillars.reduce((s, p) => s + p.recovered, 0);
  const totalComm = totalCommissions || pillars.reduce((s, p) => s + p.commission, 0);
  const totalLeads = pillars.reduce((s, p) => s + p.leadsActive, 0);

  const fmt = (n: number) => `$${n.toLocaleString("en-US")}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Globe size={16} className="text-primary" />
        <h2 className="font-display text-sm font-semibold text-foreground">Sovereign Master View</h2>
        <span className="font-body text-[10px] text-muted-foreground ml-auto">Cross-Pillar Revenue Intelligence</span>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Recovered", value: fmt(totalRecovered), accent: "text-emerald-400" },
          { label: "Quantus Revenue", value: fmt(totalComm), accent: "text-[#D4AF37]" },
          { label: "Active Leads", value: String(totalLeads), accent: "text-blue-400" },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card p-4 text-center"
          >
            <p className="font-body text-[9px] tracking-[0.2em] uppercase text-muted-foreground">{item.label}</p>
            <p className={`font-display text-xl font-semibold ${item.accent} mt-1`}>{item.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Pillar Breakdown */}
      <div className="grid sm:grid-cols-2 gap-3">
        {pillars.map((pillar, i) => {
          const Icon = pillar.icon;
          const pct = totalRecovered > 0 ? Math.round((pillar.recovered / totalRecovered) * 100) : 25;
          return (
            <motion.div
              key={pillar.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.06 }}
              className="glass-card p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <Icon size={14} className={pillar.color} />
                <span className="font-body text-xs font-medium text-foreground">{pillar.label}</span>
                <span className="ml-auto font-body text-[10px] text-muted-foreground">{pct}% of total</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-body text-[9px] tracking-wider uppercase text-muted-foreground">Recovered</p>
                  <p className="font-display text-sm font-medium text-foreground">{fmt(pillar.recovered)}</p>
                </div>
                <div className="text-right">
                  <p className="font-body text-[9px] tracking-wider uppercase text-muted-foreground">Commission</p>
                  <p className="font-display text-sm font-medium text-[#D4AF37]">{fmt(pillar.commission)}</p>
                </div>
              </div>
              {/* Bar */}
              <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.6 }}
                  className={`h-full rounded-full ${
                    pillar.label === "Aviation" ? "bg-blue-400" :
                    pillar.label === "Medical" ? "bg-emerald-400" :
                    pillar.label === "Hospitality" ? "bg-amber-400" : "bg-rose-400"
                  }`}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 2026 Global Revenue Leak Ticker */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="glass-card p-3 flex items-center justify-between border-destructive/20 bg-destructive/5"
      >
        <div className="flex items-center gap-2">
          <TrendingDown size={14} className="text-red-400" />
          <span className="font-body text-[10px] tracking-[0.15em] uppercase text-red-400">2026 Global Revenue Leak</span>
        </div>
        <motion.span
          key={leakTicker}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-sm font-semibold text-red-400"
        >
          {fmt(leakTicker)}
        </motion.span>
        <span className="font-body text-[9px] text-muted-foreground">estimated unrecovered across all verticals</span>
      </motion.div>
    </div>
  );
};

export default SovereignMasterView;
