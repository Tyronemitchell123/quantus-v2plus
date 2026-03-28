import { useState } from "react";
import { motion } from "framer-motion";
import useDocumentHead from "@/hooks/use-document-head";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import {
  TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3,
  ArrowUpRight, ArrowDownRight, Shield, Globe, Building2, Gem,
  Plane, Home, Car, Wallet, Activity, Eye, EyeOff
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

const assetClasses = [
  { name: "Real Estate", value: 42_500_000, change: 3.2, icon: Home, color: "text-emerald-500", allocation: 34 },
  { name: "Equities", value: 28_750_000, change: -1.8, icon: BarChart3, color: "text-blue-500", allocation: 23 },
  { name: "Private Equity", value: 18_200_000, change: 7.4, icon: Building2, color: "text-purple-500", allocation: 15 },
  { name: "Fixed Income", value: 12_500_000, change: 0.5, icon: Shield, color: "text-amber-500", allocation: 10 },
  { name: "Aviation Assets", value: 9_800_000, change: -2.1, icon: Plane, color: "text-cyan-500", allocation: 8 },
  { name: "Luxury Collectibles", value: 6_250_000, change: 12.3, icon: Gem, color: "text-pink-500", allocation: 5 },
  { name: "Vehicles", value: 3_100_000, change: -5.4, icon: Car, color: "text-orange-500", allocation: 3 },
  { name: "Liquid Cash", value: 2_900_000, change: 0.0, icon: Wallet, color: "text-green-500", allocation: 2 },
];

const totalNetWorth = assetClasses.reduce((s, a) => s + a.value, 0);

const recentActivity = [
  { action: "Portfolio rebalanced", detail: "Shifted 2% from Equities to Private Equity", time: "2h ago", type: "rebalance" },
  { action: "Dividend received", detail: "£42,500 from Hargreaves Fund III", time: "6h ago", type: "income" },
  { action: "Property valuation updated", detail: "Mayfair residence +£380K", time: "1d ago", type: "valuation" },
  { action: "Risk alert", detail: "Emerging market exposure above threshold", time: "2d ago", type: "alert" },
];

const fmt = (n: number) => "£" + n.toLocaleString("en-GB");

const WealthDashboard = () => {
  useDocumentHead({ title: "Wealth Dashboard — Quantus A.I", description: "Real-time portfolio tracking, asset allocation, and net worth analytics powered by AI." });
  const [privacyMode, setPrivacyMode] = useState(false);
  const mask = (v: string) => privacyMode ? "••••••••" : v;

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col">
        <DashboardTopBar />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display tracking-tight text-foreground">Wealth Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">Real-time portfolio intelligence</p>
            </div>
            <button onClick={() => setPrivacyMode(!privacyMode)} className="flex items-center gap-2 px-4 py-2 border border-border text-xs tracking-widest uppercase font-body text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all">
              {privacyMode ? <EyeOff size={14} /> : <Eye size={14} />}
              {privacyMode ? "Show Values" : "Privacy Mode"}
            </button>
          </div>

          {/* Net Worth Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] tracking-[0.3em] uppercase text-primary/70 font-body">Total Net Worth</p>
                    <p className="text-4xl font-display tracking-tight text-foreground mt-2">{mask(fmt(totalNetWorth))}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <ArrowUpRight size={14} className="text-emerald-500" />
                      <span className="text-sm text-emerald-500 font-body">+2.7% this month</span>
                      <span className="text-xs text-muted-foreground">({mask("+£3.3M")})</span>
                    </div>
                  </div>
                  <div className="w-20 h-20 rounded-full border-4 border-primary/30 flex items-center justify-center">
                    <DollarSign size={28} className="text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: "Monthly Income", value: mask("£185K"), change: "+12%", up: true, icon: TrendingUp },
              { label: "Monthly Expenses", value: mask("£67K"), change: "-3%", up: false, icon: TrendingDown },
              { label: "Active Investments", value: "24", change: "+2", up: true, icon: Activity },
              { label: "Risk Score", value: "72/100", change: "Moderate", up: true, icon: Shield },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground font-body">{stat.label}</p>
                      <stat.icon size={14} className="text-primary/50" />
                    </div>
                    <p className="text-xl font-display text-foreground">{stat.value}</p>
                    <p className={`text-xs font-body mt-1 ${stat.up ? "text-emerald-500" : "text-rose-500"}`}>{stat.change}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Tabs defaultValue="allocation">
            <TabsList className="bg-secondary/50 border border-border">
              <TabsTrigger value="allocation" className="text-xs tracking-wider uppercase font-body">Allocation</TabsTrigger>
              <TabsTrigger value="activity" className="text-xs tracking-wider uppercase font-body">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="allocation" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assetClasses.map((asset, i) => (
                  <motion.div key={asset.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className="hover:border-primary/20 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg bg-secondary flex items-center justify-center ${asset.color}`}>
                              <asset.icon size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-body text-foreground">{asset.name}</p>
                              <p className="text-xs text-muted-foreground font-body">{asset.allocation}% of portfolio</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-body text-foreground">{mask(fmt(asset.value))}</p>
                            <div className="flex items-center gap-1 justify-end">
                              {asset.change >= 0 ? <ArrowUpRight size={10} className="text-emerald-500" /> : <ArrowDownRight size={10} className="text-rose-500" />}
                              <span className={`text-[10px] font-body ${asset.change >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                                {asset.change >= 0 ? "+" : ""}{asset.change}%
                              </span>
                            </div>
                          </div>
                        </div>
                        <Progress value={asset.allocation} className="h-1" />
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="activity" className="mt-4 space-y-3">
              {recentActivity.map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <Card>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-body text-foreground">{item.action}</p>
                        <p className="text-xs text-muted-foreground font-body mt-0.5">{item.detail}</p>
                      </div>
                      <span className="text-[10px] tracking-wider uppercase text-primary/50 font-body">{item.time}</span>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default WealthDashboard;
