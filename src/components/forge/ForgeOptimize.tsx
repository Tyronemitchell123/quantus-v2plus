import { motion } from "framer-motion";
import {
  Gauge, Image, Zap, FileCode2, Globe, TrendingUp,
  CheckCircle2, AlertTriangle, ArrowRight, RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const optimizationMetrics = [
  { label: "Lighthouse Score", value: 96, target: 98, icon: Gauge, status: "good" },
  { label: "First Contentful Paint", value: 0.8, target: 0.6, unit: "s", icon: Zap, status: "good" },
  { label: "Largest Contentful Paint", value: 1.2, target: 1.0, unit: "s", icon: TrendingUp, status: "warn" },
  { label: "Cumulative Layout Shift", value: 0.02, target: 0.05, icon: FileCode2, status: "good" },
];

const optimizationTasks = [
  { task: "WebP conversion for hero images", status: "complete", savings: "2.3 MB saved" },
  { task: "Critical CSS extraction", status: "complete", savings: "Render +340ms faster" },
  { task: "Font subsetting (Playfair Display)", status: "complete", savings: "180 KB saved" },
  { task: "Lazy-load below-fold sections", status: "complete", savings: "Initial load −420ms" },
  { task: "Preconnect to CDN origins", status: "complete", savings: "DNS −60ms" },
  { task: "Service worker cache strategy", status: "pending", savings: "Offline support" },
  { task: "Edge CDN distribution (6 regions)", status: "active", savings: "Global TTFB <100ms" },
];

const ForgeOptimize = () => (
  <div className="space-y-6">
    {/* Core Web Vitals */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {optimizationMetrics.map((m) => (
        <Card key={m.label} className="bg-card/60 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <m.icon className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{m.label}</span>
            </div>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-xl font-semibold text-foreground">{m.value}</span>
              {m.unit && <span className="text-xs text-muted-foreground">{m.unit}</span>}
            </div>
            <div className="flex items-center gap-2">
              <Progress value={m.status === "good" ? 90 : 70} className="h-1 flex-1" />
              <Badge variant="outline" className={`text-[8px] ${m.status === "good" ? "text-success border-success/30" : "text-warning border-warning/30"}`}>
                {m.status === "good" ? "PASS" : "IMPROVE"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Optimization Pipeline */}
    <Card className="bg-card/60 border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2"><Zap className="w-4 h-4 text-primary" /> Optimization Pipeline</CardTitle>
          <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1"><RefreshCw className="w-3 h-3" /> Re-scan All</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {optimizationTasks.map((t, i) => (
            <motion.div key={t.task} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 p-3 rounded-lg bg-background/60 border border-border/20"
            >
              {t.status === "complete" ? (
                <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
              ) : t.status === "active" ? (
                <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-muted-foreground/30 shrink-0" />
              )}
              <span className="text-xs text-foreground flex-1">{t.task}</span>
              <Badge variant="outline" className="text-[9px] text-muted-foreground">{t.savings}</Badge>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>

    {/* Asset Analysis */}
    <Card className="bg-card/60 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2"><Image className="w-4 h-4 text-primary" /> Asset Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Images", original: "12.4 MB", optimized: "3.1 MB", pct: 75 },
            { label: "Scripts", original: "890 KB", optimized: "210 KB", pct: 76 },
            { label: "Stylesheets", original: "340 KB", optimized: "48 KB", pct: 86 },
          ].map((a) => (
            <div key={a.label} className="space-y-2">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{a.label}</span>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground line-through">{a.original}</span>
                <ArrowRight className="w-3 h-3 text-success" />
                <span className="text-success font-medium">{a.optimized}</span>
              </div>
              <Progress value={a.pct} className="h-1" />
              <span className="text-[9px] text-muted-foreground">{a.pct}% reduction</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

export default ForgeOptimize;
