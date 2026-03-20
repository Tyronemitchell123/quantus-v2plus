import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Users, DollarSign, Activity, Brain, AlertTriangle, Zap, RefreshCw, Sparkles, Shield, Bell, CreditCard } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart } from "recharts";
import { useAIAnalytics } from "@/hooks/use-ai-analytics";
import AIFallbackBanner from "@/components/AIFallbackBanner";
import UsageLimitBanner from "@/components/UsageLimitBanner";
import TrialCountdownBanner from "@/components/TrialCountdownBanner";
import { useUsageTracking } from "@/hooks/use-usage-tracking";
import { useRealtimeAlerts } from "@/hooks/use-realtime-alerts";
import RealtimeAlertToast from "@/components/RealtimeAlertToast";

type DashboardData = {
  metrics: { id: string; label: string; value: string; change: string; trend: string; icon: string }[];
  revenue: { month: string; value: number; predicted?: number }[];
  engagement: { day: string; sessions: number; aiQueries: number }[];
  predictions: { title: string; description: string; confidence: number; impact: string }[];
  anomalies: { title: string; description: string; severity: string; timestamp?: string }[];
  marketSentiment: { score: number; label: string; analysis: string };
};

const iconMap: Record<string, any> = { dollar: DollarSign, users: Users, trending: TrendingUp, activity: Activity };

const impactColors: Record<string, string> = { high: "text-primary", medium: "text-neon-blue", low: "text-emerald" };
const severityColors: Record<string, string> = { critical: "text-destructive", warning: "text-primary", info: "text-neon-blue" };
const severityBg: Record<string, string> = { critical: "bg-destructive/10", warning: "bg-primary/10", info: "bg-neon-blue/10" };

const fallbackDashboard: DashboardData = {
  metrics: [
    { id: "revenue", label: "Monthly Revenue", value: "$148,200", change: "+14.6%", trend: "up", icon: "dollar" },
    { id: "users", label: "Active Users", value: "12,840", change: "+11.2%", trend: "up", icon: "users" },
    { id: "growth", label: "Growth Rate", value: "27.3%", change: "+3.8%", trend: "up", icon: "trending" },
    { id: "queries", label: "AI Queries", value: "68.9K", change: "+22.4%", trend: "up", icon: "activity" },
  ],
  revenue: [
    { month: "Jun", value: 68000 },
    { month: "Jul", value: 74500 },
    { month: "Aug", value: 82000 },
    { month: "Sep", value: 91000 },
    { month: "Oct", value: 103000 },
    { month: "Nov", value: 118000 },
    { month: "Dec", value: 129500 },
    { month: "Jan", value: 138000, predicted: 142000 },
    { month: "Feb", value: 148200, predicted: 157000 },
    { month: "Mar", predicted: 168000 } as any,
  ],
  engagement: [
    { day: "Mon", sessions: 1850, aiQueries: 1320 },
    { day: "Tue", sessions: 2100, aiQueries: 1540 },
    { day: "Wed", sessions: 2250, aiQueries: 1680 },
    { day: "Thu", sessions: 2400, aiQueries: 1790 },
    { day: "Fri", sessions: 1980, aiQueries: 1410 },
    { day: "Sat", sessions: 1350, aiQueries: 920 },
    { day: "Sun", sessions: 1100, aiQueries: 740 },
  ],
  predictions: [
    { title: "Revenue Acceleration", description: "Current trajectory suggests 32% revenue growth over the next quarter driven by enterprise tier upgrades and expanding API usage.", confidence: 91, impact: "high" },
    { title: "Churn Risk Reduction", description: "AI-driven personalization features are projected to reduce monthly churn by 18% within 60 days, retaining an estimated $24K MRR.", confidence: 84, impact: "high" },
    { title: "Enterprise Expansion", description: "Enterprise segment adoption rate increased 40% QoQ. Recommend launching a dedicated onboarding track and priority support tier.", confidence: 78, impact: "medium" },
  ],
  anomalies: [
    { title: "Traffic Surge Detected", description: "Organic search traffic spiked 280% after a viral industry report mentioned NEXUS AI. Infrastructure auto-scaled to handle demand.", severity: "warning", timestamp: "2026-02-17T14:32:00Z" },
    { title: "Response Latency Improvement", description: "Average API response time dropped from 142ms to 98ms following the v3.2 inference engine rollout — a 31% improvement.", severity: "info", timestamp: "2026-02-16T09:15:00Z" },
  ],
  marketSentiment: { score: 82, label: "Bullish", analysis: "Strong upward momentum in the AI services sector. Enterprise adoption is accelerating, regulatory clarity is improving across key markets, and investor sentiment remains strongly positive heading into Q2." },
};

