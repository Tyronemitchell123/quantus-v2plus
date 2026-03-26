import { motion } from "framer-motion";

const preferences = [
  { key: "privacy", label: "Privacy Level", options: ["Discreet", "Ultra-Discreet", "Obsidian"] },
  { key: "comms", label: "Communication Style", options: ["Cinematic", "Formal", "Minimal", "Operational"] },
  { key: "urgency", label: "Urgency Profile", options: ["Standard", "Executive", "Immediate"] },
  { key: "risk", label: "Risk Tolerance", options: ["Conservative", "Balanced", "Opportunistic"] },
];

interface Props {
  selectedPrefs: Record<string, string>;
  onSelectPref: (key: string, val: string) => void;
}

const OnboardingPreferences = ({ selectedPrefs, onSelectPref }: Props) => (
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
      Set your preferences.
    </motion.h2>
    <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.3, duration: 0.8 }} className="w-16 h-px bg-primary/60 origin-left mb-10" />

    <div className="space-y-6">
      {preferences.map((pref, i) => (
        <motion.div
          key={pref.key}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + i * 0.1 }}
          className="glass-card p-6 rounded-xl"
        >
          <p className="font-body text-[11px] tracking-[0.25em] uppercase text-gold-soft/50 mb-4">{pref.label}</p>
          <div className="flex flex-wrap gap-2.5">
            {pref.options.map((opt) => (
              <button
                key={opt}
                onClick={() => onSelectPref(pref.key, opt)}
                className={`px-5 py-2.5 font-body text-xs tracking-wider rounded-lg border transition-all duration-300 ${
                  selectedPrefs[pref.key] === opt
                    ? "border-primary/50 bg-primary/10 text-primary gold-glow"
                    : "border-border text-muted-foreground hover:border-gold-soft/30 hover:text-foreground"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

export default OnboardingPreferences;
