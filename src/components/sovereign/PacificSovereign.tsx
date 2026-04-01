import { useState } from "react";
import { motion } from "framer-motion";
import { Plane, HeartPulse, Loader2, MapPin, Zap, Shield, ArrowRight, Copy, CheckCircle, Globe, Brain } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type PacificResult = {
  success: boolean;
  mode: string;
  ulr_corridor?: {
    routes: { origin: string; origin_label: string; destination: string; aircraft_priority: string[]; fresh_air_only: string[]; clinics: string[] }[];
    total_routes: number;
  };
  circadian_filter?: { eligible_aircraft: string[]; fresh_air_premium: string };
  availability?: { clinic: string; city: string; has_slots: boolean; snippet: string }[];
  outreach_draft?: string;
  commission_model?: Record<string, string>;
};

const PacificSovereign = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<PacificResult | null>(null);
  const [copied, setCopied] = useState(false);

  const runPacificScan = async () => {
    setScanning(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("longevity-bridge", {
        body: { mode: "pacific-sovereign" },
      });
      if (error) throw error;
      setResult(data);
      toast.success("Pacific Sovereign corridor scan complete");
    } catch (err: any) {
      toast.error(err.message || "Pacific scan failed");
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/20 border border-indigo-500/30">
            <Globe className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Pacific Sovereign</h3>
            <p className="text-xs text-muted-foreground">TEB → NRT Ultra-Long-Range Longevity Arbitrage</p>
          </div>
        </div>
        <Button onClick={runPacificScan} disabled={scanning} variant="outline" className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10">
          {scanning ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
          {scanning ? "Scanning ULR Corridor…" : "Activate Pacific Scan"}
        </Button>
      </div>

      {/* Circadian Filter Badge */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div className="p-4 rounded-lg bg-card/50 border border-indigo-500/20" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex items-center gap-2 mb-2">
            <Plane className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-semibold text-indigo-400 uppercase">Circadian Filter</span>
          </div>
          <p className="text-sm text-muted-foreground">Only ULR aircraft with 100% Fresh Air systems qualify for Vanguard premium.</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {["G650ER", "Global 7500", "G700", "G800"].map(a => (
              <span key={a} className="px-2 py-0.5 text-xs rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">{a}</span>
            ))}
          </div>
        </motion.div>
        <motion.div className="p-4 rounded-lg bg-card/50 border border-rose-500/20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <div className="flex items-center gap-2 mb-2">
            <HeartPulse className="w-4 h-4 text-rose-400" />
            <span className="text-xs font-semibold text-rose-400 uppercase">Peninsula Prevention</span>
          </div>
          <p className="text-sm text-muted-foreground">"Don't Die" protocol — Epigenetic Diagnostic suite. Private medical club access.</p>
          <p className="text-xs text-muted-foreground mt-1">Firecrawl monitoring for cancellation slots</p>
        </motion.div>
        <motion.div className="p-4 rounded-lg bg-card/50 border border-emerald-500/20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400 uppercase">Revenue Target</span>
          </div>
          <p className="text-2xl font-bold text-foreground">$200k+</p>
          <p className="text-xs text-muted-foreground">Per TEB-NRT interaction (flight + diagnostic)</p>
        </motion.div>
      </div>

      {/* Results */}
      {result && (
        <motion.div className="space-y-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* ULR Routes */}
          {result.ulr_corridor && (
            <div className="p-4 rounded-lg bg-card/50 border border-border">
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-400" />
                ULR Corridor Routes ({result.ulr_corridor.total_routes})
              </h4>
              <div className="space-y-2">
                {result.ulr_corridor.routes.map((r, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded bg-background/50 border border-border/50">
                    <div>
                      <span className="text-sm font-mono text-indigo-400">{r.origin}</span>
                      <ArrowRight className="w-3 h-3 inline mx-2 text-muted-foreground" />
                      <span className="text-sm font-mono text-rose-400">{r.destination}</span>
                      <span className="text-xs text-muted-foreground ml-2">({r.origin_label})</span>
                    </div>
                    <div className="flex gap-1">
                      {r.fresh_air_only.slice(0, 3).map(a => (
                        <span key={a} className="px-1.5 py-0.5 text-[10px] rounded bg-indigo-500/15 text-indigo-300">{a}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Clinic Availability */}
          {result.availability && result.availability.length > 0 && (
            <div className="p-4 rounded-lg bg-card/50 border border-border">
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-rose-400" />
                Tokyo Clinic Availability
              </h4>
              <div className="space-y-2">
                {result.availability.map((a, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded bg-background/50 border border-border/50">
                    <div>
                      <p className="text-sm font-medium text-foreground">{a.clinic}</p>
                      <p className="text-xs text-muted-foreground">{a.city}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded font-semibold ${a.has_slots ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                      {a.has_slots ? "SLOT DETECTED" : "MONITORING"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Outreach Draft */}
          {result.outreach_draft && (
            <div className="p-4 rounded-lg bg-card/50 border border-indigo-500/20">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Neural-Performance Draft
                </h4>
                <Button size="sm" variant="ghost" onClick={copyDraft} className="text-xs">
                  {copied ? <CheckCircle className="w-3 h-3 mr-1 text-emerald-400" /> : <Copy className="w-3 h-3 mr-1" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground italic leading-relaxed whitespace-pre-wrap">{result.outreach_draft}</p>
            </div>
          )}

          {/* Commission Model */}
          {result.commission_model && (
            <div className="p-4 rounded-lg bg-card/50 border border-emerald-500/20">
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                Pacific Commission Model
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(result.commission_model).map(([k, v]) => (
                  <div key={k} className="text-center p-2 rounded bg-background/50">
                    <p className="text-lg font-bold text-emerald-400">{v}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">{k.replace(/_/g, " ")}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default PacificSovereign;
