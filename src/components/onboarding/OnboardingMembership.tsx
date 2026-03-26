import { motion } from "framer-motion";
import { Check } from "lucide-react";

const tiers = [
  {
    id: "silver",
    name: "Silver",
    price: "£1,500",
    borderColor: "border-[hsl(0_0%_75%)]",
    selectedBorder: "border-[hsl(0_0%_75%)]",
    features: [
      "Standard orchestration",
      "Access to 2 modules",
      "Basic vendor network",
      "Standard response times",
    ],
    cta: "Select Silver",
    note: null,
  },
  {
    id: "gold",
    name: "Gold",
    price: "£3,500",
    borderColor: "border-primary/30",
    selectedBorder: "border-primary/60",
    features: [
      "Priority orchestration",
      "Access to 4 modules",
      "Expanded vendor network",
      "Faster response times",
    ],
    cta: "Select Gold",
    note: null,
  },
  {
    id: "black",
    name: "Black",
    price: "£6,500",
    borderColor: "border-primary/25",
    selectedBorder: "border-primary/70",
    features: [
      "High-priority orchestration",
      "All modules unlocked",
      "Elite vendor network",
      "Accelerated workflows",
      "Dedicated AI concierge",
    ],
    cta: "Select Black",
    note: null,
  },
  {
    id: "obsidian",
    name: "Obsidian",
    price: "£10,000",
    borderColor: "border-primary/40",
    selectedBorder: "border-primary",
    features: [
      "Immediate orchestration",
      "All modules + private modules",
      "Ultra-elite vendor network",
      "Human + AI hybrid concierge",
      "Priority medical access",
      "Aviation off-market sourcing",
      "24/7 global response",
    ],
    cta: "Apply for Obsidian",
    note: "Obsidian requires approval.",
  },
];

interface Props {
  selectedTier: string | null;
  onSelectTier: (id: string) => void;
}

const OnboardingMembership = ({ selectedTier, onSelectTier }: Props) => {
  return (
    <div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-body text-xs tracking-[0.3em] uppercase text-gold-soft/60 mb-4">
        Step 4 of 7
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="font-display text-3xl sm:text-4xl font-medium text-foreground mb-3 leading-tight"
      >
        Choose your membership tier.
      </motion.h2>
      <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="w-16 h-px bg-primary/60 origin-left mb-3" />
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="font-body text-base text-gold-soft/70 mb-10"
      >
        Each tier unlocks a different level of orchestration and access.
      </motion.p>

      {/* Desktop: horizontal row, Mobile: vertical stack */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        {tiers.map((tier, i) => {
          const active = selectedTier === tier.id;
          const hasSelection = !!selectedTier;
          const isObsidian = tier.id === "obsidian";
          const isBlack = tier.id === "black";

          return (
            <motion.button
              key={tier.id}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.12, duration: 0.45 }}
              onClick={() => onSelectTier(tier.id)}
              whileHover={{ scale: 1.04, y: -6 }}
              whileTap={{ scale: 0.97 }}
              className={`relative text-left p-6 rounded-xl border backdrop-blur-sm transition-all duration-500 flex flex-col group ${
                active
                  ? `${tier.selectedBorder} bg-primary/[0.06] gold-glow`
                  : hasSelection && !active
                    ? `${tier.borderColor} bg-card/20 opacity-60 hover:opacity-90`
                    : `${tier.borderColor} bg-card/40 hover:bg-card/60`
              } ${isObsidian ? "lg:scale-[1.04] lg:z-10" : ""} ${isBlack ? "lg:translate-y-[-2px]" : ""}`}
            >
              {/* Obsidian shimmer glow */}
              {isObsidian && (
                <div className="absolute inset-0 rounded-xl pointer-events-none overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-transparent to-primary/[0.02]" />
                </div>
              )}

              {/* Selected checkmark */}
              {active && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className="absolute top-4 right-4 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center"
                >
                  <Check size={13} className="text-primary" strokeWidth={2.5} />
                </motion.div>
              )}

              {/* Tier name */}
              <p className={`font-body text-[10px] tracking-[0.35em] uppercase mb-4 transition-colors duration-300 ${
                active ? "text-primary" : "text-gold-soft/40"
              }`}>
                {tier.name}
              </p>

              {/* Price */}
              <div className="mb-5">
                <span className="font-display text-2xl lg:text-[28px] font-medium text-foreground">{tier.price}</span>
                <span className="font-body text-xs text-muted-foreground">/mo</span>
              </div>

              {/* Features */}
              <ul className="flex-1 space-y-2.5 mb-5">
                {tier.features.map((f) => (
                  <li key={f} className="font-body text-[11px] text-muted-foreground flex items-start gap-2 leading-relaxed">
                    <span className={`w-1 h-1 rounded-full mt-1.5 shrink-0 transition-colors duration-300 ${
                      active ? "bg-primary" : "bg-gold-soft/30"
                    }`} />
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <span className={`block font-body text-[10px] tracking-[0.2em] uppercase text-center py-3 rounded-lg border transition-all duration-300 ${
                active
                  ? isObsidian || isBlack
                    ? "border-primary/60 bg-primary text-primary-foreground"
                    : "border-primary/50 text-primary bg-primary/10"
                  : "border-border/50 text-muted-foreground group-hover:border-gold-soft/30"
              }`}>
                {tier.cta}
              </span>

              {/* Obsidian note */}
              {tier.note && (
                <p className="font-display text-[10px] italic text-gold-soft/40 text-center mt-3">
                  {tier.note}
                </p>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default OnboardingMembership;
