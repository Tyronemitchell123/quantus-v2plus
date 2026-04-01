import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import useDocumentHead from "@/hooks/use-document-head";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import MobileBottomNav from "@/components/mobile/MobileBottomNav";
import ParticleGrid from "@/components/ParticleGrid";
import {
  Plane, Stethoscope, Gem, Hotel, HeartPulse, Activity, TrendingUp, TrendingDown,
  AlertTriangle, Eye, Ghost, RefreshCcw, ArrowUpRight, Zap, Brain,
} from "lucide-react";
import MedicalScanPanel from "@/components/sovereign/MedicalScanPanel";
import AviationScanPanel from "@/components/sovereign/AviationScanPanel";
import HospitalityScanPanel from "@/components/sovereign/HospitalityScanPanel";
import LongevityScanPanel from "@/components/sovereign/LongevityScanPanel";
import LongevityBridgePanel from "@/components/sovereign/LongevityBridgePanel";
import SovereignMasterView from "@/components/sovereign/SovereignMasterView";
import GenevaPowerPlay from "@/components/sovereign/GenevaPowerPlay";
import PacificSovereign from "@/components/sovereign/PacificSovereign";
import VanguardDashboard from "@/components/sovereign/VanguardDashboard";

type Sector = "Aviation" | "Medical" | "Lifestyle" | "Hospitality" | "Longevity" | "Vanguard";

const sectorConfig: Record<Sector, { icon: typeof Plane; color: string; kpiLabel: string; leakLabel: string }> = {
  Aviation: { icon: Plane, color: "text-blue-400", kpiLabel: "Empty Legs Detected", leakLabel: "Charter Revenue Leaking" },
  Medical: { icon: Stethoscope, color: "text-emerald-400", kpiLabel: "No-Shows Tracked", leakLabel: "Appointment Revenue Lost" },
  Lifestyle: { icon: Gem, color: "text-purple-400", kpiLabel: "Luxury Leads Active", leakLabel: "Luxury Spend Unrecovered" },
  Hospitality: { icon: Hotel, color: "text-amber-400", kpiLabel: "Vacancy Alerts", leakLabel: "Room Revenue Leaking" },
  Longevity: { icon: HeartPulse, color: "text-rose-400", kpiLabel: "Diagnostic Slots", leakLabel: "Health Revenue Leaking" },
  Vanguard: { icon: Brain, color: "text-violet-400", kpiLabel: "Bio-Recovery Triggers", leakLabel: "Burnout Revenue Lost" },
};

const sectors: Sector[] = ["Aviation", "Medical", "Lifestyle", "Hospitality", "Longevity", "Vanguard"];

// Simulated live leak data
const generateLeakData = () => ({
  totalLeaking: Math.floor(Math.random() * 500000) + 1200000,
  recoveredToday: Math.floor(Math.random() * 80000) + 15000,
});

// Simulated monitoring feed
const generateFeedItems = (sector: Sector) => {
  const items: Record<Sector, Array<{ status: string; text: string; value: number }>> = {
    Aviation: [
      { status: "Monitoring", text: "NetJets G650 Empty Leg — London → Dubai", value: 42000 },
      { status: "Recovered", text: "VistaJet Citation X — Recovered via outreach", value: 18500 },
      { status: "Ghosted", text: "GlobeAir Phenom 300 — No vendor response (48h)", value: 27000 },
      { status: "Monitoring", text: "Air Charter Service — Mediterranean rotation gap", value: 65000 },
      { status: "Recovered", text: "Luxaviation Falcon 7X — Commission secured", value: 31000 },
    ],
    Medical: [
      { status: "Monitoring", text: "Henry Schein — Bulk dental supply RFQ", value: 12000 },
      { status: "Ghosted", text: "Medline — PPE contract stalled (72h)", value: 45000 },
      { status: "Recovered", text: "Cardinal Health — Surgical kit re-engaged", value: 23000 },
      { status: "Monitoring", text: "Life Line Screening — Regional partnership lead", value: 8500 },
      { status: "Recovered", text: "Hologic — Diagnostics renewal captured", value: 56000 },
    ],
    Lifestyle: [
      { status: "Monitoring", text: "Net-a-Porter — Affiliate programme integration", value: 15000 },
      { status: "Recovered", text: "Marriott Bonvoy — Luxury travel package deal", value: 22000 },
      { status: "Ghosted", text: "Saks Fifth Avenue — Partnership proposal pending", value: 35000 },
      { status: "Monitoring", text: "Hugo Boss — Corporate gifting programme", value: 18000 },
      { status: "Recovered", text: "Cult Beauty — Influencer collaboration revenue", value: 9500 },
    ],
    Hospitality: [
      { status: "Monitoring", text: "Hyatt — Last-minute suite vacancy alerts", value: 28000 },
      { status: "Recovered", text: "Virgin Holidays — Peak season deal recovery", value: 41000 },
      { status: "Ghosted", text: "Marriott Intl — Conference block unfilled (5d)", value: 62000 },
      { status: "Monitoring", text: "Wayfair — Hospitality furniture bulk lead", value: 19000 },
      { status: "Recovered", text: "Currys — Smart room tech installation deal", value: 14500 },
    ],
    Longevity: [
      { status: "Monitoring", text: "Prenuvo London — Full-Body MRI cancellation slot", value: 8500 },
      { status: "Recovered", text: "Fountain Life — Executive Cardiac Panel rebooked", value: 12000 },
      { status: "Ghosted", text: "Longevity Clinic Harley St — DEXA no-show (24h)", value: 5200 },
      { status: "Monitoring", text: "Prenuvo NYC — Cancer Screening slot opening", value: 18500 },
      { status: "Recovered", text: "Clinique La Prairie — Anti-Aging programme secured", value: 15000 },
    ],
    Vanguard: [
      { status: "Monitoring", text: "Mr. Sterling — Recovery 35/100, Stress 9/10 (3-day trend)", value: 42000 },
      { status: "Recovered", text: "Bio-Reset itinerary confirmed — FAB → NRT + Tokyo Brain Hub", value: 54000 },
      { status: "Ghosted", text: "Ms. Ashworth — Burnout alert sent, no response (12h)", value: 38000 },
      { status: "Monitoring", text: "Mr. Chen — Wearable sync active, recovery trending down", value: 28000 },
      { status: "Recovered", text: "Cellular Revive at Samitivej — booked via Sovereign Push", value: 9500 },
    ],
  };
  return items[sector];
};

