import { motion } from "framer-motion";
import { User, Shield, Briefcase, Plane, Heart, Home, Handshake, Building } from "lucide-react";
import { Check } from "lucide-react";

const roles = [
  { id: "uhnw", icon: User, label: "UHNW Individual", desc: "For private clients managing personal or family needs." },
  { id: "family_office", icon: Shield, label: "Family Office", desc: "For multi-disciplinary teams managing UHNW households." },
  { id: "executive", icon: Briefcase, label: "Executive", desc: "For leaders requiring precision support across travel and operations." },
  { id: "aviation", icon: Plane, label: "Aviation Buyer/Seller", desc: "For aircraft acquisition, charter, and fleet operations." },
  { id: "medical", icon: Heart, label: "Medical Traveler", desc: "For clients seeking diagnostics, surgery, or wellness programs." },
  { id: "household", icon: Home, label: "Household Manager", desc: "For estate and household operations." },
  { id: "partner", icon: Handshake, label: "Partner / Vendor", desc: "For aviation brokers, clinics, staffing agencies, and hotels." },
  { id: "private_office", icon: Building, label: "Private Office", desc: "For internal teams managing UHNW workflows." },
];

interface Props {
  selectedRole: string | null;
  onSelectRole: (id: string) => void;
}

const OnboardingRoles = ({ selectedRole, onSelectRole }: Props) => (
  <div>
    {/* Header */}
    <div className="mb-12">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="font-body text-xs tracking-[0.3em] uppercase text-gold-soft/60 mb-4"
      >
        Step 1 of 7
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="font-display text-3xl sm:text-4xl md:text-[48px] font-medium text-foreground mb-3 leading-tight"
      >
        Tell us who you are.
      </motion.h2>
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-16 h-px bg-primary/60 origin-left mb-4"
      />
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="font-body text-base text-gold-soft/70"
      >
        This helps Quantus V2+ calibrate your experience.
      </motion.p>
    </div>

    {/* 2-Column Role Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
      {roles.map((role, i) => {
        const isSelected = selectedRole === role.id;
        const hasSelection = !!selectedRole;
        return (
          <motion.button
            key={role.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
            onClick={() => onSelectRole(role.id)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            className={`relative text-left p-6 rounded-xl border backdrop-blur-sm transition-all duration-500 group ${
              isSelected
                ? "border-primary/60 bg-primary/[0.06] gold-glow"
                : hasSelection
                  ? "border-border/40 bg-card/30 opacity-60 hover:opacity-90 hover:border-gold-soft/30"
                  : "border-gold-soft/15 bg-card/40 hover:border-gold-soft/30 hover:bg-card/60"
            }`}
          >
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-4 right-4 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center"
              >
                <Check size={12} className="text-primary" strokeWidth={2.5} />
              </motion.div>
            )}
            <motion.div
              animate={isSelected ? { y: -4 } : { y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <role.icon
                className={`w-5 h-5 mb-3 transition-colors duration-300 ${
                  isSelected ? "text-primary" : "text-gold-soft/50 group-hover:text-gold-soft/80"
                }`}
                strokeWidth={1.5}
              />
            </motion.div>
            <h3 className="font-body text-sm font-medium text-foreground mb-1">{role.label}</h3>
            <p className="font-body text-xs text-muted-foreground leading-relaxed">{role.desc}</p>
          </motion.button>
        );
      })}
    </div>
  </div>
);

export default OnboardingRoles;
