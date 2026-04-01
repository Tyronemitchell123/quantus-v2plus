import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Hotel, Search, AlertTriangle, Terminal, Loader2, CheckCircle, XCircle,
  ArrowLeftRight, Tag, Gift, TrendingDown, Shield, Zap,
} from "lucide-react";
import HospitalityLiveDeals from "./HospitalityLiveDeals";

type ParityResult = {
  success: boolean;
  parity?: {
    hotel_name: string;
    room_type: string;
    currency: string;
    direct_price: number;
    ota_price: number;
    price_diff: number;
    price_diff_pct: number;
    is_leaking: boolean;
    direct_available: string;
    ota_available: string;
    direct_perks: string[];
    ota_perks: string[];
  };
  recovery?: {
    promo_code: string;
    matched_price: number;
    bonus_perk: string;
    projected_commission: number;
    ai_popup_message?: string;
  } | null;
  logs?: string[];
  error?: string;
};

const HospitalityScanPanel = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ParityResult | null>(null);
  const [liveLogs, setLiveLogs] = useState<string[]>([]);
  const [directUrl, setDirectUrl] = useState("https://www.corinthia.com/london");
  const [otaUrl, setOtaUrl] = useState("https://www.booking.com/hotel/gb/corinthia-london.html");
  const [checkIn, setCheckIn] = useState("");
  const [nights, setNights] = useState(2);

  const startScan = async () => {
    setIsScanning(true);
    setResult(null);
    setLiveLogs(["[INIT] Starting Parity Shield...", `[DIRECT] ${directUrl}`, `[OTA] ${otaUrl}`]);

    try {
      const { data, error } = await supabase.functions.invoke("hospitality-parity-check", {
        body: { direct_url: directUrl, ota_url: otaUrl, check_in: checkIn, nights, guests: 2 },
      });
      if (error) throw error;
      setResult(data);
      if (data.logs) setLiveLogs(data.logs);
    } catch (err: any) {
      const errorMsg = err.message || "Parity check failed";
      setResult({ success: false, error: errorMsg });
      setLiveLogs((prev) => [...prev, `[ERROR] ${errorMsg}`]);
    } finally {
      setIsScanning(false);
    }
  };

  const fmt = (v: number, c: string) => `${c === "USD" ? "$" : c === "EUR" ? "€" : "£"}${v.toLocaleString()}`;

  return (
    <Tabs defaultValue="scanner" className="space-y-4">
      <TabsList className="bg-card/60 border border-border/30">
        <TabsTrigger value="scanner" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
          <Search className="h-3.5 w-3.5 mr-1.5" /> Parity Scanner
        </TabsTrigger>
        <TabsTrigger value="live" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
          <Shield className="h-3.5 w-3.5 mr-1.5" /> Live Shield
        </TabsTrigger>
      </TabsList>

      <TabsContent value="scanner" className="space-y-4">
        {/* Controls */}
        <div className="glass-card p-4">
          <div className="flex items-center gap-3 mb-3">
            <Hotel size={16} className="text-amber-400" />
            <span className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
              Parity Shield — Rate Leakage Scanner
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="font-body text-[9px] tracking-wider uppercase text-muted-foreground mb-1 block">
                Hotel Direct Website
              </label>
              <input
                type="url"
                value={directUrl}
                onChange={(e) => setDirectUrl(e.target.value)}
                placeholder="https://hotel-website.com"
                className="w-full bg-background/50 border border-border/50 rounded-lg px-3 py-2 text-xs font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
              />
            </div>
            <div>
              <label className="font-body text-[9px] tracking-wider uppercase text-muted-foreground mb-1 block">
                OTA Listing (Booking.com / Expedia)
              </label>
              <input
                type="url"
                value={otaUrl}
                onChange={(e) => setOtaUrl(e.target.value)}
                placeholder="https://booking.com/hotel/..."
                className="w-full bg-background/50 border border-border/50 rounded-lg px-3 py-2 text-xs font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>

          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="font-body text-[9px] tracking-wider uppercase text-muted-foreground mb-1 block">Check-in</label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full bg-background/50 border border-border/50 rounded-lg px-3 py-2 text-xs font-body text-foreground focus:outline-none focus:border-primary/50"
              />
            </div>
            <div className="w-20">
              <label className="font-body text-[9px] tracking-wider uppercase text-muted-foreground mb-1 block">Nights</label>
              <input
                type="number"
                min={1}
                max={14}
                value={nights}
                onChange={(e) => setNights(Number(e.target.value))}
                className="w-full bg-background/50 border border-border/50 rounded-lg px-3 py-2 text-xs font-body text-foreground focus:outline-none focus:border-primary/50"
              />
            </div>
            <Button onClick={startScan} disabled={isScanning} size="sm" className="gap-2 shrink-0">
              {isScanning ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
              {isScanning ? "Checking..." : "Run Parity Check"}
            </Button>
          </div>

          <p className="font-body text-[9px] text-muted-foreground mt-2">
            Automated every 6 hours. Compares direct vs OTA pricing and generates recovery promos with AI-powered value bundling.
          </p>
        </div>

        {/* Terminal */}
        <AnimatePresence>
          {liveLogs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-card overflow-hidden"
            >
              <div className="flex items-center gap-2 px-4 py-2 border-b border-border/50">
                <Terminal size={12} className="text-amber-400" />
                <span className="font-body text-[9px] tracking-[0.2em] uppercase text-muted-foreground">
                  Live View — Parity Shield
                </span>
                {isScanning && (
                  <span className="relative flex h-2 w-2 ml-auto">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
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
                      : log.includes("⚠️") || log.includes("LEAKAGE") ? "text-amber-400"
                      : log.includes("✅") || log.includes("[COMPLETE]") ? "text-emerald-400"
                      : log.includes("[RECOVERY]") || log.includes("[COMMISSION]") || log.includes("[AI]") ? "text-primary"
                      : "text-muted-foreground"
                    }
                  >
                    {log}
                  </motion.div>
                ))}
                {isScanning && <span className="inline-block w-2 h-3 bg-amber-400 animate-pulse" />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Parity Results */}
        <AnimatePresence>
          {result?.success && result.parity && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              <div className="glass-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <ArrowLeftRight size={14} className="text-foreground" />
                  <span className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                    {result.parity.hotel_name} — {result.parity.room_type}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  <div className="text-center">
                    <p className="font-body text-[9px] uppercase text-muted-foreground mb-1">Direct</p>
                    <p className="font-display text-2xl font-semibold text-foreground">
                      {fmt(result.parity.direct_price, result.parity.currency)}
                    </p>
                    <p className="font-body text-[9px] text-muted-foreground mt-1">{result.parity.direct_available}</p>
                  </div>

                  <div className="text-center">
                    {result.parity.is_leaking ? (
                      <>
                        <TrendingDown size={20} className="mx-auto text-red-400 mb-1" />
                        <p className="font-display text-lg font-bold text-red-400">-{result.parity.price_diff_pct}%</p>
                        <p className="font-body text-[9px] text-red-400">OTA Undercut</p>
                      </>
                    ) : (
                      <>
                        <CheckCircle size={20} className="mx-auto text-emerald-400 mb-1" />
                        <p className="font-display text-lg font-bold text-emerald-400">Parity ✓</p>
                        <p className="font-body text-[9px] text-emerald-400">No leakage</p>
                      </>
                    )}
                  </div>

                  <div className="text-center">
                    <p className="font-body text-[9px] uppercase text-muted-foreground mb-1">OTA</p>
                    <p className={`font-display text-2xl font-semibold ${result.parity.is_leaking ? "text-red-400" : "text-foreground"}`}>
                      {fmt(result.parity.ota_price, result.parity.currency)}
                    </p>
                    <p className="font-body text-[9px] text-muted-foreground mt-1">{result.parity.ota_available}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border/50">
                  <div>
                    <p className="font-body text-[9px] uppercase text-muted-foreground mb-1.5">Direct Perks</p>
                    {result.parity.direct_perks.length > 0 ? (
                      <div className="space-y-1">
                        {result.parity.direct_perks.map((p, i) => (
                          <span key={i} className="inline-block mr-1 mb-1 text-[9px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-body">{p}</span>
                        ))}
                      </div>
                    ) : (
                      <p className="font-body text-[9px] text-muted-foreground">None detected</p>
                    )}
                  </div>
                  <div>
                    <p className="font-body text-[9px] uppercase text-muted-foreground mb-1.5">OTA Perks</p>
                    {result.parity.ota_perks.length > 0 ? (
                      <div className="space-y-1">
                        {result.parity.ota_perks.map((p, i) => (
                          <span key={i} className="inline-block mr-1 mb-1 text-[9px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-body">{p}</span>
                        ))}
                      </div>
                    ) : (
                      <p className="font-body text-[9px] text-muted-foreground">None detected</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Recovery Card */}
              {result.recovery && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-card p-5 border-amber-500/20"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle size={14} className="text-amber-400" />
                    <span className="font-body text-[10px] tracking-[0.2em] uppercase text-amber-400">
                      Leakage Recovery — AI Value Bundle
                    </span>
                  </div>

                  {/* AI Popup Preview */}
                  {result.recovery.ai_popup_message && (
                    <div className="mb-4 p-3 rounded-lg bg-[#D4AF37]/5 border border-[#D4AF37]/20">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Zap className="h-3 w-3 text-[#D4AF37]" />
                        <span className="text-[9px] tracking-[0.1em] uppercase text-[#D4AF37]">AI-Generated Guest Popup</span>
                      </div>
                      <p className="text-xs text-foreground font-mono leading-relaxed">
                        {result.recovery.ai_popup_message}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <Tag size={18} className="text-primary shrink-0" />
                      <div>
                        <p className="font-body text-[9px] uppercase text-muted-foreground">Promo Code</p>
                        <p className="font-mono text-lg font-bold text-primary tracking-wider">{result.recovery.promo_code}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-400/5 border border-emerald-400/20">
                      <Gift size={18} className="text-emerald-400 shrink-0" />
                      <div>
                        <p className="font-body text-[9px] uppercase text-muted-foreground">Bonus Perk</p>
                        <p className="font-body text-sm font-medium text-foreground">{result.recovery.bonus_perk}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-400/5 border border-amber-400/20">
                      <TrendingDown size={18} className="text-amber-400 shrink-0" />
                      <div>
                        <p className="font-body text-[9px] uppercase text-muted-foreground">5% Commission</p>
                        <p className="font-display text-lg font-semibold text-foreground">
                          {fmt(result.recovery.projected_commission, result.parity.currency)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="font-body text-[9px] text-muted-foreground mt-3">
                    Guest pays {fmt(result.recovery.matched_price, result.parity.currency)} (matches OTA) + receives "{result.recovery.bonus_perk}" — driving direct bookings and recovering margin.
                  </p>
                </motion.div>
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
      </TabsContent>

      <TabsContent value="live">
        <HospitalityLiveDeals />
      </TabsContent>
    </Tabs>
  );
};

export default HospitalityScanPanel;
