import { useState } from "react";
import { motion } from "framer-motion";
import {
  Brain, Moon, Activity, Plane, HeartPulse, Loader2, Zap, Copy, CheckCircle,
  ArrowRight, Shield, AlertTriangle, TrendingDown,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type VitalityResult = {
  success: boolean;
  triggered: boolean;
  biometrics?: {
    recovery_scores: number[];
    avg_recovery: number;
    stress_index: number;
    status: string;
    deep_sleep?: { scores: number[]; avg_minutes: number; declining: boolean };
    mental_readiness?: { scores: number[]; avg_score: number; all_below_60: boolean };
  };
  escape_manifest?: {
    flights: Array<{
      route: string; aircraft: string; price_cents: number; departure: string;
      duration: string; type: string; cabin_altitude_ft?: number;
      fresh_air_system?: boolean; vanguard_qualified?: boolean;
    }>;
    clinics: Array<{
      clinic: string; city: string; programme: string; price_cents: number;
      availability: string; waitlist: string; protocol?: string;
    }>;
    trigger_type?: string;
  };
  outreach_draft?: string;
  ledger?: Record<string, string | number>;
  message?: string;
};

const corridors = [
  { id: "teb-nrt", label: "TEB → NRT", origin: "Teterboro", dest: "Tokyo", airports: ["TEB"], destinations: ["NRT"] },
  { id: "lhr-bkk", label: "LHR → BKK", origin: "London", dest: "Bangkok", airports: ["FAB", "BQH"], destinations: ["BKK"] },
];

const PacificVitality = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<VitalityResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeCorridor, setActiveCorridor] = useState(corridors[0]);

  const runVitalityScan = async () => {
    setScanning(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("vanguard-protocol", {
        body: {
          trigger_mode: "cognitive_fatigue",
          preferred_airports: activeCorridor.airports,
          preferred_destinations: activeCorridor.destinations,
          deep_sleep_scores: [42, 38, 35, 31],
          mental_readiness_scores: [55, 48, 42, 38],
          recovery_scores: [45, 40, 36],
          calendar_stress_index: 8,
        },
      });
      if (error) throw error;
      setResult(data);
      toast.success(`Pacific Vitality scan complete — ${data.triggered ? "TRIGGER DETECTED" : "No intervention needed"}`);
    } catch (err: any) {
      toast.error(err.message || "Vitality scan failed");
    } finally {
      setScanning(false);
    }
  };

  const copyDraft = () => {
    if (result?.outreach_draft) {
      navigator.clipboard.writeText(result.outreach_draft);
      setCopied(true);
      toast.success("Draft copied");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const fmtCurrency = (cents: number) => `$${(cents / 100).toLocaleString()}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30">
            <Brain className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Pacific Vitality</h3>
            <p className="text-xs text-muted-foreground">Phase 11 — Cognitive Fatigue Biometric Trigger</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {corridors.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCorridor(c)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                activeCorridor.id === c.id
                  ? "bg-cyan-500/15 text-cyan-400 border-cyan-500/30"
                  : "text-muted-foreground border-border/50 hover:border-border"
              }`}
            >
              {c.label}
            </button>
          ))}
          <Button onClick={runVitalityScan} disabled={scanning} variant="outline" className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10">
            {scanning ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
            {scanning ? "Scanning…" : "Run Vitality Scan"}
          </Button>
        </div>
      </div>

      {/* Biometric Trigger Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div className="p-4 rounded-lg bg-card/50 border border-cyan-500/20" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex items-center gap-2 mb-2">
            <Moon className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold text-cyan-400 uppercase">Deep Sleep Monitor</span>
          </div>
          <p className="text-sm text-muted-foreground">4-day declining trend in deep sleep duration triggers Cognitive Fatigue alert.</p>
          <div className="mt-2 flex items-center gap-2">
            <TrendingDown className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs text-amber-400">42 → 38 → 35 → 31 min</span>
          </div>
        </motion.div>
        <motion.div className="p-4 rounded-lg bg-card/50 border border-violet-500/20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-violet-400" />
            <span className="text-xs font-semibold text-violet-400 uppercase">Mental Readiness</span>
          </div>
          <p className="text-sm text-muted-foreground">All scores below 60 for 4 consecutive days with average below 50.</p>
          <div className="mt-2 flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <span className="text-xs text-red-400">55 → 48 → 42 → 38</span>
          </div>
        </motion.div>
        <motion.div className="p-4 rounded-lg bg-card/50 border border-emerald-500/20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400 uppercase">Revenue per Transaction</span>
          </div>
          <p className="text-2xl font-bold text-foreground">$10,000+</p>
          <p className="text-xs text-muted-foreground">Aviation $8k min + Medical $2k min (on retainer)</p>
        </motion.div>
      </div>

      {/* Results */}
      {result && (
        <motion.div className="space-y-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Biometric Status */}
          {result.biometrics && (
            <div className={`p-4 rounded-lg border ${result.triggered ? "bg-red-500/5 border-red-500/30" : "bg-emerald-500/5 border-emerald-500/30"}`}>
              <div className="flex items-center gap-2 mb-3">
                {result.triggered ? <AlertTriangle className="w-4 h-4 text-red-400" /> : <CheckCircle className="w-4 h-4 text-emerald-400" />}
                <span className={`text-sm font-semibold ${result.triggered ? "text-red-400" : "text-emerald-400"}`}>
                  {result.triggered ? `COGNITIVE FATIGUE DETECTED — ${result.biometrics.status?.replace(/_/g, " ").toUpperCase()}` : "Biometrics Normal"}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                <div className="p-2 rounded bg-background/50">
                  <p className="text-lg font-bold text-foreground">{result.biometrics.deep_sleep?.avg_minutes ?? "—"}m</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Avg Deep Sleep</p>
                </div>
                <div className="p-2 rounded bg-background/50">
                  <p className="text-lg font-bold text-foreground">{result.biometrics.mental_readiness?.avg_score ?? "—"}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Mental Readiness</p>
                </div>
                <div className="p-2 rounded bg-background/50">
                  <p className="text-lg font-bold text-foreground">{result.biometrics.avg_recovery}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Avg Recovery</p>
                </div>
                <div className="p-2 rounded bg-background/50">
                  <p className="text-lg font-bold text-foreground">{result.biometrics.stress_index}/10</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Stress Index</p>
                </div>
              </div>
            </div>
          )}

          {/* ULR Flights with Cabin Altitude */}
          {result.escape_manifest?.flights && result.escape_manifest.flights.length > 0 && (
            <div className="p-4 rounded-lg bg-card/50 border border-border">
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Plane className="w-4 h-4 text-cyan-400" />
                ULR Flights — Cabin Altitude Filtered
              </h4>
              <div className="space-y-2">
                {result.escape_manifest.flights.map((f, i) => (
                  <div key={i} className={`flex items-center justify-between p-3 rounded border ${f.vanguard_qualified ? "bg-cyan-500/5 border-cyan-500/20" : "bg-background/50 border-border/50 opacity-60"}`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-cyan-400">{f.route}</span>
                        {f.vanguard_qualified && <span className="px-1.5 py-0.5 text-[9px] rounded bg-cyan-500/20 text-cyan-300 uppercase">Vanguard</span>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {f.aircraft} • {f.duration} • Cabin: {f.cabin_altitude_ft}ft {f.fresh_air_system ? "✓ Fresh Air" : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">{fmtCurrency(f.price_cents)}</p>
                      <p className="text-[10px] text-muted-foreground">{f.type} • {f.departure}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Clinics */}
          {result.escape_manifest?.clinics && result.escape_manifest.clinics.length > 0 && (
            <div className="p-4 rounded-lg bg-card/50 border border-border">
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-rose-400" />
                {result.escape_manifest.trigger_type === "cognitive_fatigue" ? "Neural-Reset & Green Lung Protocols" : "Longevity Clinics"}
              </h4>
              <div className="space-y-2">
                {result.escape_manifest.clinics.map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded bg-background/50 border border-border/50">
                    <div>
                      <p className="text-sm font-medium text-foreground">{c.clinic}</p>
                      <p className="text-xs text-muted-foreground">{c.programme} • {c.city}</p>
                      {c.protocol && (
                        <span className={`inline-block mt-1 px-1.5 py-0.5 text-[9px] rounded uppercase ${c.protocol === "neural-reset" ? "bg-violet-500/20 text-violet-300" : "bg-emerald-500/20 text-emerald-300"}`}>
                          {c.protocol.replace("-", " ")}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">{fmtCurrency(c.price_cents)}</p>
                      <p className="text-[10px] text-muted-foreground">{c.availability} (waitlist: {c.waitlist})</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Outreach Draft */}
          {result.outreach_draft && (
            <div className="p-4 rounded-lg bg-card/50 border border-cyan-500/20">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" /> Sovereign Push Draft
                </h4>
                <Button size="sm" variant="ghost" onClick={copyDraft} className="text-xs">
                  {copied ? <CheckCircle className="w-3 h-3 mr-1 text-emerald-400" /> : <Copy className="w-3 h-3 mr-1" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground italic leading-relaxed whitespace-pre-wrap">{result.outreach_draft}</p>
            </div>
          )}

          {/* Revenue Ledger */}
          {result.ledger && (
            <div className="p-4 rounded-lg bg-card/50 border border-emerald-500/20">
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" /> Revenue Ledger
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(result.ledger).filter(([k]) => !k.includes("_cents")).map(([k, v]) => (
                  <div key={k} className="text-center p-2 rounded bg-background/50">
                    <p className="text-lg font-bold text-emerald-400">{String(v)}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">{k.replace(/_/g, " ")}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!result.triggered && result.message && (
            <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-center">
              <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">{result.message}</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default PacificVitality;
