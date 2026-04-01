import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Stethoscope, Search, AlertTriangle, Terminal, Loader2, CheckCircle, XCircle, Heart, Zap,
} from "lucide-react";
import MedicalLiveDeals from "./MedicalLiveDeals";

type ScanResult = {
  success: boolean;
  summary?: {
    total_scanned: number;
    new_leads: number;
    high_priority: number;
    total_lost_revenue: number;
  };
  high_priority_alerts?: string[];
  logs?: string[];
  error?: string;
};

const MedicalScanPanel = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [liveLogs, setLiveLogs] = useState<string[]>([]);
  const [targetUrl, setTargetUrl] = useState("https://www.nexhealth.com");

  const startScan = async () => {
    setIsScanning(true);
    setResult(null);
    setLiveLogs(["[INIT] Starting Medical No-Show Scanner...", `[TARGET] ${targetUrl}`]);

    try {
      const { data, error } = await supabase.functions.invoke("medical-noshow-scan", {
        body: { target_url: targetUrl },
      });

      if (error) throw error;

      setResult(data);
      if (data.logs) setLiveLogs(data.logs);
    } catch (err: any) {
      const errorMsg = err.message || "Scan failed";
      setResult({ success: false, error: errorMsg });
      setLiveLogs((prev) => [...prev, `[ERROR] ${errorMsg}`]);
    } finally {
      setIsScanning(false);
    }
  };

  const formatCurrency = (v: number) => `$${v.toLocaleString("en-US")}`;

  return (
    <Tabs defaultValue="scanner" className="space-y-4">
      <TabsList className="bg-card/60 border border-border/30">
        <TabsTrigger value="scanner" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
          <Search className="h-3.5 w-3.5 mr-1.5" /> CRM Scanner
        </TabsTrigger>
        <TabsTrigger value="recoveries" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
          <Heart className="h-3.5 w-3.5 mr-1.5" /> Live Recoveries
        </TabsTrigger>
      </TabsList>

      <TabsContent value="scanner" className="space-y-4">
        {/* Scan Controls */}
        <div className="glass-card p-4">
          <div className="flex items-center gap-3 mb-3">
            <Stethoscope size={16} className="text-emerald-400" />
            <span className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
              Medical No-Show Recovery Scanner
            </span>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="url"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="CRM Portal URL..."
              className="flex-1 bg-background/50 border border-border/50 rounded-lg px-3 py-2 text-xs font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500/50"
            />
            <Button
              onClick={startScan}
              disabled={isScanning}
              size="sm"
              className="gap-2 shrink-0"
            >
              {isScanning ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Search size={14} />
              )}
              {isScanning ? "Scanning..." : "Check No-Shows"}
            </Button>
          </div>

          <p className="font-body text-[9px] text-muted-foreground mt-2">
            Scans CRM portals for ghosted appointments. Filters: IMPLANT, SURGERY, INVISALIGN, LASIK. Scheduled daily at 08:00.
          </p>
        </div>

        {/* Live Terminal */}
        <AnimatePresence>
          {liveLogs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-card overflow-hidden"
            >
              <div className="flex items-center gap-2 px-4 py-2 border-b border-border/50">
                <Terminal size={12} className="text-emerald-400" />
                <span className="font-body text-[9px] tracking-[0.2em] uppercase text-muted-foreground">
                  Live View — Firecrawl Scanner
                </span>
                {isScanning && (
                  <span className="relative flex h-2 w-2 ml-auto">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                )}
              </div>
              <div className="p-4 max-h-48 overflow-y-auto font-mono text-[10px] space-y-0.5 bg-background/80">
                {liveLogs.map((log, i) => {
                  const isError = log.includes("[ERROR]");
                  const isHighPriority = log.includes("HIGH PRIORITY") || log.includes("🔴");
                  const isComplete = log.includes("[COMPLETE]");
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className={
                        isError
                          ? "text-red-400"
                          : isHighPriority
                          ? "text-amber-400"
                          : isComplete
                          ? "text-emerald-400"
                          : "text-muted-foreground"
                      }
                    >
                      {log}
                    </motion.div>
                  );
                })}
                {isScanning && (
                  <span className="inline-block w-2 h-3 bg-emerald-400 animate-pulse" />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Summary */}
        <AnimatePresence>
          {result?.success && result.summary && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: "Appointments Scanned", value: String(result.summary.total_scanned), icon: Stethoscope, color: "text-emerald-400" },
                  { label: "New Ghosted Leads", value: String(result.summary.new_leads), icon: XCircle, color: "text-red-400" },
                  { label: "High Priority (>$3k)", value: String(result.summary.high_priority), icon: AlertTriangle, color: "text-amber-400" },
                  { label: "Total Lost Revenue", value: formatCurrency(result.summary.total_lost_revenue), icon: CheckCircle, color: "text-primary" },
                ].map((kpi) => (
                  <div key={kpi.label} className="glass-card p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <kpi.icon size={12} className={kpi.color} />
                      <span className="font-body text-[8px] tracking-[0.15em] uppercase text-muted-foreground">
                        {kpi.label}
                      </span>
                    </div>
                    <p className="font-display text-lg font-semibold text-foreground">{kpi.value}</p>
                  </div>
                ))}
              </div>

              {result.high_priority_alerts && result.high_priority_alerts.length > 0 && (
                <div className="glass-card p-4 border-amber-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={14} className="text-amber-400" />
                    <span className="font-body text-[10px] tracking-[0.2em] uppercase text-amber-400">
                      LTV Risk Alerts
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {result.high_priority_alerts.map((alert, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 p-2 rounded-lg bg-amber-400/5 border border-amber-400/10"
                      >
                        <span className="font-body text-[10px] text-foreground">{alert}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error State */}
        {result && !result.success && (
          <div className="glass-card p-4 border-destructive/30">
            <div className="flex items-center gap-2">
              <XCircle size={14} className="text-destructive" />
              <span className="font-body text-xs text-destructive">{result.error}</span>
            </div>
          </div>
        )}
      </TabsContent>

      <TabsContent value="recoveries">
        <MedicalLiveDeals />
      </TabsContent>
    </Tabs>
  );
};

export default MedicalScanPanel;
