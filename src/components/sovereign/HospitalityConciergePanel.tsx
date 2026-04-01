import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Hotel, Thermometer, Sun, Wind, UtensilsCrossed, Loader2,
  CheckCircle, Zap, Settings, Play, Shield,
} from "lucide-react";

const PARTNERSHIPS = [
  { name: "Aman", tier: "ultra", logo: "🏯" },
  { name: "Six Senses", tier: "ultra", logo: "🌿" },
  { name: "One&Only", tier: "premium", logo: "💎" },
  { name: "The Peninsula", tier: "ultra", logo: "🏨" },
  { name: "Corinthia", tier: "premium", logo: "🏛️" },
];

const SCENT_OPTIONS = ["Magnesium_Vapor", "Forest_Bath", "Citrus_Cognitive", "Neutral"];
const LUX_OPTIONS = ["Amber_Warm", "Cool_Focus", "Sunset_Dim", "Daylight_Full"];

type ConciergeResult = {
  success: boolean;
  module?: string;
  concierge_id?: string;
  partnerships?: { active: string[]; protocols: any[] };
  bms?: any;
  nutritional_preload?: any;
  trigger?: string;
  bms_executions?: any[];
  guest_briefing?: string;
  commands_total?: number;
  message?: string;
  error?: string;
};

