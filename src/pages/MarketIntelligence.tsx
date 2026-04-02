import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Radar, TrendingUp, TrendingDown, AlertCircle, Globe, BarChart3, ArrowUpRight, ArrowDownRight, Clock, Flame, Eye, Filter, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import useDocumentHead from "@/hooks/use-document-head";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

type Signal = {
  id: string;
  title: string;
  vertical: string;
  sentiment: "bullish" | "bearish" | "neutral";
  impact: "high" | "medium" | "low";
  time: string;
  confidence: number;
};

type Opportunity = {
  title: string;
  potential: string;
  vertical: string;
  urgency: string;
  score: number;
};

const MarketIntelligence = () => {
  const [verticalFilter, setVerticalFilter] = useState("all");
  const [signals, setSignals] = useState<Signal[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ signals: 0, bullish: 0, opportunities: 0, sources: 0 });

  useDocumentHead({
    title: "Market Intelligence Feed — Real-Time Signals | QUANTUS V2+",
    description: "Live market intelligence with pricing trends, competitor analysis, and AI-scored opportunity alerts.",
    canonical: "https://quantus-loom.lovable.app/intelligence",
  });

  useEffect(() => {
    async function fetchIntelligence() {
      setLoading(true);

      // Derive signals from real deal activity + sourcing data
      const [dealsRes, sourcingRes, outreachRes] = await Promise.all([
        supabase.from("deals").select("id, category, sub_category, intent, priority_score, status, deal_value_estimate, budget_currency, created_at, updated_at").order("updated_at", { ascending: false }).limit(50),
        supabase.from("sourcing_results").select("id, category, name, overall_score, estimated_cost, tier, created_at").order("created_at", { ascending: false }).limit(30),
        supabase.from("vendor_outreach").select("id, category, vendor_name, status, vendor_score, created_at").order("created_at", { ascending: false }).limit(30),
      ]);

      const deals = dealsRes.data || [];
      const sourcing = sourcingRes.data || [];
      const outreach = outreachRes.data || [];

      // Generate signals from real data
      const derivedSignals: Signal[] = [];

      // Category-level deal activity signals
      const categoryCounts: Record<string, number> = {};
      deals.forEach((d: any) => { categoryCounts[d.category] = (categoryCounts[d.category] || 0) + 1; });
      Object.entries(categoryCounts).forEach(([cat, count]) => {
        derivedSignals.push({
          id: `deal-${cat}`,
          title: `${count} active deal${count > 1 ? "s" : ""} in ${cat.charAt(0).toUpperCase() + cat.slice(1)} vertical`,
          vertical: cat.charAt(0).toUpperCase() + cat.slice(1),
          sentiment: count >= 3 ? "bullish" : "neutral",
          impact: count >= 5 ? "high" : "medium",
          time: formatDistanceToNow(new Date(deals.find((d: any) => d.category === cat)?.updated_at || new Date()), { addSuffix: true }),
          confidence: Math.min(95, 70 + count * 5),
        });
      });

      // Sourcing signals
      const primarySourcing = sourcing.filter((s: any) => s.tier === "primary");
      if (primarySourcing.length > 0) {
        const cats = [...new Set(primarySourcing.map((s: any) => s.category))];
        cats.forEach((cat: any) => {
          const catResults = primarySourcing.filter((s: any) => s.category === cat);
          const avgScore = catResults.reduce((sum: number, s: any) => sum + s.overall_score, 0) / catResults.length;
          derivedSignals.push({
            id: `sourcing-${cat}`,
            title: `${catResults.length} primary-tier options identified in ${cat.charAt(0).toUpperCase() + cat.slice(1)} — avg score ${Math.round(avgScore)}`,
            vertical: cat.charAt(0).toUpperCase() + cat.slice(1),
            sentiment: avgScore > 85 ? "bullish" : "neutral",
            impact: "high",
            time: formatDistanceToNow(new Date(catResults[0].created_at), { addSuffix: true }),
            confidence: Math.round(avgScore),
          });
        });
      }

      // Vendor response signals
      const respondedVendors = outreach.filter((o: any) => o.status === "responded" || o.status === "negotiation_ready");
      if (respondedVendors.length > 0) {
        derivedSignals.push({
          id: "vendor-responses",
          title: `${respondedVendors.length} vendor${respondedVendors.length > 1 ? "s" : ""} responded with active interest — negotiation opportunities available`,
          vertical: "All",
          sentiment: "bullish",
          impact: "high",
          time: formatDistanceToNow(new Date(respondedVendors[0].created_at), { addSuffix: true }),
          confidence: 90,
        });
      }

      setSignals(derivedSignals);

      // Generate opportunities from high-value deals
      const opps: Opportunity[] = deals
        .filter((d: any) => d.deal_value_estimate && d.status !== "completed" && d.status !== "cancelled")
        .slice(0, 6)
        .map((d: any) => ({
          title: d.intent || `${d.category} deal — ${d.sub_category || "general"}`,
          potential: d.deal_value_estimate >= 1000000
            ? `$${(d.deal_value_estimate / 1000000).toFixed(1)}M`
            : `$${(d.deal_value_estimate / 1000).toFixed(0)}K`,
          vertical: d.category.charAt(0).toUpperCase() + d.category.slice(1),
          urgency: d.priority_score >= 80 ? "Immediate" : d.priority_score >= 60 ? "This week" : "This month",
          score: d.priority_score,
        }));
      setOpportunities(opps);

      // Stats
      const bullishCount = derivedSignals.filter(s => s.sentiment === "bullish").length;
      const bullishPct = derivedSignals.length > 0 ? Math.round((bullishCount / derivedSignals.length) * 100) : 0;
      setStats({
        signals: derivedSignals.length,
        bullish: bullishPct,
        opportunities: opps.length,
        sources: deals.length + sourcing.length + outreach.length,
      });

      setLoading(false);
    }

    fetchIntelligence();
  }, []);

  const filteredSignals = verticalFilter === "all" ? signals : signals.filter(s => s.vertical.toLowerCase() === verticalFilter);

  const getSentimentIcon = (sentiment: string) => {
    if (sentiment === "bullish") return <ArrowUpRight size={14} className="text-emerald-400" />;
    if (sentiment === "bearish") return <ArrowDownRight size={14} className="text-red-400" />;
    return <BarChart3 size={14} className="text-amber-400" />;
  };

  const getSentimentBadge = (sentiment: string) => {
    const colors = { bullish: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", bearish: "bg-red-500/10 text-red-400 border-red-500/20", neutral: "bg-amber-500/10 text-amber-400 border-amber-500/20" };
    return colors[sentiment as keyof typeof colors] || colors.neutral;
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopBar />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                  <Radar size={22} className="text-primary" />
                </div>
                Market Intelligence
                <Badge variant="outline" className="text-[10px] border-primary/30 text-primary bg-primary/5">LIVE</Badge>
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Real-time signals derived from your deal activity, vendor responses, and sourcing intelligence.</p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={verticalFilter} onValueChange={setVerticalFilter}>
                <SelectTrigger className="w-[160px] h-9 text-xs">
                  <Filter size={12} className="mr-1" />
                  <SelectValue placeholder="All Verticals" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Verticals</SelectItem>
                  <SelectItem value="aviation">Aviation</SelectItem>
                  <SelectItem value="medical">Medical</SelectItem>
                  <SelectItem value="staffing">Staffing</SelectItem>
                  <SelectItem value="lifestyle">Lifestyle</SelectItem>
                  <SelectItem value="logistics">Logistics</SelectItem>
                  <SelectItem value="partnerships">Partnerships</SelectItem>
                </SelectContent>
              </Select>
              <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 2 }}
                className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Active Signals", value: loading ? "—" : String(stats.signals), icon: Radar, color: "text-primary" },
              { label: "Bullish Trends", value: loading ? "—" : `${stats.bullish}%`, icon: TrendingUp, color: "text-emerald-400" },
              { label: "Opportunities", value: loading ? "—" : String(stats.opportunities), icon: Flame, color: "text-amber-400" },
              { label: "Data Points", value: loading ? "—" : String(stats.sources), icon: Globe, color: "text-blue-400" },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <Card className="glass-card border-border/50">
                  <CardContent className="p-5">
                    <stat.icon size={18} className={`${stat.color} mb-3`} />
                    <div className="font-display text-2xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={24} className="animate-spin text-primary" />
            </div>
          ) : (
            <Tabs defaultValue="signals" className="space-y-4">
              <TabsList className="bg-secondary/50">
                <TabsTrigger value="signals">Signal Feed</TabsTrigger>
                <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
              </TabsList>

              <TabsContent value="signals" className="space-y-3">
                {filteredSignals.length === 0 ? (
                  <Card className="glass-card border-border/50 p-8 text-center">
                    <Radar size={24} className="text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No signals yet. Submit deals to generate intelligence.</p>
                  </Card>
                ) : filteredSignals.map((signal, i) => (
                  <motion.div key={signal.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                    <Card className="glass-card border-border/50 hover:border-primary/20 transition-all cursor-pointer group">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-[10px]">{signal.vertical}</Badge>
                              <Badge variant="outline" className={`text-[10px] ${getSentimentBadge(signal.sentiment)}`}>
                                {getSentimentIcon(signal.sentiment)}
                                <span className="ml-1 capitalize">{signal.sentiment}</span>
                              </Badge>
                              {signal.impact === "high" && (
                                <Badge variant="outline" className="text-[10px] bg-red-500/10 text-red-400 border-red-500/20">
                                  <Flame size={10} className="mr-0.5" /> High Impact
                                </Badge>
                              )}
                            </div>
                            <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{signal.title}</h3>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                              <Clock size={10} /> {signal.time}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Confidence: <span className="text-foreground font-medium">{signal.confidence}%</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </TabsContent>

              <TabsContent value="opportunities" className="space-y-3">
                {opportunities.length === 0 ? (
                  <Card className="glass-card border-border/50 p-8 text-center">
                    <Flame size={24} className="text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No opportunities detected yet. Active deals with value estimates will appear here.</p>
                  </Card>
                ) : opportunities.map((opp, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                    <Card className="glass-card border-border/50 hover:border-primary/30 transition-all">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-[10px]">{opp.vertical}</Badge>
                              <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-400 border-amber-500/20">{opp.urgency}</Badge>
                            </div>
                            <h3 className="text-sm font-medium text-foreground capitalize">{opp.title}</h3>
                          </div>
                          <div className="text-right">
                            <div className="font-display text-lg font-bold text-foreground">{opp.potential}</div>
                            <div className="text-xs text-muted-foreground">Score: <span className="text-emerald-400 font-semibold">{opp.score}/100</span></div>
                          </div>
                          <Button size="sm" variant="outline" className="ml-4 text-xs gap-1">
                            <Eye size={12} /> Pursue
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </TabsContent>
            </Tabs>
          )}
        </main>
      </div>
    </div>
  );
};

export default MarketIntelligence;