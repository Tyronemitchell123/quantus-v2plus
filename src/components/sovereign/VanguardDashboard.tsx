import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, Plane, HeartPulse, Brain, Loader2, Zap, Send, Clock, MapPin,
  DollarSign, Shield, Target, Sparkles, AlertTriangle, ChevronRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type VanguardResult = {
  triggered: boolean;
  biometrics: {
    recovery_scores: number[];
    avg_recovery: number;
    stress_index: number;
    status?: string;
  };
  escape_manifest?: {
    flights: { route: string; aircraft: string; price_cents: number; departure: string; duration: string; type: string }[];
    clinics: { clinic: string; city: string; programme: string; price_cents: number; availability: string; waitlist: string }[];
  };
  outreach_draft?: string;
  ai_generated?: boolean;
  ledger?: {
    retainer: string;
    total_asset_value: string;
    success_fee: string;
    total_revenue: string;
  };
};

const BiometricGauge = ({ label, value, max, color, threshold }: { label: string; value: number; max: number; color: string; threshold?: number }) => {
  const pct = Math.round((value / max) * 100);
  const isAlert = threshold !== undefined && value < threshold;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="font-body text-[9px] tracking-wider uppercase text-muted-foreground">{label}</span>
        <span className={`font-display text-xs font-semibold ${isAlert ? "text-destructive" : "text-foreground"}`}>{value}/{max}</span>
      </div>
      <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8 }}
          className={`h-full rounded-full ${isAlert ? "bg-destructive" : color}`}
        />
      </div>
    </div>
  );
};

