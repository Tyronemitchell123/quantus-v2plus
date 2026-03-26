import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Plane, Heart, Users, Globe, Truck, Handshake, Shield, MessageSquare, Zap, Eye, Check } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const TOTAL_STEPS = 6;

const roles = [
  { id: "uhnw", label: "UHNW Individual", desc: "Private client seeking orchestrated services." },
  { id: "family_office", label: "Family Office", desc: "Multi-generational wealth management." },
  { id: "executive", label: "Executive", desc: "C-suite requiring operational support." },
  { id: "aviation", label: "Aviation Buyer/Seller", desc: "Aircraft transactions and management." },
  { id: "medical", label: "Medical Traveler", desc: "Seeking world-class medical care." },
  { id: "household", label: "Household Manager", desc: "Estate and staffing operations." },
  { id: "partner", label: "Partner / Vendor", desc: "Service provider joining the ecosystem." },
];

const preferences = [
  { key: "privacy", label: "Privacy Level", options: ["Discreet", "Ultra-Discreet", "Obsidian"] },
  { key: "comms", label: "Communication Style", options: ["Cinematic", "Formal", "Minimal", "Operational"] },
  { key: "urgency", label: "Urgency Profile", options: ["Standard", "Executive", "Immediate"] },
  { key: "risk", label: "Risk Tolerance", options: ["Conservative", "Balanced", "Opportunistic"] },
];

const modules = [
  { id: "aviation", icon: Plane, title: "Aviation", desc: "Aircraft sourcing and valuation." },
  { id: "medical", icon: Heart, title: "Medical & Wellness", desc: "Clinic matching and longevity." },
  { id: "staffing", icon: Users, title: "Staffing", desc: "Household and estate personnel." },
  { id: "lifestyle", icon: Globe, title: "Lifestyle", desc: "Ultra-luxury travel and experiences." },
  { id: "logistics", icon: Truck, title: "Logistics", desc: "Dispatch and fleet management." },
  { id: "partnerships", icon: Handshake, title: "Partnerships", desc: "Revenue-share and licensing." },
];

const tiers = [
  { id: "silver", name: "Silver", price: "£99", features: ["2 active modules", "Standard AI processing", "Email support"] },
  { id: "gold", name: "Gold", price: "£499", features: ["5 active modules", "Priority AI processing", "Dedicated advisor"] },
  { id: "black", name: "Black", price: "£2,500", features: ["All modules", "Real-time AI orchestration", "24/7 private line"] },
  { id: "obsidian", name: "Obsidian", price: "£10,000", features: ["Dedicated AI cluster", "Aviation sourcing", "Private office automation", "Zero-latency response"] },
];

