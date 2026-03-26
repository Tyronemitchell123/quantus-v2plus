import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, MessageSquare, Zap, Eye } from "lucide-react";

const privacyOptions = [
  { id: "discreet", label: "Discreet", desc: "Minimal notifications, low visibility." },
  { id: "private", label: "Private", desc: "Standard UHNW privacy protocols." },
  { id: "obsidian", label: "Obsidian", desc: "Maximum privacy, no external vendor visibility." },
];

const commsOptions = [
  { id: "cinematic", label: "Cinematic", desc: "Calm, elegant, narrative." },
  { id: "formal", label: "Formal", desc: "Executive, concise." },
  { id: "operational", label: "Operational", desc: "Direct, task-driven." },
  { id: "minimal", label: "Minimal", desc: "Ultra-short, no flourish." },
];

const urgencyStops = [
  { id: "standard", label: "Standard", desc: "Balanced pace." },
  { id: "priority", label: "Priority", desc: "Faster vendor cycles." },
  { id: "immediate", label: "Immediate", desc: "High-speed orchestration." },
];

const riskOptions = [
  { id: "conservative", label: "Conservative", desc: "Safety, pedigree, compliance." },
  { id: "balanced", label: "Balanced", desc: "Standard UHNW risk posture." },
  { id: "progressive", label: "Progressive", desc: "Faster decisions, broader options." },
];

interface Props {
  selectedPrefs: Record<string, string>;
  onSelectPref: (key: string, val: string) => void;
}

const OnboardingPreferences = ({ selectedPrefs, onSelectPref }: Props) => {
  const urgencyIndex = urgencyStops.findIndex(s => s.id === selectedPrefs.urgency);

  return (
    <div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-body text-xs tracking-[0.3em] uppercase text-gold-soft/60 mb-4">
        Step 2 of 7
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="font-display text-3xl sm:text-4xl font-medium text-foreground mb-3"
      >
        Let's calibrate your experience.
      </motion.h2>
      <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="w-16 h-px bg-primary/60 origin-left mb-3" />
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="font-body text-base text-gold-soft/70 mb-10"
      >
        Quantus A.I adapts to your preferences in real time.
      </motion.p>

      <div className="grid sm:grid-cols-2 gap-5">
        {/* Privacy Level */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6 rounded-xl"
        >
          <div className="flex items-center gap-2.5 mb-5">
            <Shield className="w-4 h-4 text-primary/70" strokeWidth={1.5} />
            <p className="font-body text-[11px] tracking-[0.25em] uppercase text-gold-soft/50">Privacy Mode</p>
          </div>
          <div className="space-y-2">
            {privacyOptions.map((opt) => {
              const selected = selectedPrefs.privacy === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => onSelectPref("privacy", opt.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-all duration-400 group ${
                    selected
                      ? "border-primary/50 bg-primary/[0.08] gold-glow"
                      : "border-border/50 hover:border-gold-soft/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                      selected ? "border-primary bg-primary" : "border-gold-soft/30"
                    }`}>
                      {selected && <div className="w-1 h-1 rounded-full bg-primary-foreground" />}
                    </div>
                    <span className={`font-body text-sm transition-colors ${selected ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"}`}>{opt.label}</span>
                  </div>
                  {selected && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="font-body text-[11px] text-muted-foreground mt-1.5 ml-6"
                    >
                      {opt.desc}
                    </motion.p>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Communication Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38 }}
          className="glass-card p-6 rounded-xl"
        >
          <div className="flex items-center gap-2.5 mb-5">
            <MessageSquare className="w-4 h-4 text-primary/70" strokeWidth={1.5} />
            <p className="font-body text-[11px] tracking-[0.25em] uppercase text-gold-soft/50">Communication Tone</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {commsOptions.map((opt) => {
              const selected = selectedPrefs.comms === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => onSelectPref("comms", opt.id)}
                  className={`px-4 py-2.5 rounded-lg border font-body text-xs tracking-wider transition-all duration-300 ${
                    selected
                      ? "border-primary/50 bg-primary text-primary-foreground gold-glow"
                      : "border-border/50 text-muted-foreground hover:border-gold-soft/30 hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          {selectedPrefs.comms && (
            <motion.p
              key={selectedPrefs.comms}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-body text-[11px] text-muted-foreground mt-3"
            >
              {commsOptions.find(o => o.id === selectedPrefs.comms)?.desc}
            </motion.p>
          )}
        </motion.div>

        {/* Urgency Profile — Slider */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.46 }}
          className="glass-card p-6 rounded-xl"
        >
          <div className="flex items-center gap-2.5 mb-5">
            <Zap className="w-4 h-4 text-primary/70" strokeWidth={1.5} />
            <p className="font-body text-[11px] tracking-[0.25em] uppercase text-gold-soft/50">Urgency & Response Speed</p>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              {urgencyStops.map((stop, i) => {
                const selected = selectedPrefs.urgency === stop.id;
                return (
                  <button
                    key={stop.id}
                    onClick={() => onSelectPref("urgency", stop.id)}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                      selected ? "border-primary bg-primary shadow-[0_0_12px_hsl(var(--gold)/0.4)]" : "border-gold-soft/30 group-hover:border-gold-soft/60"
                    }`} />
                    <span className={`font-body text-[11px] transition-colors ${selected ? "text-primary" : "text-muted-foreground"}`}>
                      {stop.label}
                    </span>
                  </button>
                );
              })}
            </div>
            {/* Track line */}
            <div className="relative h-px bg-border/50 mx-2">
              {urgencyIndex >= 0 && (
                <motion.div
                  className="absolute top-0 left-0 h-full bg-primary"
                  initial={{ width: "0%" }}
                  animate={{ width: `${urgencyIndex * 50}%` }}
                  transition={{ duration: 0.4 }}
                />
              )}
            </div>
            {selectedPrefs.urgency && (
              <motion.p
                key={selectedPrefs.urgency}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-body text-[11px] text-muted-foreground text-center"
              >
                {urgencyStops.find(s => s.id === selectedPrefs.urgency)?.desc}
              </motion.p>
            )}
          </div>
          <p className="font-body text-[10px] text-gold-soft/30 mt-4 leading-relaxed">
            Quantus adjusts vendor expectations and internal workflows accordingly.
          </p>
        </motion.div>

        {/* Risk Tolerance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.54 }}
          className="glass-card p-6 rounded-xl"
        >
          <div className="flex items-center gap-2.5 mb-5">
            <Eye className="w-4 h-4 text-primary/70" strokeWidth={1.5} />
            <p className="font-body text-[11px] tracking-[0.25em] uppercase text-gold-soft/50">Risk Profile</p>
          </div>
          <div className="space-y-2">
            {riskOptions.map((opt) => {
              const selected = selectedPrefs.risk === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => onSelectPref("risk", opt.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-all duration-400 group ${
                    selected
                      ? "border-primary/50 bg-primary/[0.08] gold-glow"
                      : "border-border/50 hover:border-gold-soft/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                      selected ? "border-primary bg-primary" : "border-gold-soft/30"
                    }`}>
                      {selected && <div className="w-1 h-1 rounded-full bg-primary-foreground" />}
                    </div>
                    <span className={`font-body text-sm transition-colors ${selected ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"}`}>{opt.label}</span>
                  </div>
                  {selected && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="font-body text-[11px] text-muted-foreground mt-1.5 ml-6"
                    >
                      {opt.desc}
                    </motion.p>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OnboardingPreferences;
