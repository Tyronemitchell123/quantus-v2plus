import { useState } from "react";
import { motion } from "framer-motion";
import { Radar, TrendingUp, TrendingDown, AlertCircle, Globe, BarChart3, ArrowUpRight, ArrowDownRight, Clock, Flame, Eye, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import useDocumentHead from "@/hooks/use-document-head";

const signals = [
  { id: 1, title: "Private jet charter demand surges 34% in MENA region", vertical: "Aviation", sentiment: "bullish", impact: "high", time: "12m ago", confidence: 92 },
  { id: 2, title: "New FDA fast-track designation for regenerative therapies", vertical: "Medical", sentiment: "bullish", impact: "high", time: "28m ago", confidence: 88 },
  { id: 3, title: "UK staffing market contracts for 3rd consecutive quarter", vertical: "Staffing", sentiment: "bearish", impact: "medium", time: "1h ago", confidence: 76 },
  { id: 4, title: "Luxury wellness retreat bookings up 52% YoY in SE Asia", vertical: "Lifestyle", sentiment: "bullish", impact: "high", time: "2h ago", confidence: 91 },
  { id: 5, title: "Global shipping rates stabilize after 6-month decline", vertical: "Logistics", sentiment: "neutral", impact: "medium", time: "3h ago", confidence: 84 },
  { id: 6, title: "UHNW family office allocations shifting toward direct deals", vertical: "Partnerships", sentiment: "bullish", impact: "high", time: "4h ago", confidence: 87 },
  { id: 7, title: "Competitor AeroLux raises Series C — expanding into Asia", vertical: "Aviation", sentiment: "bearish", impact: "medium", time: "5h ago", confidence: 79 },
  { id: 8, title: "Medical tourism revenue forecast up 28% for 2026", vertical: "Medical", sentiment: "bullish", impact: "high", time: "6h ago", confidence: 93 },
];

const opportunities = [
  { title: "Charter fleet expansion — Dubai ↔ London corridor", potential: "$4.2M", vertical: "Aviation", urgency: "Immediate", score: 94 },
  { title: "Stem cell clinic partnership — Bangkok network", potential: "$1.8M", vertical: "Medical", urgency: "This week", score: 89 },
  { title: "Executive staffing contract — Fortune 100 tech", potential: "$720K", vertical: "Staffing", urgency: "This month", score: 82 },
  { title: "Luxury safari experience — Kenya conservation", potential: "$3.1M", vertical: "Lifestyle", urgency: "This week", score: 91 },
];

const MarketIntelligence = () => {
  const [verticalFilter, setVerticalFilter] = useState("all");

  useDocumentHead({
    title: "Market Intelligence Feed — Real-Time Signals | QUANTUS V2+",
    description: "Live market intelligence with pricing trends, competitor analysis, and AI-scored opportunity alerts.",
    canonical: "https://quantus-loom.lovable.app/intelligence",
  });

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
              <p className="text-sm text-muted-foreground mt-1">Real-time signals, competitor analysis, and AI-scored opportunities.</p>
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
              { label: "Active Signals", value: "2,847", icon: Radar, color: "text-primary" },
              { label: "Bullish Trends", value: "68%", icon: TrendingUp, color: "text-emerald-400" },
              { label: "Opportunities", value: "42", icon: Flame, color: "text-amber-400" },
              { label: "Data Sources", value: "156", icon: Globe, color: "text-blue-400" },
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

          <Tabs defaultValue="signals" className="space-y-4">
            <TabsList className="bg-secondary/50">
              <TabsTrigger value="signals">Signal Feed</TabsTrigger>
              <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
              <TabsTrigger value="competitors">Competitor Watch</TabsTrigger>
            </TabsList>

            <TabsContent value="signals" className="space-y-3">
              {filteredSignals.map((signal, i) => (
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
              {opportunities.map((opp, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <Card className="glass-card border-border/50 hover:border-primary/30 transition-all">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-[10px]">{opp.vertical}</Badge>
                            <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-400 border-amber-500/20">{opp.urgency}</Badge>
                          </div>
                          <h3 className="text-sm font-medium text-foreground">{opp.title}</h3>
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

            <TabsContent value="competitors">
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { name: "AeroLux Concierge", threat: "Medium", moves: ["Raised $28M Series C", "Expanding to Dubai", "Hired ex-VistaJet CTO"], vertical: "Aviation" },
                  { name: "MedElite Global", threat: "Low", moves: ["Lost APAC exclusivity deal", "CFO departure announced", "Price cuts on premium tier"], vertical: "Medical" },
                  { name: "PrimeStaff Solutions", threat: "High", moves: ["Won Fortune 50 contract", "AI matching tool launched", "Acquired TalentScope"], vertical: "Staffing" },
                  { name: "Luxe Horizons", threat: "Medium", moves: ["New yacht charter vertical", "Partnership with Four Seasons", "App redesign launched"], vertical: "Lifestyle" },
                ].map((comp, i) => (
                  <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
                    <Card className="glass-card border-border/50 h-full">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{comp.name}</CardTitle>
                          <Badge variant="outline" className={`text-[10px] ${comp.threat === "High" ? "text-red-400 border-red-500/20" : comp.threat === "Medium" ? "text-amber-400 border-amber-500/20" : "text-emerald-400 border-emerald-500/20"}`}>
                            {comp.threat} Threat
                          </Badge>
                        </div>
                        <Badge variant="outline" className="text-[10px] w-fit">{comp.vertical}</Badge>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {comp.moves.map((move, j) => (
                            <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <AlertCircle size={12} className="text-primary shrink-0 mt-0.5" />
                              {move}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default MarketIntelligence;
