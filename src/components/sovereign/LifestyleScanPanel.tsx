import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Gem, Search, Terminal, Loader2, CheckCircle, XCircle, ShoppingBag, Sparkles,
} from "lucide-react";

type ScanResult = {
  success: boolean;
  deals_found?: number;
  results?: Array<{
    brand: string;
    category: string;
    opportunity: string;
    value: number;
    expiry: string;
  }>;
  logs?: string[];
  error?: string;
};

const LifestyleScanPanel = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [liveLogs, setLiveLogs] = useState<string[]>([]);

  const startScan = async () => {
    setIsScanning(true);
    setResult(null);
    setLiveLogs([
      "[INIT] Starting Lifestyle Arbitrage Scanner...",
      "[TARGET] Luxury affiliates, travel packages, experiential deals",
    ]);

    // Simulate progressive logs
    const logSteps = [
      "[SCAN] Checking Net-a-Porter affiliate pipeline...",
      "[SCAN] Monitoring Farfetch private sale windows...",
      "[SCAN] Scanning luxury travel consolidators...",
      "[MATCH] Found 3 high-margin affiliate opportunities",
      "[SCORE] Filtering by commission rate > 8%...",
      "[COMPLETE] Lifestyle scan complete.",
    ];

    for (const log of logSteps) {
      await new Promise((r) => setTimeout(r, 600));
      setLiveLogs((prev) => [...prev, log]);
    }

    setResult({
      success: true,
      deals_found: 3,
      results: [
        { brand: "Net-a-Porter", category: "Fashion", opportunity: "Private Sale — 12% affiliate commission window", value: 15000, expiry: "48h" },
        { brand: "Aman Resorts", category: "Travel", opportunity: "Last-minute villa — Turks & Caicos (3 nights)", value: 22000, expiry: "24h" },
        { brand: "Cult Beauty", category: "Wellness", opportunity: "Exclusive launch bundle — influencer tier pricing", value: 9500, expiry: "72h" },
      ],
      logs: logSteps,
    });
    setIsScanning(false);
  };

  const formatCurrency = (v: number) => `$${v.toLocaleString("en-US")}`;

  return (
    <Tabs defaultValue="scanner" className="space-y-4">
      <TabsList className="bg-card/60 border border-border/30">
        <TabsTrigger value="scanner" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
          <Search className="h-3.5 w-3.5 mr-1.5" /> Lifestyle Scanner
        </TabsTrigger>
        <TabsTrigger value="opportunities" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
          <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Live Opportunities
        </TabsTrigger>
      </TabsList>

      <TabsContent value="scanner" className="space-y-4">
        {/* Scan Controls */}
        <div className="glass-card p-4">
          <div className="flex items-center gap-3 mb-3">
            <Gem size={16} className="text-purple-400" />
            <span className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
              Luxury Lifestyle Arbitrage Scanner
            </span>
          </div>

          <div className="flex items-center gap-3">
            <p className="flex-1 font-body text-xs text-muted-foreground">
              Scans affiliate networks, luxury travel consolidators, and experiential deal pipelines for high-margin placements.
            </p>
            <Button onClick={startScan} disabled={isScanning} size="sm" className="gap-2 shrink-0">
              {isScanning ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
              {isScanning ? "Scanning..." : "Run Scan"}
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
                <Terminal size={12} className="text-purple-400" />
                <span className="font-body text-[9px] tracking-[0.2em] uppercase text-muted-foreground">
                  Live View — Lifestyle Scanner
                </span>
                {isScanning && (
                  <span className="relative flex h-2 w-2 ml-auto">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
                  </span>
                )}
              </div>
              <div className="p-4 max-h-48 overflow-y-auto font-mono text-[10px] space-y-0.5 bg-background/80">
                {liveLogs.map((log, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={
                      log.includes("[ERROR]") ? "text-red-400"
                        : log.includes("[MATCH]") ? "text-purple-400"
                        : log.includes("[COMPLETE]") ? "text-emerald-400"
                        : "text-muted-foreground"
                    }
                  >
                    {log}
                  </motion.div>
                ))}
                {isScanning && <span className="inline-block w-2 h-3 bg-purple-400 animate-pulse" />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {result?.success && result.results && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {result.results.map((deal, i) => (
                  <div key={i} className="glass-card p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ShoppingBag size={12} className="text-purple-400" />
                      <span className="font-body text-[9px] tracking-[0.15em] uppercase text-muted-foreground">{deal.category}</span>
                      <span className="ml-auto font-body text-[8px] px-1.5 py-0.5 rounded-full bg-purple-400/10 text-purple-400">{deal.expiry}</span>
                    </div>
                    <p className="font-display text-sm font-semibold text-foreground">{deal.brand}</p>
                    <p className="font-body text-[10px] text-muted-foreground mt-1">{deal.opportunity}</p>
                    <p className="font-display text-lg font-semibold text-foreground mt-2">{formatCurrency(deal.value)}</p>
                  </div>
                ))}
              </div>
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
      </TabsContent>

      <TabsContent value="opportunities">
        <div className="glass-card p-6 text-center">
          <Sparkles size={24} className="text-purple-400 mx-auto mb-3" />
          <p className="font-display text-sm font-semibold text-foreground">Live Lifestyle Pipeline</p>
          <p className="font-body text-[10px] text-muted-foreground mt-1">
            Connect affiliate and travel APIs to see real-time luxury deal flow.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default LifestyleScanPanel;
