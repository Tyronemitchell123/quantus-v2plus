import { motion } from "framer-motion";
import { Plane, Heart, Users, Globe, Truck, Handshake, Check } from "lucide-react";

const modules = [
  { id: "aviation", icon: Plane, title: "Aviation", desc: "Aircraft sourcing and valuation." },
  { id: "medical", icon: Heart, title: "Medical & Wellness", desc: "Clinic matching and longevity." },
  { id: "staffing", icon: Users, title: "Staffing", desc: "Household and estate personnel." },
  { id: "lifestyle", icon: Globe, title: "Lifestyle", desc: "Ultra-luxury travel and experiences." },
  { id: "logistics", icon: Truck, title: "Logistics", desc: "Dispatch and fleet management." },
  { id: "partnerships", icon: Handshake, title: "Partnerships", desc: "Revenue-share and licensing." },
];

interface Props {
  selectedModules: string[];
  onToggleModule: (id: string) => void;
}

const OnboardingModules = ({ selectedModules, onToggleModule }: Props) => (
  <div>
    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-body text-xs tracking-[0.3em] uppercase text-gold-soft/60 mb-4">
      Step 3 of 7
    </motion.p>
    <motion.h2
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="font-display text-3xl sm:text-4xl font-medium text-foreground mb-3"
    >
      Select your modules.
    </motion.h2>
    <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.3, duration: 0.8 }} className="w-16 h-px bg-primary/60 origin-left mb-10" />

    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {modules.map((mod, i) => {
        const active = selectedModules.includes(mod.id);
        return (
          <motion.button
            key={mod.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.08 }}
            onClick={() => onToggleModule(mod.id)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            className={`text-left p-6 rounded-xl border backdrop-blur-sm transition-all duration-500 relative group ${
              active
                ? "border-primary/50 bg-primary/[0.06] gold-glow"
                : "border-gold-soft/15 bg-card/40 hover:border-gold-soft/30"
            }`}
          >
            {active && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                <Check size={12} className="text-primary" strokeWidth={2.5} />
              </motion.div>
            )}
            <mod.icon className={`w-5 h-5 mb-3 transition-colors ${active ? "text-primary" : "text-gold-soft/50 group-hover:text-gold-soft/80"}`} strokeWidth={1.5} />
            <h3 className="font-body text-sm font-medium text-foreground mb-1">{mod.title}</h3>
            <p className="font-body text-xs text-muted-foreground">{mod.desc}</p>
          </motion.button>
        );
      })}
    </div>
  </div>
);

export default OnboardingModules;
