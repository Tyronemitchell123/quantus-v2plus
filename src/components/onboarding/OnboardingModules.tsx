import { motion } from "framer-motion";
import { Plane, Heart, Users, Globe, Truck, Handshake, Check } from "lucide-react";

const modules = [
  { id: "aviation", icon: Plane, title: "Aviation Intelligence", desc: "Aircraft sourcing, charter, acquisition, and fleet operations." },
  { id: "medical", icon: Heart, title: "Medical & Wellness", desc: "Diagnostics, surgery, longevity, and wellness travel." },
  { id: "staffing", icon: Users, title: "UHNW Staffing", desc: "Household staff, estate management, private office roles." },
  { id: "lifestyle", icon: Globe, title: "Lifestyle & Travel", desc: "Hotels, villas, yachts, experiences, itineraries." },
  { id: "logistics", icon: Truck, title: "Logistics & Recovery", desc: "Vehicle recovery, dispatch, routing, compliance." },
  { id: "partnerships", icon: Handshake, title: "Partnerships", desc: "Vendor network access across aviation, medical, staffing, and travel." },
];

interface Props {
  selectedModules: string[];
  onToggleModule: (id: string) => void;
}

const OnboardingModules = ({ selectedModules, onToggleModule }: Props) => {
  const selectAll = () => {
    const allIds = modules.map(m => m.id);
    const allSelected = allIds.every(id => selectedModules.includes(id));
    if (allSelected) {
      allIds.forEach(id => { if (selectedModules.includes(id)) onToggleModule(id); });
    } else {
      allIds.forEach(id => { if (!selectedModules.includes(id)) onToggleModule(id); });
    }
  };

  const allSelected = modules.every(m => selectedModules.includes(m.id));

  return (
    <div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-body text-xs tracking-[0.3em] uppercase text-gold-soft/60 mb-4">
        Step 3 of 7
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="font-display text-3xl sm:text-4xl font-medium text-foreground mb-3 leading-tight"
      >
        Which capabilities would you like to activate?
      </motion.h2>
      <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="w-16 h-px bg-primary/60 origin-left mb-3" />
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="font-body text-base text-gold-soft/70 mb-8"
      >
        Quantus V2+ adapts its intelligence based on the modules you select.
      </motion.p>

      {/* Select All / Skip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
        className="flex items-center justify-between mb-6"
      >
        <button
          onClick={selectAll}
          className={`px-5 py-2 rounded-lg border font-body text-xs tracking-[0.15em] uppercase transition-all duration-300 ${
            allSelected
              ? "border-primary/50 bg-primary/10 text-primary"
              : "border-gold-soft/20 text-gold-soft/50 hover:border-gold-soft/40 hover:text-gold-soft/80"
          }`}
        >
          {allSelected ? "Deselect All" : "Select All"}
        </button>
        <button className="font-body text-xs tracking-[0.15em] uppercase text-gold-soft/30 hover:text-gold-soft/60 transition-colors duration-300">
          Skip for now
        </button>
      </motion.div>

      {/* Module Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {modules.map((mod, i) => {
          const active = selectedModules.includes(mod.id);
          const hasSelection = selectedModules.length > 0;
          return (
            <motion.button
              key={mod.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
              onClick={() => onToggleModule(mod.id)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className={`relative text-left p-6 rounded-xl border backdrop-blur-sm transition-all duration-500 group min-h-[160px] flex flex-col ${
                active
                  ? "border-primary/60 bg-primary/[0.06] gold-glow"
                  : hasSelection && !active
                    ? "border-border/40 bg-card/30 opacity-70 hover:opacity-100 hover:border-gold-soft/30"
                    : "border-gold-soft/15 bg-card/40 hover:border-gold-soft/30 hover:bg-card/60"
              }`}
            >
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
              <motion.div
                animate={active ? { y: -4 } : { y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <mod.icon
                  className={`w-6 h-6 mb-4 transition-colors duration-300 ${
                    active ? "text-primary" : "text-gold-soft/40 group-hover:text-gold-soft/70"
                  }`}
                  strokeWidth={1.5}
                />
              </motion.div>
              <h3 className="font-body text-sm font-medium text-foreground mb-2">{mod.title}</h3>
              <p className="font-body text-xs text-muted-foreground leading-relaxed flex-1">{mod.desc}</p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default OnboardingModules;
