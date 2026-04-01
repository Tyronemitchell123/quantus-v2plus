import { useState } from "react";
import { motion } from "framer-motion";
import { Plane, HeartPulse, Loader2, MapPin, Zap, Shield, ArrowRight, Copy, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type CorridorRoute = {
  origin: string;
  origin_label: string;
  destination: string;
  priority: string;
  partner_clinics: string[];
  clinic_count: number;
};

type CorridorResult = {
  success: boolean;
  corridor?: {
    routes: CorridorRoute[];
    total_routes: number;
    high_priority_hubs: { iata: string; label: string }[];
    excluded_hubs: { iata: string; label: string; reason: string }[];
  };
  availability?: { clinic: string; city: string; has_slots: boolean; snippet: string }[];
  outreach_draft?: string;
  commission_model?: Record<string, string>;
};

const GenevaPowerPlay = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<CorridorResult | null>(null);
  const [copied, setCopied] = useState(false);

  const runCorridorScan = async () => {
    setScanning(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("longevity-bridge", {
        body: { mode: "geneva-corridor" },
      });
      if (error) throw error;
      setResult(data);
      toast.success("Geneva corridor scan complete");
    } catch (err: any) {
      toast.error(err.message || "Corridor scan failed");
    } finally {
      setScanning(false);
    }
  };

  const copyDraft = () => {
    if (result?.outreach_draft) {
      navigator.clipboard.writeText(result.outreach_draft);
      setCopied(true);
      toast.success("Draft copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const fmt = (v: string | number) => typeof v === "number" ? `$${v.toLocaleString()}` : v;

  return (
    <div className="space-y-4">
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Plane size={14} className="text-primary" />
            </div>
            <div>
              <h3 className="font-display text-sm font-semibold text-foreground">Geneva Power-Play</h3>
              <p className="font-body text-[10px] text-muted-foreground">London → Swiss Longevity Corridor — April 2026</p>
            </div>
          </div>
          <Button onClick={runCorridorScan} disabled={scanning} size="sm" className="gap-2">
            {scanning ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
            {scanning ? "Scanning…" : "Activate Corridor"}
          </Button>
        </div>

        {/* Hub Priority Strip */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { iata: "FAB", label: "Farnborough", status: "HIGH", color: "text-primary border-primary/30 bg-primary/5" },
            { iata: "BQH", label: "Biggin Hill", status: "HIGH", color: "text-primary border-primary/30 bg-primary/5" },
            { iata: "LTN", label: "Luton", status: "EXCLUDED", color: "text-destructive border-destructive/30 bg-destructive/5" },
          ].map((hub) => (
            <div key={hub.iata} className={`p-2.5 rounded-lg border text-center ${hub.color}`}>
              <p className="font-display text-sm font-bold">{hub.iata}</p>
              <p className="font-body text-[9px] text-muted-foreground">{hub.label}</p>
              <p className={`font-body text-[8px] tracking-[0.2em] uppercase mt-1 ${hub.status === "EXCLUDED" ? "text-destructive" : "text-primary"}`}>
                {hub.status}
              </p>
            </div>
          ))}
        </div>

        <p className="font-body text-[10px] text-muted-foreground flex items-center gap-1.5">
          <Shield size={10} className="text-muted-foreground" />
          LTN excluded unless arbitrage delta &gt;75% — 2026 infrastructure fatigue
        </p>
      </div>

      {/* Results */}
      {result?.success && (
        <>
          {/* Corridor Routes */}
          {result.corridor && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={14} className="text-primary" />
                <span className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                  {result.corridor.total_routes} Active Routes
                </span>
              </div>
              <div className="grid sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {result.corridor.routes.filter(r => r.priority === "high").map((route, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg border border-border/50 bg-card/50">
                    <span className="font-display text-xs font-bold text-foreground">{route.origin}</span>
                    <ArrowRight size={10} className="text-muted-foreground" />
                    <span className="font-display text-xs font-bold text-foreground">{route.destination}</span>
                    <span className="ml-auto font-body text-[9px] text-muted-foreground">
                      {route.clinic_count} clinic{route.clinic_count !== 1 ? "s" : ""}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Availability Scans */}
          {result.availability && result.availability.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <HeartPulse size={14} className="text-rose-400" />
                <span className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Clinic Availability</span>
              </div>
              {result.availability.map((scan, i) => (
                <div key={i} className={`p-3 rounded-lg border mb-2 ${scan.has_slots ? "border-primary/30 bg-primary/5" : "border-border/50"}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-body text-xs text-foreground">{scan.clinic} — {scan.city}</span>
                    {scan.has_slots ? (
                      <span className="font-body text-[9px] text-primary flex items-center gap-1">
                        <Zap size={10} /> Slots Detected
                      </span>
                    ) : (
                      <span className="font-body text-[9px] text-muted-foreground">No openings</span>
                    )}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* AI Outreach Draft */}
          {result.outreach_draft && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-4 border-primary/20">
              <div className="flex items-center justify-between mb-3">
                <span className="font-body text-[10px] tracking-[0.2em] uppercase text-primary">AI Outreach Draft — Executive, Urgent, Bio-Aware</span>
                <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={copyDraft}>
                  {copied ? <CheckCircle size={12} /> : <Copy size={12} />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
              <blockquote className="font-body text-xs text-foreground leading-relaxed italic border-l-2 border-primary/30 pl-4">
                {result.outreach_draft}
              </blockquote>
            </motion.div>
          )}

          {/* Commission Model */}
          {result.commission_model && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-4">
              <span className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Dual-Commission Model</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                {Object.entries(result.commission_model).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <p className="font-body text-[8px] tracking-wider uppercase text-muted-foreground">{key.replace(/_/g, " ")}</p>
                    <p className="font-display text-sm font-semibold text-foreground mt-0.5">{fmt(value)}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default GenevaPowerPlay;