const fadeVariants = {
  enter: { opacity: 0, x: 30 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
};

const Onboarding = () => {
  const [step, setStep] = useState(0); // 0 = welcome
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedPrefs, setSelectedPrefs] = useState<Record<string, string>>({});
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const canContinue = () => {
    if (step === 0) return true; // welcome
    if (step === 1) return !!selectedRole;
    if (step === 2) return Object.keys(selectedPrefs).length >= 2;
    if (step === 3) return selectedModules.length > 0;
    if (step === 4) return !!selectedTier;
    if (step === 5) return true; // finalization
    return true;
  };

  const handleFinish = () => {
    navigate("/dashboard");
  };

  const toggleModule = (id: string) => {
    setSelectedModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/[0.02] rounded-full blur-[150px] pointer-events-none" />

      {/* Progress */}
      {step > 0 && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-50">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`h-0.5 w-8 transition-all duration-500 ${
                i < step ? "bg-primary" : i === step ? "bg-primary/50" : "bg-border"
              }`}
            />
          ))}
        </div>
      )}

      <div className="w-full max-w-3xl mx-6">
        <AnimatePresence mode="wait">
          {/* STEP 0 — Welcome */}
          {step === 0 && (
            <motion.div
              key="welcome"
              variants={fadeVariants} initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.3, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                className="w-full h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent mb-16"
              />
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-medium text-foreground mb-4">
                Welcome to <span className="text-gold-gradient">Quantus A.I</span>
              </h1>
              <p className="font-display text-lg italic text-primary/70 mb-12">
                Your world is now orchestrated.
              </p>
              <button
                onClick={() => setStep(1)}
                className="px-10 py-4 bg-primary text-primary-foreground font-body text-xs tracking-[0.3em] uppercase hover:bg-primary/90 transition-all duration-300 gold-glow"
              >
                Begin Onboarding
              </button>
            </motion.div>
          )}

          {/* STEP 1 — Identity & Role */}
          {step === 1 && (
            <motion.div
              key="identity"
              variants={fadeVariants} initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.4 }}
            >
              <div className="grid lg:grid-cols-2 gap-12 items-start">
                <div>
                  <p className="font-body text-xs tracking-[0.3em] uppercase text-primary/60 mb-4">Step 1</p>
                  <h2 className="font-display text-3xl font-medium text-foreground mb-4">Tell us who you are.</h2>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">
                    Select the role that best describes you. This helps us calibrate your experience.
                  </p>
                </div>
                <div className="space-y-2.5">
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => setSelectedRole(role.id)}
                      className={`w-full text-left p-4 border transition-all duration-300 ${
                        selectedRole === role.id
                          ? "border-primary/40 bg-primary/5 gold-glow"
                          : "border-border hover:border-primary/20"
                      }`}
                    >
                      <span className="font-body text-sm font-medium text-foreground">{role.label}</span>
                      <p className="font-body text-xs text-muted-foreground mt-0.5">{role.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2 — Preferences */}
          {step === 2 && (
            <motion.div
              key="preferences"
              variants={fadeVariants} initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.4 }}
            >
              <p className="font-body text-xs tracking-[0.3em] uppercase text-primary/60 mb-4">Step 2</p>
              <h2 className="font-display text-3xl font-medium text-foreground mb-8">Set your preferences.</h2>
              <div className="space-y-6">
                {preferences.map((pref) => (
                  <div key={pref.key} className="glass-card p-6">
                    <p className="font-body text-xs tracking-[0.2em] uppercase text-primary/60 mb-4">
                      {pref.label}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {pref.options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setSelectedPrefs((p) => ({ ...p, [pref.key]: opt }))}
                          className={`px-4 py-2 font-body text-xs tracking-wider border transition-all duration-300 ${
                            selectedPrefs[pref.key] === opt
                              ? "border-primary/40 bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:border-primary/20"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 3 — Module Selection */}
          {step === 3 && (
            <motion.div
              key="modules"
              variants={fadeVariants} initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.4 }}
            >
              <p className="font-body text-xs tracking-[0.3em] uppercase text-primary/60 mb-4">Step 3</p>
              <h2 className="font-display text-3xl font-medium text-foreground mb-8">Select your modules.</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {modules.map((mod) => {
                  const active = selectedModules.includes(mod.id);
                  return (
                    <button
                      key={mod.id}
                      onClick={() => toggleModule(mod.id)}
                      className={`text-left p-6 border transition-all duration-300 relative ${
                        active
                          ? "border-primary/40 bg-primary/5 gold-glow"
                          : "border-border hover:border-primary/20"
                      }`}
                    >
                      {active && (
                        <div className="absolute top-3 right-3">
                          <Check size={14} className="text-primary" />
                        </div>
                      )}
                      <mod.icon className="w-5 h-5 text-primary mb-3" strokeWidth={1.5} />
                      <h3 className="font-body text-sm font-medium text-foreground mb-1">{mod.title}</h3>
                      <p className="font-body text-xs text-muted-foreground">{mod.desc}</p>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 4 — Membership */}
          {step === 4 && (
            <motion.div
              key="membership"
              variants={fadeVariants} initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.4 }}
            >
              <p className="font-body text-xs tracking-[0.3em] uppercase text-primary/60 mb-4">Step 4</p>
              <h2 className="font-display text-3xl font-medium text-foreground mb-8">Choose your membership.</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {tiers.map((tier) => {
                  const active = selectedTier === tier.id;
                  const isObsidian = tier.id === "obsidian";
                  return (
                    <button
                      key={tier.id}
                      onClick={() => setSelectedTier(tier.id)}
                      className={`text-left p-6 border transition-all duration-500 flex flex-col ${
                        active
                          ? "border-primary/40 bg-primary/5 gold-glow"
                          : isObsidian
                            ? "border-primary/20 hover:border-primary/30"
                            : "border-border hover:border-primary/20"
                      } ${isObsidian ? "sm:scale-[1.02]" : ""}`}
                    >
                      <p className="font-body text-[10px] tracking-[0.25em] uppercase text-primary/60 mb-3">{tier.name}</p>
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
                      <span className={`font-body text-[10px] tracking-wider uppercase text-center py-2 border transition-colors ${
                        active ? "border-primary/40 text-primary" : "border-border text-muted-foreground"
                      }`}>
                        {isObsidian ? "Apply for Obsidian" : "Select"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 5 — Payment / Verification */}
          {step === 5 && (
            <motion.div
              key="payment"
              variants={fadeVariants} initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.4 }}
              className="max-w-md mx-auto"
            >
              <p className="font-body text-xs tracking-[0.3em] uppercase text-primary/60 mb-4">Step 5</p>
              <h2 className="font-display text-3xl font-medium text-foreground mb-8">Verify your details.</h2>
              <div className="glass-card p-8 space-y-4">
                <input
                  type="text" placeholder="Full Name" defaultValue={user?.user_metadata?.full_name || ""}
                  className="w-full bg-background border border-border px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none transition-colors"
                />
                <input
                  type="email" placeholder="Billing Email" defaultValue={user?.email || ""}
                  className="w-full bg-background border border-border px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none transition-colors"
                />
                <input
                  type="text" placeholder="Company (optional)"
                  className="w-full bg-background border border-border px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none transition-colors"
                />
                <div className="luxury-divider my-2" />
                <button className="w-full text-left p-4 border border-border hover:border-primary/20 transition-colors">
                  <p className="font-body text-xs text-muted-foreground">Payment method</p>
                  <p className="font-body text-sm text-foreground mt-1">Add payment details →</p>
                </button>
                <div className="text-center pt-2">
                  <span className="font-body text-[10px] tracking-[0.2em] uppercase text-primary/40 cursor-pointer hover:text-primary/60 transition-colors">
                    Request Private Billing
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 6 — Finalization */}
          {step === 6 && (
            <motion.div
              key="final"
              variants={fadeVariants} initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.2, duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                className="w-full h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent mb-16"
              />
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium text-foreground mb-4">
                Your profile is now complete.
              </h1>
              <p className="font-display text-lg italic text-primary/70 mb-12">
                Quantus A.I is ready to orchestrate your world.
              </p>
              <button
                onClick={handleFinish}
                className="inline-flex items-center gap-2 px-10 py-4 bg-primary text-primary-foreground font-body text-xs tracking-[0.3em] uppercase hover:bg-primary/90 transition-all duration-300 gold-glow"
              >
                Enter Dashboard
                <ArrowRight size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        {step > 0 && step < 6 && (
          <div className="flex justify-between items-center mt-10">
            <button
              onClick={() => setStep((s) => s - 1)}
              className="flex items-center gap-1.5 font-body text-xs tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={12} /> Back
            </button>
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canContinue()}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-primary text-primary-foreground font-body text-xs tracking-[0.2em] uppercase hover:bg-primary/90 transition-all duration-300 disabled:opacity-30 disabled:pointer-events-none"
            >
              Continue <ArrowRight size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