const statusIcons: Record<string, typeof Eye> = {
  Monitoring: Eye,
  Ghosted: Ghost,
  Recovered: RefreshCcw,
};

const statusColors: Record<string, string> = {
  Monitoring: "text-blue-400 bg-blue-400/10",
  Ghosted: "text-red-400 bg-red-400/10",
  Recovered: "text-emerald-400 bg-emerald-400/10",
};

const SovereignDashboard = () => {
  useDocumentHead({ title: "Sovereign Command Center — Quantus V2+", description: "High-ticket commission intelligence across global sectors." });

  const { user } = useAuth();
  const [activeSector, setActiveSector] = useState<Sector>("Aviation");
  const [leakData, setLeakData] = useState(generateLeakData());
  const [leadCounts, setLeadCounts] = useState({ monitoring: 0, ghosted: 0, recovered: 0 });
  const [totalCommissions, setTotalCommissions] = useState(0);

  // Refresh leak ticker every 8s
  useEffect(() => {
    const interval = setInterval(() => setLeakData(generateLeakData()), 8000);
    return () => clearInterval(interval);
  }, []);

  // Fetch real data from DB
  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [leadsRes, commissionsRes] = await Promise.all([
        supabase.from("leads").select("status").eq("user_id", user.id),
        supabase.from("commissions").select("quantus_cut").eq("user_id", user.id),
      ]);
      const leads = leadsRes.data || [];
      setLeadCounts({
        monitoring: leads.filter((l) => l.status === "Monitoring").length,
        ghosted: leads.filter((l) => l.status === "Ghosted").length,
        recovered: leads.filter((l) => l.status === "Recovered").length,
      });
      const comms = commissionsRes.data || [];
      setTotalCommissions(comms.reduce((s, c) => s + Number(c.quantus_cut || 0), 0));
    };
    fetchData();
  }, [user]);

  const config = sectorConfig[activeSector];
  const SectorIcon = config.icon;
  const feedItems = generateFeedItems(activeSector);

  const formatCurrency = (v: number) => `£${v.toLocaleString("en-GB")}`;

  return (
    <div className="min-h-screen bg-background flex relative">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none opacity-10 z-0"><ParticleGrid /></div>
      <div className="fixed inset-0 pointer-events-none z-0" style={{ background: "radial-gradient(ellipse at center, transparent 60%, hsl(var(--background)) 100%)" }} />

      <DashboardSidebar />

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <DashboardTopBar onMobileMenuToggle={() => {}} notifications={[]} />

        {/* Live Leak Ticker */}
        <div className="border-b border-border/50 bg-destructive/5">
          <div className="flex items-center justify-between px-4 md:px-8 py-2.5 overflow-x-auto">
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
                <span className="font-body text-[10px] tracking-[0.2em] uppercase text-red-400">Live Leak</span>
              </div>
              <div className="flex items-center gap-1.5">
                <TrendingDown size={13} className="text-red-400" />
                <span className="font-display text-sm font-semibold text-red-400">{formatCurrency(leakData.totalLeaking)}</span>
                <span className="font-body text-[10px] text-muted-foreground">market revenue leaking</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <TrendingUp size={13} className="text-emerald-400" />
              <span className="font-display text-sm font-semibold text-emerald-400">{formatCurrency(leakData.recoveredToday)}</span>
              <span className="font-body text-[10px] text-muted-foreground">recovered today</span>
            </div>
          </div>
        </div>

        {/* Sector Switcher */}
        <div className="flex items-center gap-2 px-4 md:px-8 py-4 border-b border-border/50 overflow-x-auto">
          <span className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground shrink-0 mr-2">Sector</span>
          {sectors.map((s) => {
            const sc = sectorConfig[s];
            const Icon = sc.icon;
            const active = s === activeSector;
            return (
              <button
                key={s}
                onClick={() => setActiveSector(s)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-body tracking-wider transition-all duration-300 shrink-0 ${
                  active
                    ? "bg-primary/10 text-primary border border-primary/30"
                    : "text-muted-foreground hover:text-foreground border border-border/50 hover:border-border"
                }`}
              >
                <Icon size={14} />
                {s}
              </button>
            );
          })}
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pb-24 lg:pb-8 space-y-6">
          {/* KPI Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: config.kpiLabel, value: String(leadCounts.monitoring + leadCounts.ghosted + leadCounts.recovered || feedItems.length), icon: SectorIcon, accent: config.color },
              { label: "Actively Monitoring", value: String(leadCounts.monitoring || feedItems.filter(f => f.status === "Monitoring").length), icon: Eye, accent: "text-blue-400" },
              { label: "Ghosted / At Risk", value: String(leadCounts.ghosted || feedItems.filter(f => f.status === "Ghosted").length), icon: AlertTriangle, accent: "text-red-400" },
              { label: "Recovered Revenue", value: formatCurrency(totalCommissions || feedItems.filter(f => f.status === "Recovered").reduce((s, f) => s + f.value, 0)), icon: Zap, accent: "text-emerald-400" },
            ].map((kpi, i) => (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="glass-card p-4 md:p-5"
              >
                <div className="flex items-center gap-2 mb-2">
                  <kpi.icon size={14} className={kpi.accent} />
                  <span className="font-body text-[9px] tracking-[0.2em] uppercase text-muted-foreground">{kpi.label}</span>
                </div>
                <p className="font-display text-xl md:text-2xl font-semibold text-foreground">{kpi.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Sector Scan Panels */}
          {activeSector === "Aviation" && <AviationScanPanel />}
          {activeSector === "Medical" && <MedicalScanPanel />}
          {activeSector === "Hospitality" && <HospitalityScanPanel />}
          {activeSector === "Longevity" && <LongevityScanPanel />}
          {activeSector === "Longevity" && <LongevityBridgePanel />}
          {activeSector === "Longevity" && <GenevaPowerPlay />}
          {activeSector === "Longevity" && <PacificSovereign />}
          {activeSector === "Vanguard" && <VanguardDashboard />}

          {/* Sovereign Master View — Cross-Pillar Analytics */}
          <SovereignMasterView />

          {/* Monitoring Feed */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-sm font-semibold text-foreground">
                {activeSector} — Live Monitoring Feed
              </h2>
              <span className="font-body text-[10px] text-muted-foreground">Simulated • Connect APIs for live data</span>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSector}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-2"
              >
                {feedItems.map((item, i) => {
                  const StatusIcon = statusIcons[item.status];
                  const colorClass = statusColors[item.status];
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="glass-card p-4 flex items-center gap-4 group hover:border-primary/20 transition-colors"
                    >
                      <div className={`p-2 rounded-lg ${colorClass}`}>
                        <StatusIcon size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-xs text-foreground truncate">{item.text}</p>
                        <p className="font-body text-[10px] text-muted-foreground mt-0.5">
                          Status: <span className={colorClass.split(" ")[0]}>{item.status}</span>
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-display text-sm font-medium text-foreground">{formatCurrency(item.value)}</p>
                        <p className="font-body text-[9px] text-muted-foreground">potential</p>
                      </div>
                      <ArrowUpRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Commission Accrual Summary */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity size={14} className="text-primary" />
                <span className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Commission Accrual (10% Cut)</span>
              </div>
              <a href="/sovereign/vault" className="font-body text-[10px] text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
                View Vault <ArrowUpRight size={10} />
              </a>
            </div>
            <p className="font-display text-2xl font-semibold text-foreground">
              {totalCommissions > 0
                ? formatCurrency(totalCommissions)
                : formatCurrency(feedItems.filter(f => f.status === "Recovered").reduce((s, f) => s + Math.floor(f.value * 0.1), 0))
              }
            </p>
            <p className="font-body text-[10px] text-muted-foreground mt-1">
              {totalCommissions > 0 ? "From live commission records" : "Projected from simulated recoveries"}
            </p>
          </div>
        </main>

        <footer className="hidden lg:flex px-6 py-3 border-t border-border/50 items-center justify-between">
          <p className="font-body text-[9px] tracking-[0.2em] uppercase text-muted-foreground/40">Quantus V2+ — Sovereign Command Center</p>
          <p className="font-body text-[9px] text-muted-foreground/30">Phase 1</p>
        </footer>
      </div>

      <MobileBottomNav onAIOpen={() => {}} onMessagingOpen={() => {}} onTabChange={() => {}} activeTab="feed" />
    </div>
  );
};

export default SovereignDashboard;
