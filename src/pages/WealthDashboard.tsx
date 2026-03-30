import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useDocumentHead from "@/hooks/use-document-head";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import {
  TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3,
  ArrowUpRight, ArrowDownRight, Shield, Globe, Building2, Gem,
  Plane, Home, Car, Wallet, Activity, Eye, EyeOff, Zap, Lock,
  ChevronRight, Sparkles, Database
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import ParticleGrid from "@/components/ParticleGrid";
import PortfolioAINarrative from "@/components/wealth/PortfolioAINarrative";
import PortfolioDonutChart from "@/components/wealth/PortfolioDonutChart";
import PortfolioTreemap from "@/components/wealth/PortfolioTreemap";
import { usePortfolioAssets, centsToValue, fmtGBP } from "@/hooks/use-portfolio-assets";
import { toast } from "sonner";

const ICON_MAP: Record<string, any> = {
  real_estate: Home, equities: BarChart3, private_equity: Building2,
  fixed_income: Shield, aviation: Plane, collectibles: Gem,
  vehicles: Car, cash: Wallet, other: Activity,
};

const recentActivity = [
  { action: "Portfolio rebalanced", detail: "Shifted 2% from Equities to Private Equity", time: "2h ago", type: "rebalance" },
  { action: "Dividend received", detail: "£42,500 from Hargreaves Fund III", time: "6h ago", type: "income" },
  { action: "Property valuation updated", detail: "Mayfair residence +£380K", time: "1d ago", type: "valuation" },
  { action: "Risk alert resolved", detail: "Emerging market exposure rebalanced", time: "2d ago", type: "alert" },
  { action: "Trust distribution", detail: "Q1 distribution processed — £125K", time: "3d ago", type: "income" },
];

const aiInsights = [
  { title: "Rebalancing Opportunity", desc: "Equities overweight by 3.2%. Consider shifting to fixed income for risk-adjusted returns.", priority: "high" },
  { title: "Tax Efficiency", desc: "CGT harvesting window open — potential £85K savings before April.", priority: "medium" },
  { title: "Compounding Signal", desc: "Private equity allocation outperforming benchmark by 4.1%. Maintain position.", priority: "low" },
];

const fmt = (n: number) => "£" + n.toLocaleString("en-GB");

const WealthDashboard = () => {
  useDocumentHead({ title: "Wealth Intelligence — Quantus V2+", description: "Sovereign net-worth command centre with real-time portfolio intelligence." });
  const [privacyMode, setPrivacyMode] = useState(false);
  const mask = (v: string) => privacyMode ? "••••••••" : v;

  const { assets, loading, usingDefaults, seedDefaults } = usePortfolioAssets();

  // Transform DB assets to display format
  const assetClasses = useMemo(() => assets.map((a) => ({
    name: a.name,
    value: centsToValue(a.value_cents),
    change: a.change_pct,
    icon: ICON_MAP[a.asset_class] || Activity,
    allocation: a.allocation_pct,
  })), [assets]);

  // For AI narrative component
  const portfolioForAI = useMemo(() => assetClasses.map((a) => ({
    name: a.name,
    value: a.value,
    change: a.change,
    allocation: a.allocation,
  })), [assetClasses]);

  const totalNetWorth = assetClasses.reduce((s, a) => s + a.value, 0);
  const monthlyChange = Math.round(totalNetWorth * 0.027);
  const compoundingProjections = [
    { year: "Year 1", value: totalNetWorth * 1.08, label: "Conservative" },
    { year: "Year 3", value: totalNetWorth * 1.26, label: "Moderate" },
    { year: "Year 5", value: totalNetWorth * 1.47, label: "Growth" },
    { year: "Year 10", value: totalNetWorth * 2.16, label: "Aggressive" },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col relative">
        {/* Atmospheric background */}
        <div className="fixed inset-0 pointer-events-none opacity-15 z-0">
          <ParticleGrid />
        </div>
        <div className="fixed inset-0 pointer-events-none z-0" style={{
          background: "radial-gradient(ellipse at center, transparent 60%, hsl(var(--background)) 100%)"
        }} />

        <DashboardTopBar />

        <main className="flex-1 overflow-y-auto relative z-10">
          {/* Sovereign Header */}
          <div className="px-4 sm:px-6 lg:px-9 pt-6 sm:pt-9 pb-4 sm:pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-9">
              <div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[9px] tracking-[0.4em] uppercase text-primary/60 font-body mb-2"
                >
                  Sovereign Wealth Intelligence
                </motion.p>
                <motion.h1
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-2xl sm:text-3xl md:text-4xl font-display tracking-tight text-foreground"
                >
                  Wealth Command
                </motion.h1>
              </div>
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                onClick={() => setPrivacyMode(!privacyMode)}
                className="flex items-center gap-2 px-5 py-2.5 glass-card text-[10px] tracking-[0.25em] uppercase font-body text-muted-foreground hover:text-foreground hover:border-primary/20 transition-all duration-500"
              >
                {privacyMode ? <EyeOff size={13} /> : <Lock size={13} />}
                {privacyMode ? "Reveal" : "Privacy"}
              </motion.button>
              {usingDefaults && (
                <button
                  onClick={async () => {
                    await seedDefaults();
                    toast.success("Portfolio seeded with sample assets");
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 glass-card text-[10px] tracking-[0.25em] uppercase font-body text-primary/60 hover:text-primary hover:border-primary/20 transition-all duration-500"
                >
                  <Database size={13} /> Seed Data
                </button>
              )}
            </div>
            {/* Net Worth Hero — Full Width */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.8 }}
            >
              <Card className="border-primary/10 bg-gradient-to-br from-primary/[0.04] via-card to-card overflow-hidden relative">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                <CardContent className="p-6 md:p-9">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex-1">
                      <p className="text-[9px] tracking-[0.35em] uppercase text-primary/50 font-body mb-3">Total Net Worth</p>
                      <AnimatePresence mode="wait">
                        <motion.p
                          key={privacyMode ? "hidden" : "shown"}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="text-4xl md:text-5xl lg:text-6xl font-display tracking-tight text-foreground"
                        >
                          {mask(fmt(totalNetWorth))}
                        </motion.p>
                      </AnimatePresence>
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10">
                          <ArrowUpRight size={12} className="text-emerald-500" />
                          <span className="text-xs text-emerald-500 font-body font-medium">+2.7%</span>
                        </div>
                        <span className="text-xs text-muted-foreground font-body">{mask(`+${fmt(monthlyChange)}`)} this month</span>
                      </div>
                    </div>

                    {/* Score Ring */}
                    <div className="relative w-28 h-28 flex-shrink-0">
                      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                        <circle cx="60" cy="60" r="50" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
                        <motion.circle
                          cx="60" cy="60" r="50" fill="none"
                          stroke="hsl(var(--primary))"
                          strokeWidth="6"
                          strokeLinecap="round"
                          strokeDasharray={314}
                          initial={{ strokeDashoffset: 314 }}
                          animate={{ strokeDashoffset: 314 - (314 * 0.72) }}
                          transition={{ delay: 0.5, duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-lg font-display text-foreground">72</span>
                        <span className="text-[8px] tracking-[0.2em] uppercase text-primary/60 font-body">Health</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Stats Row */}
          <div className="px-6 lg:px-9 pb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Monthly Income", value: mask("£185K"), change: "+12%", up: true, icon: TrendingUp },
                { label: "Monthly Burn", value: mask("£67K"), change: "-3%", up: false, icon: TrendingDown },
                { label: "Active Positions", value: "24", change: "+2", up: true, icon: Activity },
                { label: "Liquidity Ratio", value: "18%", change: "Healthy", up: true, icon: Globe },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.08 }}
                >
                  <Card className="hover:border-primary/15 transition-all duration-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[8px] tracking-[0.25em] uppercase text-muted-foreground font-body">{stat.label}</p>
                        <stat.icon size={13} className="text-primary/40" />
                      </div>
                      <p className="text-xl font-display text-foreground">{stat.value}</p>
                      <p className={`text-[10px] font-body mt-1 ${stat.up ? "text-emerald-500" : "text-rose-400"}`}>{stat.change}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Visual Charts Row */}
          <div className="px-6 lg:px-9 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PortfolioDonutChart portfolio={assetClasses} privacyMode={privacyMode} />
              <PortfolioTreemap portfolio={assetClasses} privacyMode={privacyMode} />
            </div>
          </div>

          {/* AI Narrative */}
          <div className="px-6 lg:px-9 pb-6">
            <PortfolioAINarrative portfolio={portfolioForAI} />
          </div>

          {/* Main Content Grid */}
          <div className="px-6 lg:px-9 pb-9">
            <Tabs defaultValue="allocation" className="w-full">
              <TabsList className="bg-card border border-border mb-6">
                <TabsTrigger value="allocation" className="text-[10px] tracking-[0.2em] uppercase font-body">Allocation</TabsTrigger>
                <TabsTrigger value="projections" className="text-[10px] tracking-[0.2em] uppercase font-body">Compounding</TabsTrigger>
                <TabsTrigger value="activity" className="text-[10px] tracking-[0.2em] uppercase font-body">Activity</TabsTrigger>
                <TabsTrigger value="insights" className="text-[10px] tracking-[0.2em] uppercase font-body">AI Insights</TabsTrigger>
              </TabsList>

              <TabsContent value="allocation">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {assetClasses.map((asset, i) => (
                    <motion.div
                      key={asset.name}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <Card className="hover:border-primary/15 transition-all duration-500 group">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-primary/[0.08] flex items-center justify-center text-primary group-hover:bg-primary/[0.12] transition-colors duration-500">
                                <asset.icon size={16} strokeWidth={1.5} />
                              </div>
                              <div>
                                <p className="text-sm font-body text-foreground">{asset.name}</p>
                                <p className="text-[10px] text-muted-foreground font-body">{asset.allocation}% allocation</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-body text-foreground tabular-nums">{mask(fmt(asset.value))}</p>
                              <div className="flex items-center gap-1 justify-end">
                                {asset.change >= 0 ? <ArrowUpRight size={10} className="text-emerald-500" /> : <ArrowDownRight size={10} className="text-rose-400" />}
                                <span className={`text-[10px] font-body tabular-nums ${asset.change >= 0 ? "text-emerald-500" : "text-rose-400"}`}>
                                  {asset.change >= 0 ? "+" : ""}{asset.change}%
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="relative h-1 bg-border rounded-full overflow-hidden">
                            <motion.div
                              className="absolute inset-y-0 left-0 bg-primary/60 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${asset.allocation}%` }}
                              transition={{ delay: 0.3 + i * 0.04, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="projections">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {compoundingProjections.map((proj, i) => (
                    <motion.div
                      key={proj.year}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Card className="hover:border-primary/15 transition-all duration-500 relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                        <CardContent className="p-5">
                          <p className="text-[9px] tracking-[0.3em] uppercase text-primary/50 font-body mb-1">{proj.year}</p>
                          <p className="text-2xl font-display text-foreground mb-2">{mask(fmt(Math.round(proj.value)))}</p>
                          <div className="flex items-center gap-2">
                            <Zap size={11} className="text-primary/40" />
                            <span className="text-[10px] text-muted-foreground font-body">{proj.label} trajectory</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-[9px] text-muted-foreground/50 font-body tracking-wider mt-4 text-center"
                >
                  Projections based on historical performance. Not financial advice.
                </motion.p>
              </TabsContent>

              <TabsContent value="activity" className="space-y-2">
                {recentActivity.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Card className="hover:border-primary/10 transition-all duration-500">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            item.type === "income" ? "bg-emerald-500" :
                            item.type === "alert" ? "bg-amber-500" :
                            "bg-primary/40"
                          }`} />
                          <div>
                            <p className="text-sm font-body text-foreground">{item.action}</p>
                            <p className="text-[11px] text-muted-foreground font-body mt-0.5">{item.detail}</p>
                          </div>
                        </div>
                        <span className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground/50 font-body flex-shrink-0 ml-4">{item.time}</span>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </TabsContent>

              <TabsContent value="insights" className="space-y-3">
                {aiInsights.map((insight, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <Card className="hover:border-primary/15 transition-all duration-500 group cursor-pointer">
                      <CardContent className="p-5 flex items-start gap-4">
                        <div className="w-8 h-8 rounded-lg bg-primary/[0.08] flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Sparkles size={14} className="text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-body font-medium text-foreground">{insight.title}</p>
                            <span className={`text-[8px] tracking-[0.2em] uppercase font-body px-2 py-0.5 rounded-full ${
                              insight.priority === "high" ? "bg-amber-500/10 text-amber-500" :
                              insight.priority === "medium" ? "bg-primary/10 text-primary" :
                              "bg-emerald-500/10 text-emerald-500"
                            }`}>{insight.priority}</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground font-body leading-relaxed">{insight.desc}</p>
                        </div>
                        <ChevronRight size={14} className="text-muted-foreground/30 group-hover:text-primary/50 transition-colors mt-1" />
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </TabsContent>
            </Tabs>
          </div>

          {/* Footer */}
          <footer className="px-6 lg:px-9 py-4 border-t border-border/50">
            <p className="font-body text-[8px] tracking-[0.3em] uppercase text-muted-foreground/30 text-center">
              Quantus V2+ — Sovereign Wealth Intelligence — The Obsidian Standard
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default WealthDashboard;
