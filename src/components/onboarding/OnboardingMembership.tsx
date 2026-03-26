import { motion } from "framer-motion";

const tiers = [
  { id: "silver", name: "Silver", price: "£99", features: ["2 active modules", "Standard AI processing", "Email support"] },
  { id: "gold", name: "Gold", price: "£499", features: ["5 active modules", "Priority AI processing", "Dedicated advisor"] },
  { id: "black", name: "Black", price: "£2,500", features: ["All modules", "Real-time AI orchestration", "24/7 private line"] },
  { id: "obsidian", name: "Obsidian", price: "£10,000", features: ["Dedicated AI cluster", "Aviation sourcing", "Private office automation", "Zero-latency response"] },
];

interface Props {
  selectedTier: string | null;
  onSelectTier: (id: string) => void;
}

const OnboardingMembership = ({ selectedTier, onSelectTier }: Props) => (
  <div>
    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-body text-xs tracking-[0.3em] uppercase text-gold-soft/60 mb-4">
      Step 4 of 7
    </motion.p>
    <motion.h2
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="font-display text-3xl sm:text-4xl font-medium text-foreground mb-3"
    >
      Choose your membership.
    </motion.h2>
    <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.3, duration: 0.8 }} className="w-16 h-px bg-primary/60 origin-left mb-10" />

    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {tiers.map((tier, i) => {
        const active = selectedTier === tier.id;
        const isObsidian = tier.id === "obsidian";
        return (
          <motion.button
            key={tier.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            onClick={() => onSelectTier(tier.id)}
            whileHover={{ scale: 1.03 }}
            className={`text-left p-6 rounded-xl border backdrop-blur-sm transition-all duration-500 flex flex-col ${
              active
                ? "border-primary/50 bg-primary/[0.06] gold-glow"
                : isObsidian
                  ? "border-primary/20 bg-card/50 hover:border-primary/40"
                  : "border-gold-soft/15 bg-card/40 hover:border-gold-soft/30"
            } ${isObsidian ? "sm:scale-[1.02]" : ""}`}
          >
            <p className="font-body text-[10px] tracking-[0.3em] uppercase text-gold-soft/50 mb-3">{tier.name}</p>
            <div className="mb-4">
              <span className="font-display text-2xl font-medium text-foreground">{tier.price}</span>
              <span className="font-body text-xs text-muted-foreground">/mo</span>
            </div>
            <ul className="flex-1 space-y-2 mb-4">
              {tier.features.map((f) => (
                <li key={f} className="font-body text-[11px] text-muted-foreground flex items-start gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-primary/50 mt-1.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <span className={`font-body text-[10px] tracking-[0.2em] uppercase text-center py-2.5 rounded-lg border transition-all duration-300 ${
              active ? "border-primary/50 text-primary bg-primary/5" : "border-border text-muted-foreground"
            }`}>
              {isObsidian ? "Apply for Obsidian" : "Select"}
            </span>
          </motion.button>
        );
      })}
    </div>
  </div>
);

export default OnboardingMembership;