const HospitalityConciergePanel = () => {
  const [activePartners, setActivePartners] = useState<string[]>(["Aman", "Six Senses", "One&Only"]);
  const [temp, setTemp] = useState(18);
  const [lux, setLux] = useState("Amber_Warm");
  const [scent, setScent] = useState("Magnesium_Vapor");
  const [nutritionInstruction, setNutritionInstruction] = useState(
    "Stock minibar with Glycine/Inositol stack + Electrolyte IV prep."
  );
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);
  const [result, setResult] = useState<ConciergeResult | null>(null);
  const [conciergeId, setConciergeId] = useState<string | null>(null);

  const togglePartner = (name: string) => {
    setActivePartners((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]
    );
  };

  const configure = async () => {
    setIsConfiguring(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("hospitality-concierge", {
        body: {
          module: "quantus-hospitality-v1",
          partnerships: activePartners,
          actions: [
            {
              trigger: "Aviation_Landing_Minus_120m",
              task: "BMS_Calibration",
              settings: { temp, lux, scent },
            },
            {
              task: "Nutritional_Preload",
              source: "Biometric_Deficit_Report",
              instruction: nutritionInstruction,
            },
          ],
        },
      });
      if (error) throw error;
      setResult(data);
      if (data?.concierge_id) setConciergeId(data.concierge_id);
    } catch (err: any) {
      setResult({ success: false, error: err.message || "Configuration failed" });
    } finally {
      setIsConfiguring(false);
    }
  };

  const trigger = async () => {
    setIsTriggering(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("hospitality-concierge", {
        body: { action: "trigger", concierge_id: conciergeId },
      });
      if (error) throw error;
      setResult(data);
    } catch (err: any) {
      setResult({ success: false, error: err.message || "Trigger failed" });
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-3 mb-1">
          <Hotel size={16} className="text-amber-400" />
          <span className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
            Hospitality Concierge — BMS Orchestrator
          </span>
        </div>
        <p className="font-body text-[9px] text-muted-foreground">
          Pre-calibrates suite environment 120 minutes before landing. Partnerships, climate, lighting, scent, and nutrition synchronised to biometric profile.
        </p>
      </div>

      {/* Partnership Selection */}
      <div className="glass-card p-4">
        <p className="font-body text-[9px] tracking-[0.15em] uppercase text-muted-foreground mb-3">Active Partnerships</p>
        <div className="flex flex-wrap gap-2">
          {PARTNERSHIPS.map((p) => (
            <button
              key={p.name}
              onClick={() => togglePartner(p.name)}
              className={`px-3 py-1.5 rounded-lg text-xs font-body transition-all border ${
                activePartners.includes(p.name)
                  ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                  : "bg-card/40 border-border/30 text-muted-foreground hover:border-border/60"
              }`}
            >
              {p.logo} {p.name}
              <span className="ml-1.5 text-[8px] uppercase opacity-60">{p.tier}</span>
            </button>
          ))}
        </div>
      </div>

      {/* BMS Settings */}
      <div className="glass-card p-4 space-y-4">
        <p className="font-body text-[9px] tracking-[0.15em] uppercase text-muted-foreground">BMS Calibration — Aviation_Landing_Minus_120m</p>

        {/* Temperature */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Thermometer size={12} className="text-blue-400" />
            <span className="font-body text-[9px] uppercase text-muted-foreground">Temperature</span>
            <span className="ml-auto font-mono text-xs text-foreground">{temp}°C</span>
          </div>
          <input
            type="range"
            min={16}
            max={24}
            value={temp}
            onChange={(e) => setTemp(Number(e.target.value))}
            className="w-full accent-amber-500 h-1"
          />
          <div className="flex justify-between text-[8px] text-muted-foreground font-body mt-0.5">
            <span>16°C</span><span>24°C</span>
          </div>
        </div>

        {/* Lighting */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Sun size={12} className="text-amber-400" />
            <span className="font-body text-[9px] uppercase text-muted-foreground">Lighting Profile</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {LUX_OPTIONS.map((l) => (
              <button
                key={l}
                onClick={() => setLux(l)}
                className={`px-2 py-1.5 rounded-lg text-[10px] font-body border transition-all ${
                  lux === l
                    ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                    : "bg-card/40 border-border/30 text-muted-foreground hover:border-border/60"
                }`}
              >
                {l.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Scent */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Wind size={12} className="text-emerald-400" />
            <span className="font-body text-[9px] uppercase text-muted-foreground">Aromatherapy</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {SCENT_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setScent(s)}
                className={`px-2 py-1.5 rounded-lg text-[10px] font-body border transition-all ${
                  scent === s
                    ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                    : "bg-card/40 border-border/30 text-muted-foreground hover:border-border/60"
                }`}
              >
                {s.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Nutritional Preload */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <UtensilsCrossed size={12} className="text-rose-400" />
          <span className="font-body text-[9px] tracking-[0.15em] uppercase text-muted-foreground">Nutritional Preload</span>
          <span className="ml-auto text-[8px] font-body text-muted-foreground">Source: Biometric_Deficit_Report</span>
        </div>
        <textarea
          value={nutritionInstruction}
          onChange={(e) => setNutritionInstruction(e.target.value)}
          rows={2}
          className="w-full bg-background/50 border border-border/50 rounded-lg px-3 py-2 text-xs font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button onClick={configure} disabled={isConfiguring || activePartners.length === 0} size="sm" className="gap-2 flex-1">
          {isConfiguring ? <Loader2 size={14} className="animate-spin" /> : <Settings size={14} />}
          {isConfiguring ? "Configuring..." : "Save Config"}
        </Button>
        <Button
          onClick={trigger}
          disabled={isTriggering || !conciergeId}
          size="sm"
          variant="outline"
          className="gap-2 flex-1 border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
        >
          {isTriggering ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
          {isTriggering ? "Triggering..." : "Simulate Trigger"}
        </Button>
      </div>

      {/* Results */}
      <AnimatePresence>
        {result?.success && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {/* Config result */}
            {result.partnerships && (
              <div className="glass-card p-4 border-emerald-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle size={14} className="text-emerald-400" />
                  <span className="font-body text-[10px] tracking-[0.15em] uppercase text-emerald-400">
                    Concierge Configured
                  </span>
                </div>
                <div className="space-y-2">
                  {result.partnerships.protocols?.map((p: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-card/40 border border-border/20">
                      <div>
                        <p className="font-body text-xs text-foreground">{p.partner}</p>
                        <p className="font-body text-[9px] text-muted-foreground">
                          BMS: {p.bms_api} • Scent: {p.scent_supported ? "✓" : "✗"} • Nutrition: {p.nutrition_supported ? "✓" : "✗"}
                        </p>
                      </div>
                      <span className={`text-[8px] uppercase px-2 py-0.5 rounded-full ${
                        p.tier === "ultra" ? "bg-amber-500/15 text-amber-400" : "bg-primary/10 text-primary"
                      }`}>
                        {p.tier}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trigger result */}
            {result.bms_executions && (
              <div className="glass-card p-4 border-amber-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <Zap size={14} className="text-amber-400" />
                  <span className="font-body text-[10px] tracking-[0.15em] uppercase text-amber-400">
                    BMS Triggered — {result.commands_total} Commands Sent
                  </span>
                </div>

                {result.guest_briefing && (
                  <div className="mb-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Shield size={10} className="text-amber-400" />
                      <span className="text-[8px] tracking-[0.1em] uppercase text-amber-400">Guest Briefing</span>
                    </div>
                    <p className="text-xs text-foreground font-body leading-relaxed italic">
                      "{result.guest_briefing}"
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  {result.bms_executions.map((exec: any, i: number) => (
                    <div key={i} className="p-2 rounded-lg bg-card/40 border border-border/20">
                      <p className="font-body text-xs text-foreground mb-1">{exec.partner}</p>
                      <div className="space-y-0.5">
                        {exec.commands_sent?.map((cmd: any, j: number) => (
                          <div key={j} className="flex items-center gap-2 text-[9px] font-mono text-muted-foreground">
                            <CheckCircle size={8} className="text-emerald-400 shrink-0" />
                            <span className="text-foreground/60">{cmd.system}:</span>
                            <span>{cmd.command}</span>
                            <span className="ml-auto text-emerald-400">{cmd.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {result && !result.success && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4 border-destructive/30">
            <p className="font-body text-xs text-destructive">{result.error}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HospitalityConciergePanel;