const VanguardDashboard = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<VanguardResult | null>(null);
  const [clientName, setClientName] = useState("Sterling");
  const [scores, setScores] = useState([35, 38, 32]);
  const [stressIndex, setStressIndex] = useState(9);

  const runProtocol = async () => {
    setScanning(true);
    try {
      const { data, error } = await supabase.functions.invoke("vanguard-protocol", {
        body: {
          client_name: clientName,
          recovery_scores: scores,
          calendar_stress_index: stressIndex,
          preferred_destinations: ["NRT", "BKK", "ZRH"],
          preferred_airports: ["FAB", "TEB"],
        },
      });
      if (error) throw error;
      setResult(data);
      if (data.triggered) {
        toast.success("Bio-Recovery Protocol triggered — Escape Manifest generated");
      } else {
        toast.info("Biometric levels within range. No intervention needed.");
      }
    } catch (err: any) {
      toast.error(err.message || "Protocol failed");
    } finally {
      setScanning(false);
    }
  };

  const fmtPrice = (cents: number) => `$${(cents / 100).toLocaleString("en-US")}`;

  return (
    <div className="space-y-4">
      <Tabs defaultValue="protocol" className="w-full">
        <TabsList className="bg-card border border-border/50">
          <TabsTrigger value="protocol" className="text-xs">Bio-Recovery Protocol</TabsTrigger>
          <TabsTrigger value="ledger" className="text-xs">Vanguard Ledger</TabsTrigger>
        </TabsList>

        <TabsContent value="protocol" className="space-y-4">
          {/* Biometric Input Card */}
          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-primary" />
              <h3 className="font-display text-sm font-semibold text-foreground">Vanguard Tier — Biometric Monitor</h3>
              <span className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded bg-primary/10 text-primary">
                <Shield size={9} />
                <span className="font-body text-[8px] tracking-wider uppercase">Tier-1 Autonomous</span>
              </span>
            </div>

            <p className="font-body text-xs text-muted-foreground">
              Monitors wearable biometrics (Oura/Whoop) and calendar stress. When recovery drops below 40 for 3 days
              and stress exceeds 8/10, the Bio-Recovery Protocol auto-triggers an escape manifest.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-body text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-1 block">Client</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  className="w-full bg-muted/30 border border-border/50 rounded-lg px-3 py-1.5 font-body text-xs text-foreground focus:outline-none focus:border-primary/50"
                />
              </div>
              <div>
                <label className="font-body text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-1 block">Stress Index (0-10)</label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={stressIndex}
                  onChange={e => setStressIndex(Number(e.target.value))}
                  className="w-full bg-muted/30 border border-border/50 rounded-lg px-3 py-1.5 font-body text-xs text-foreground focus:outline-none focus:border-primary/50"
                />
              </div>
            </div>

            {/* Recovery Score Inputs */}
            <div>
              <label className="font-body text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-1 block">Recovery Scores (3 days)</label>
              <div className="flex gap-2">
                {scores.map((s, i) => (
                  <input
                    key={i}
                    type="number"
                    min={0}
                    max={100}
                    value={s}
                    onChange={e => {
                      const newScores = [...scores];
                      newScores[i] = Number(e.target.value);
                      setScores(newScores);
                    }}
                    className="w-full bg-muted/30 border border-border/50 rounded-lg px-3 py-1.5 font-body text-xs text-foreground focus:outline-none focus:border-primary/50 text-center"
                  />
                ))}
              </div>
            </div>

            {/* Live Biometric Gauges */}
            <div className="grid grid-cols-2 gap-3">
              <BiometricGauge label="Avg Recovery" value={Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)} max={100} color="bg-emerald-400" threshold={40} />
              <BiometricGauge label="Stress Index" value={stressIndex} max={10} color="bg-destructive" threshold={undefined} />
            </div>

            {/* Alert Badge */}
            {scores.every(s => s < 40) && stressIndex > 8 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/30"
              >
                <AlertTriangle size={14} className="text-destructive" />
                <span className="font-body text-xs text-destructive font-medium">Burnout Risk Detected — Bio-Recovery Protocol eligible</span>
              </motion.div>
            )}

            <button
              onClick={runProtocol}
              disabled={scanning}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-body text-xs tracking-wider uppercase transition-all duration-300 bg-gradient-to-r from-primary/20 to-destructive/20 border border-primary/30 text-primary hover:border-primary/50 hover:shadow-[0_0_20px_hsl(var(--primary)/0.15)] disabled:opacity-50"
            >
              {scanning ? <Loader2 size={14} className="animate-spin" /> : <Brain size={14} />}
              {scanning ? "Running Protocol…" : "Trigger Bio-Recovery Protocol"}
            </button>
          </div>

          {/* Results */}
          <AnimatePresence>
            {result && (
              <>
                {/* Biometric Summary */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Activity size={13} className={result.triggered ? "text-destructive" : "text-emerald-400"} />
                    <span className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Biometric Assessment</span>
                    <span className={`ml-auto px-2 py-0.5 rounded font-body text-[9px] tracking-wider uppercase ${
                      result.triggered ? "bg-destructive/10 text-destructive" : "bg-emerald-400/10 text-emerald-400"
                    }`}>
                      {result.triggered ? "Burnout Risk" : "Stable"}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-body text-[9px] text-muted-foreground uppercase">Avg Recovery</p>
                      <p className="font-display text-lg font-semibold text-foreground">{result.biometrics.avg_recovery}</p>
                    </div>
                    <div>
                      <p className="font-body text-[9px] text-muted-foreground uppercase">Stress Index</p>
                      <p className="font-display text-lg font-semibold text-foreground">{result.biometrics.stress_index}/10</p>
                    </div>
                    <div>
                      <p className="font-body text-[9px] text-muted-foreground uppercase">3-Day Scores</p>
                      <p className="font-display text-sm text-foreground">{result.biometrics.recovery_scores.join(' → ')}</p>
                    </div>
                  </div>
                </motion.div>

                {/* Escape Manifest */}
                {result.triggered && result.escape_manifest && (
                  <>
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="space-y-2"
                    >
                      <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground flex items-center gap-1">
                        <Plane size={10} /> Escape Manifest — Flights
                      </p>
                      {result.escape_manifest.flights.map((f, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.15 + i * 0.06 }}
                          className="glass-card p-4 flex items-center gap-4"
                        >
                          <div className="p-2 rounded-lg bg-blue-400/10 text-blue-400">
                            <Plane size={14} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-body text-xs text-foreground font-medium">{f.aircraft} — {f.route}</p>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className="font-body text-[10px] text-muted-foreground flex items-center gap-1">
                                <Clock size={9} /> Departs in {f.departure}
                              </span>
                              <span className="font-body text-[10px] text-muted-foreground">{f.duration}</span>
                              <span className="px-1.5 py-0.5 rounded bg-primary/10 font-body text-[8px] text-primary uppercase">{f.type}</span>
                            </div>
                          </div>
                          <p className="font-display text-sm font-semibold text-foreground shrink-0">{fmtPrice(f.price_cents)}</p>
                        </motion.div>
                      ))}
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="space-y-2"
                    >
                      <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground flex items-center gap-1">
                        <HeartPulse size={10} /> Escape Manifest — Clinics
                      </p>
                      {result.escape_manifest.clinics.map((c, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.35 + i * 0.06 }}
                          className="glass-card p-4 flex items-center gap-4"
                        >
                          <div className="p-2 rounded-lg bg-rose-400/10 text-rose-400">
                            <Brain size={14} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-body text-xs text-foreground font-medium">{c.programme}</p>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className="font-body text-[10px] text-muted-foreground flex items-center gap-1">
                                <MapPin size={9} /> {c.clinic}, {c.city}
                              </span>
                              <span className="font-body text-[10px] text-muted-foreground flex items-center gap-1">
                                <Clock size={9} /> {c.availability}
                              </span>
                            </div>
                            <span className="font-body text-[9px] text-muted-foreground">Usually {c.waitlist} waitlist</span>
                          </div>
                          <p className="font-display text-sm font-semibold text-foreground shrink-0">{fmtPrice(c.price_cents)}</p>
                        </motion.div>
                      ))}
                    </motion.div>

                    {/* Sovereign Push Draft */}
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="glass-card p-4 space-y-3"
                    >
                      <div className="flex items-center gap-2">
                        <Send size={13} className="text-primary" />
                        <span className="font-body text-[10px] tracking-[0.2em] uppercase text-primary">Sovereign Push — WhatsApp Draft</span>
                        {result.ai_generated && (
                          <span className="flex items-center gap-1 ml-auto px-2 py-0.5 rounded bg-primary/10 text-primary">
                            <Sparkles size={9} />
                            <span className="font-body text-[8px] tracking-wider uppercase">AI</span>
                          </span>
                        )}
                      </div>
                      <div className="bg-muted/30 rounded-lg p-4 border border-border/30">
                        <p className="font-mono text-[11px] text-foreground/80 leading-relaxed">{result.outreach_draft}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="px-3 py-1 rounded text-[9px] font-body tracking-wider uppercase border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors">
                          Increase Urgency
                        </button>
                        <button className="px-3 py-1 rounded text-[9px] font-body tracking-wider uppercase border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition-colors">
                          Softer Approach
                        </button>
                        <button className="px-3 py-1 rounded text-[9px] font-body tracking-wider uppercase border border-primary/30 text-primary hover:bg-primary/10 transition-colors flex items-center gap-1">
                          <Send size={9} /> Confirm & Send
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}

                {!result.triggered && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="glass-card p-6 text-center"
                  >
                    <Activity size={24} className="mx-auto text-emerald-400 mb-2" />
                    <p className="font-body text-xs text-muted-foreground">Client biometrics within acceptable range. Monitoring continues.</p>
                  </motion.div>
                )}
              </>
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="ledger" className="space-y-4">
          {/* Vanguard Ledger */}
          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <DollarSign size={14} className="text-primary" />
              <h3 className="font-display text-sm font-semibold text-foreground">Vanguard Ledger</h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/20 rounded-lg p-4 text-center">
                <p className="font-body text-[9px] tracking-wider uppercase text-muted-foreground">Monthly Retainer</p>
                <p className="font-display text-xl font-semibold text-primary mt-1">$20,000</p>
                <p className="font-body text-[9px] text-muted-foreground mt-1">Fixed per Vanguard seat</p>
              </div>
              <div className="bg-muted/20 rounded-lg p-4 text-center">
                <p className="font-body text-[9px] tracking-wider uppercase text-muted-foreground">Success Fee Rate</p>
                <p className="font-display text-xl font-semibold text-primary mt-1">5%</p>
                <p className="font-body text-[9px] text-muted-foreground mt-1">Of all recovered assets</p>
              </div>
            </div>

            {result?.ledger && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Current Trigger Revenue</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Asset Value", value: result.ledger.total_asset_value, icon: Target },
                    { label: "Success Fee (5%)", value: result.ledger.success_fee, icon: Zap },
                    { label: "Monthly Retainer", value: result.ledger.retainer, icon: Shield },
                    { label: "Total Revenue", value: result.ledger.total_revenue, icon: DollarSign },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.05 }}
                        className={`rounded-lg p-3 text-center ${
                          item.label === "Total Revenue" ? "bg-primary/5 border border-primary/20" : "bg-muted/20"
                        }`}
                      >
                        <Icon size={12} className={`mx-auto mb-1 ${item.label === "Total Revenue" ? "text-primary" : "text-muted-foreground"}`} />
                        <p className={`font-display text-sm font-semibold ${item.label === "Total Revenue" ? "text-primary" : "text-foreground"}`}>
                          {item.value}
                        </p>
                        <p className="font-body text-[8px] text-muted-foreground uppercase tracking-wider">{item.label}</p>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {!result?.ledger && (
              <p className="font-body text-xs text-muted-foreground text-center py-3">
                Trigger the Bio-Recovery Protocol to calculate revenue for this interaction.
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VanguardDashboard;
