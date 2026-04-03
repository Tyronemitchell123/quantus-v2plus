import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plane, Stethoscope, Hotel, HeartPulse, TrendingDown, Globe, Activity, Target, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

type PillarData = {
  label: string;
  icon: typeof Plane;
  color: string;
  recovered: number;
  commission: number;
  leadsActive: number;
  crossSellRevenue?: number;
};

const PILLAR_CONFIG = [
  { label: "Aviation", category: "aviation", icon: Plane, color: "text-blue-400", barColor: "bg-blue-400" },
  { label: "Medical", category: "medical", icon: Stethoscope, color: "text-emerald-400", barColor: "bg-emerald-400" },
  { label: "Hospitality", category: "hospitality", icon: Hotel, color: "text-amber-400", barColor: "bg-amber-400" },
  { label: "Longevity", category: "lifestyle", icon: HeartPulse, color: "text-rose-400", barColor: "bg-rose-400" },
];

const SovereignMasterView = () => {
  const { user } = useAuth();
  const [pillars, setPillars] = useState<PillarData[]>([]);
  const [totalCommissions, setTotalCommissions] = useState(0);
  const [leakTicker, setLeakTicker] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      // Fetch deals by category
      const { data: deals } = await supabase
        .from("deals")
        .select("category, status, deal_value_estimate")
        .eq("user_id", user.id);

      // Fetch commissions from commission_logs (canonical source)
      const { data: commissions } = await supabase
        .from("commission_logs")
        .select("commission_cents")
        .eq("user_id", user.id);

      const totalComm = (commissions || []).reduce((s, c) => s + Number(c.commission_cents || 0), 0) / 100;
      setTotalCommissions(totalComm);

      // Build pillar data from live deals
      const builtPillars: PillarData[] = PILLAR_CONFIG.map(cfg => {
        const catDeals = (deals || []).filter(d => d.category === cfg.category);
        const active = catDeals.filter(d => d.status !== "completed" && d.status !== "cancelled");
        const completed = catDeals.filter(d => d.status === "completed");
        const recovered = completed.reduce((s, d) => s + Number(d.deal_value_estimate || 0), 0);
        const commission = Math.round(recovered * 0.1); // 10% commission estimate
        return {
          label: cfg.label,
          icon: cfg.icon,
          color: cfg.color,
          recovered,
          commission,
          leadsActive: active.length,
          crossSellRevenue: 0,
        };
      });

      setPillars(builtPillars);
    };
    fetchData();
  }, [user]);

  // Simulated global revenue leak ticker
  useEffect(() => {
    const base = 2_400_000;
    const update = () => setLeakTicker(base + Math.floor(Math.random() * 600000));
    update();
    const iv = setInterval(update, 10000);
    return () => clearInterval(iv);
  }, []);

  const totalRecovered = pillars.reduce((s, p) => s + p.recovered, 0);
  const totalComm = totalCommissions || pillars.reduce((s, p) => s + p.commission, 0);
  const totalLeads = pillars.reduce((s, p) => s + p.leadsActive, 0);
  const totalCrossSell = pillars.reduce((s, p) => s + (p.crossSellRevenue || 0), 0);

  // Weekly throughput target: $65,000/week across 30 pilot seats
  const weeklyTarget = 65000;
  const currentWeeklyRun = Math.round(totalComm * 1.2); // projected
  const throughputPct = Math.min(100, Math.round((currentWeeklyRun / weeklyTarget) * 100));

  const fmt = (n: number) => `$${n.toLocaleString("en-US")}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Globe size={16} className="text-primary" />
        <h2 className="font-display text-sm font-semibold text-foreground">Sovereign Master View</h2>
        <span className="font-body text-[10px] text-muted-foreground ml-auto">Cross-Pillar Revenue Intelligence</span>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total Recovered", value: fmt(totalRecovered), accent: "text-emerald-400" },
          { label: "Quantus Revenue", value: fmt(totalComm), accent: "text-primary" },
          { label: "Cross-Sell Revenue", value: fmt(totalCrossSell), accent: "text-rose-400" },
          { label: "Active Leads", value: String(totalLeads), accent: "text-blue-400" },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card p-3 text-center"
          >
            <p className="font-body text-[9px] tracking-[0.2em] uppercase text-muted-foreground">{item.label}</p>
            <p className={`font-display text-lg font-semibold ${item.accent} mt-1`}>{item.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Weekly Throughput Gauge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-4"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Target size={14} className="text-primary" />
            <span className="font-body text-[10px] tracking-[0.15em] uppercase text-muted-foreground">Weekly Throughput — 30 Pilot Seats</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-display text-sm font-semibold text-foreground">{fmt(currentWeeklyRun)}</span>
            <span className="font-body text-[10px] text-muted-foreground">/ {fmt(weeklyTarget)} target</span>
          </div>
        </div>
        <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${throughputPct}%` }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="h-full rounded-full bg-gradient-to-r from-primary/80 to-rose-400/80"
          />
        </div>
        <p className="font-body text-[9px] text-muted-foreground mt-1.5 text-right">{throughputPct}% of target</p>
      </motion.div>

      {/* Cross-Sell Bridge Highlight */}
      {totalCrossSell > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-4 border-primary/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <Plane size={12} className="text-blue-400" />
            <ArrowRight size={10} className="text-muted-foreground" />
            <HeartPulse size={12} className="text-rose-400" />
            <span className="font-body text-[10px] tracking-[0.15em] uppercase text-primary ml-1">Sovereign Bridge Revenue</span>
          </div>
          <p className="font-body text-xs text-muted-foreground">
            Aviation → Longevity cross-sells generating {fmt(totalCrossSell)} in dual-commission revenue.
            Each bridge interaction yields an avg. $5,650 (Aviation Fee + Medical Access Fee).
          </p>
        </motion.div>
      )}

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
              transition={{ delay: 0.4 + i * 0.06 }}
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
                  <p className="font-display text-sm font-medium text-primary">{fmt(pillar.commission)}</p>
                </div>
              </div>
              {pillar.crossSellRevenue && pillar.crossSellRevenue > 0 ? (
                <div className="flex items-center gap-1 mb-2">
                  <ArrowRight size={9} className="text-rose-400" />
                  <span className="font-body text-[9px] text-rose-400">+{fmt(pillar.crossSellRevenue)} bridge revenue</span>
                </div>
              ) : null}
              {/* Bar */}
              <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ delay: 0.6 + i * 0.1, duration: 0.6 }}
                  className={`h-full rounded-full ${
                    PILLAR_CONFIG.find(c => c.label === pillar.label)?.barColor || "bg-primary"
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
        transition={{ delay: 0.8 }}
        className="glass-card p-3 flex items-center justify-between border-destructive/20 bg-destructive/5"
      >
        <div className="flex items-center gap-2">
          <TrendingDown size={14} className="text-destructive" />
          <span className="font-body text-[10px] tracking-[0.15em] uppercase text-destructive">2026 Global Revenue Leak</span>
        </div>
        <motion.span
          key={leakTicker}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-sm font-semibold text-destructive"
        >
          {fmt(leakTicker)}
        </motion.span>
        <span className="font-body text-[9px] text-muted-foreground">estimated unrecovered across all verticals</span>
      </motion.div>
    </div>
  );
};

export default SovereignMasterView;
