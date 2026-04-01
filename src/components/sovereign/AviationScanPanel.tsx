import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plane, Search, AlertTriangle, Terminal, Loader2, CheckCircle, XCircle, Zap, MessageSquare,
} from "lucide-react";
import AviationNegotiationSandbox from "./AviationNegotiationSandbox";

type ScanResult = {
  success: boolean;
  summary?: {
    sources_scanned: number;
    total_flights: number;
    new_leads: number;
    high_priority: number;
    total_value: number;
  };
  high_priority_alerts?: string[];
  logs?: string[];
  error?: string;
};

const DEFAULT_TARGETS = [
  "https://skyaccess.com/listings",
  "https://www.intellijet.co.uk/empty-leg-flights",
];

const AviationScanPanel = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [liveLogs, setLiveLogs] = useState<string[]>([]);
  const [targets, setTargets] = useState(DEFAULT_TARGETS.join("\n"));

  const startScan = async () => {
    setIsScanning(true);
    setResult(null);
    setLiveLogs(["[INIT] Starting Aviation Empty-Leg Scanner...", `[TARGETS] ${targets.split("\n").filter(Boolean).length} sources`]);

    try {
      const { data, error } = await supabase.functions.invoke("aviation-manifest-scan", {
        body: { target_urls: targets.split("\n").map((u) => u.trim()).filter(Boolean) },
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

  const formatCurrency = (v: number) => `£${v.toLocaleString("en-GB")}`;

  return (
    <div className="space-y-4">
      {/* Scan Controls */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-3 mb-3">
          <Plane size={16} className="text-blue-400" />
          <span className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
            Aviation Empty-Leg Manifest Scanner
          </span>
        </div>

        <textarea
          value={targets}
          onChange={(e) => setTargets(e.target.value)}
          placeholder="Enter target URLs (one per line)..."
          rows={2}
          className="w-full bg-background/50 border border-border/50 rounded-lg px-3 py-2 text-xs font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none mb-3"
        />

        <div className="flex items-center justify-between">
          <p className="font-body text-[9px] text-muted-foreground">
            Scrapes empty-leg listings. High priority: &lt;£5k to London/Paris/Dubai/Geneva.
          </p>
          <Button onClick={startScan} disabled={isScanning} size="sm" className="gap-2 shrink-0">
            {isScanning ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            {isScanning ? "Scanning..." : "Scan Manifests"}
          </Button>
        </div>
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
              <Terminal size={12} className="text-blue-400" />
              <span className="font-body text-[9px] tracking-[0.2em] uppercase text-muted-foreground">
                Live View — Firecrawl Aviation Scanner
              </span>
              {isScanning && (
                <span className="relative flex h-2 w-2 ml-auto">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                </span>
              )}
            </div>
            <div className="p-4 max-h-48 overflow-y-auto font-mono text-[10px] space-y-0.5 bg-background/80">
              {liveLogs.map((log, i) => {
                const isError = log.includes("[ERROR]");
                const isHigh = log.includes("HIGH PRIORITY") || log.includes("🔴");
                const isComplete = log.includes("[COMPLETE]");
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={isError ? "text-red-400" : isHigh ? "text-amber-400" : isComplete ? "text-blue-400" : "text-muted-foreground"}
                  >
                    {log}
                  </motion.div>
                );
              })}
              {isScanning && <span className="inline-block w-2 h-3 bg-blue-400 animate-pulse" />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Summary */}
      <AnimatePresence>
        {result?.success && result.summary && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: "Sources Scanned", value: String(result.summary.sources_scanned), icon: Plane, color: "text-blue-400" },
                { label: "Flights Found", value: String(result.summary.total_flights), icon: CheckCircle, color: "text-foreground" },
                { label: "New Leads", value: String(result.summary.new_leads), icon: Zap, color: "text-primary" },
                { label: "High Priority", value: String(result.summary.high_priority), icon: AlertTriangle, color: "text-amber-400" },
              ].map((kpi) => (
                <div key={kpi.label} className="glass-card p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <kpi.icon size={12} className={kpi.color} />
                    <span className="font-body text-[8px] tracking-[0.15em] uppercase text-muted-foreground">{kpi.label}</span>
                  </div>
                  <p className="font-display text-lg font-semibold text-foreground">{kpi.value}</p>
                </div>
              ))}
            </div>

            {result.high_priority_alerts && result.high_priority_alerts.length > 0 && (
              <div className="glass-card p-4 border-blue-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={14} className="text-[hsl(var(--cyber-gold,45,80%,53%))]" />
                  <span className="font-body text-[10px] tracking-[0.2em] uppercase text-amber-400">
                    High-Priority Empty Legs
                  </span>
                </div>
                <div className="space-y-1.5">
                  {result.high_priority_alerts.map((alert, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-blue-400/5 border border-blue-400/10">
                      <span className="font-body text-[10px] text-foreground">{alert}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {result && !result.success && (
        <div className="glass-card p-4 border-destructive/30">
          <div className="flex items-center gap-2">
            <XCircle size={14} className="text-destructive" />
            <span className="font-body text-xs text-destructive">{result.error}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AviationScanPanel;