const Dashboard = () => {
  const { data, loading, error, status, creditsExhausted, analyze } = useAIAnalytics<DashboardData>();
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const usage = useUsageTracking();
  const realtimeAlerts = useRealtimeAlerts();
  const creditToastShown = useRef(false);

  const fetchData = async () => {
    const result = await analyze("dashboard-insights");
    if (result) setLastUpdated(new Date());
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (creditsExhausted && !creditToastShown.current) {
      creditToastShown.current = true;
    }
  }, [creditsExhausted]);

  const displayData = data || (error ? fallbackDashboard : null);

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <RealtimeAlertToast alert={realtimeAlerts.newAlert} onDismiss={realtimeAlerts.dismissNewAlert} />
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Brain className="text-primary" size={24} />
              <p className="text-primary font-display text-sm tracking-[0.3em] uppercase">AI-Powered Intelligence</p>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">Autonomous Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {loading ? "AI is analyzing..." : lastUpdated ? `Last AI analysis: ${lastUpdated.toLocaleTimeString()}` : error ? "Showing cached data • Click Refresh to retry" : "Initializing AI..."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {realtimeAlerts.unreadCount > 0 && (
              <div className="relative flex items-center gap-1.5 px-3 py-2 rounded-full bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold">
                <Bell size={14} />
                <span>{realtimeAlerts.unreadCount} alert{realtimeAlerts.unreadCount > 1 ? "s" : ""}</span>
              </div>
            )}
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              {loading ? "Analyzing..." : "Refresh AI"}
            </button>
          </div>
        </motion.div>

        <AIFallbackBanner status={status} onRetry={fetchData} loading={loading} className="mb-6" />

        <TrialCountdownBanner className="mb-6" />

        {!usage.loading && (
          <UsageLimitBanner
            used={usage.used}
            limit={usage.limit}
            percentage={usage.percentage}
            isNearLimit={usage.isNearLimit}
            isAtLimit={usage.isAtLimit}
            tier={usage.tier}
            className="mb-6"
          />
        )}

        {/* Loading state */}
        <AnimatePresence>
          {loading && !displayData && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32"
            >
              <div className="relative w-20 h-20 mb-6">
                <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                <div className="absolute inset-0 rounded-full border-2 border-t-primary animate-spin" />
                <Brain className="absolute inset-0 m-auto text-primary" size={28} />
              </div>
              <p className="text-muted-foreground text-sm animate-pulse">NEXUS AI is generating your intelligence report...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {displayData && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            
            {/* Metric cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {displayData.metrics.map((m, i) => {
                const Icon = iconMap[m.icon] || Activity;
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="glass-card rounded-xl p-5 group hover:gold-glow transition-shadow duration-500"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Icon size={18} className="text-primary" />
                      </div>
                      <span className="text-xs text-muted-foreground">{m.label}</span>
                    </div>
                    <div className="font-display text-2xl font-bold text-foreground">{m.value}</div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className={m.trend === "up" ? "text-emerald" : m.trend === "down" ? "text-destructive" : "text-muted-foreground"}>
                        {m.trend === "up" ? "↑" : m.trend === "down" ? "↓" : "→"} {m.change}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card rounded-xl p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={14} className="text-primary" />
                  <h3 className="font-display text-sm font-semibold text-foreground">Revenue Trend + AI Prediction</h3>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <ComposedChart data={displayData.revenue}>
                    <defs>
                      <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(43, 56%, 52%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(43, 56%, 52%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 16%)" />
                    <XAxis dataKey="month" tick={{ fill: "hsl(0, 0%, 55%)", fontSize: 12 }} axisLine={false} />
                    <YAxis tick={{ fill: "hsl(0, 0%, 55%)", fontSize: 12 }} axisLine={false} />
                    <Tooltip contentStyle={{ background: "hsl(0, 0%, 7%)", border: "1px solid hsl(0, 0%, 16%)", borderRadius: "8px", color: "hsl(45, 10%, 90%)" }} />
                    <Area type="monotone" dataKey="value" stroke="hsl(43, 56%, 52%)" fill="url(#goldGrad)" strokeWidth={2} name="Actual" />
                    {displayData.revenue.some(r => r.predicted) && (
                      <Line type="monotone" dataKey="predicted" stroke="hsl(210, 100%, 60%)" strokeWidth={2} strokeDasharray="5 5" dot={false} name="AI Predicted" />
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-card rounded-xl p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Zap size={14} className="text-neon-blue" />
                  <h3 className="font-display text-sm font-semibold text-foreground">Sessions vs AI Queries</h3>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={displayData.engagement}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 16%)" />
                    <XAxis dataKey="day" tick={{ fill: "hsl(0, 0%, 55%)", fontSize: 12 }} axisLine={false} />
                    <YAxis tick={{ fill: "hsl(0, 0%, 55%)", fontSize: 12 }} axisLine={false} />
                    <Tooltip contentStyle={{ background: "hsl(0, 0%, 7%)", border: "1px solid hsl(0, 0%, 16%)", borderRadius: "8px", color: "hsl(45, 10%, 90%)" }} />
                    <Bar dataKey="sessions" fill="hsl(210, 100%, 60%)" radius={[4, 4, 0, 0]} name="Sessions" />
                    <Bar dataKey="aiQueries" fill="hsl(43, 56%, 52%)" radius={[4, 4, 0, 0]} name="AI Queries" />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            {/* AI Insights Grid */}
            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              {/* Predictions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass-card rounded-xl p-6"
              >
                <div className="flex items-center gap-2 mb-5">
                  <Brain size={16} className="text-primary" />
                  <h3 className="font-display text-sm font-semibold text-foreground">AI Predictions</h3>
                </div>
                <div className="space-y-4">
                  {displayData.predictions.map((p, i) => (
                    <div key={i} className="border-l-2 border-primary/30 pl-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-foreground">{p.title}</span>
                        <span className={`text-[10px] font-semibold uppercase tracking-wider ${impactColors[p.impact] || "text-muted-foreground"}`}>
                          {p.impact}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-2">{p.description}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${p.confidence}%` }}
                            transition={{ delay: 0.8 + i * 0.2, duration: 1 }}
                            className="h-full bg-primary rounded-full"
                          />
                        </div>
                        <span className="text-[10px] text-primary font-medium">{p.confidence}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Anomalies */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="glass-card rounded-xl p-6"
              >
                <div className="flex items-center gap-2 mb-5">
                  <AlertTriangle size={16} className="text-primary" />
                  <h3 className="font-display text-sm font-semibold text-foreground">Anomaly Detection</h3>
                </div>
                <div className="space-y-4">
                  {displayData.anomalies.map((a, i) => (
                    <div key={i} className={`rounded-lg p-4 ${severityBg[a.severity] || "bg-secondary"}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Shield size={12} className={severityColors[a.severity] || "text-muted-foreground"} />
                        <span className={`text-xs font-semibold uppercase tracking-wider ${severityColors[a.severity]}`}>
                          {a.severity}
                        </span>
                      </div>
                      <h4 className="text-sm font-medium text-foreground mb-1">{a.title}</h4>
                      <p className="text-xs text-muted-foreground">{a.description}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Market Sentiment */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="glass-card rounded-xl p-6"
              >
                <div className="flex items-center gap-2 mb-5">
                  <TrendingUp size={16} className="text-emerald" />
                  <h3 className="font-display text-sm font-semibold text-foreground">Market Sentiment</h3>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="relative w-32 h-32 mb-4">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831a15.9155 15.9155 0 0 1 0-31.831"
                        fill="none"
                        stroke="hsl(0, 0%, 16%)"
                        strokeWidth="3"
                      />
                      <motion.path
                        d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831a15.9155 15.9155 0 0 1 0-31.831"
                        fill="none"
                        stroke="hsl(43, 56%, 52%)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        initial={{ strokeDasharray: "0, 100" }}
                        animate={{ strokeDasharray: `${displayData.marketSentiment.score}, 100` }}
                        transition={{ delay: 1, duration: 1.5, ease: "easeOut" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-display text-2xl font-bold text-primary">{displayData.marketSentiment.score}</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{displayData.marketSentiment.label}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{displayData.marketSentiment.analysis}</p>
                </div>
              </motion.div>
            </div>

            {/* AI Badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-center py-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10">
                <Brain size={12} className="text-primary" />
                <span className="text-[10px] text-muted-foreground tracking-[0.2em] uppercase">
                  100% AI Generated • Zero Human Input • Powered by QUANTUS Quantum Engine
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
