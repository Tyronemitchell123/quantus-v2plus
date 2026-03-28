import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Compass } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const initSteps = [
  "Calibrating Preferences",
  "Activating Modules",
  "Configuring Privacy Mode",
  "Preparing Vendor Network",
  "Initializing Quantus V2+ Core",
];

interface Props {
  onFinish: () => void;
}

const OnboardingComplete = ({ onFinish }: Props) => {
  const { user } = useAuth();
  const [currentInit, setCurrentInit] = useState(0);
  const [initDone, setInitDone] = useState(false);

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "Client";

  useEffect(() => {
    if (currentInit < initSteps.length) {
      const timer = setTimeout(() => setCurrentInit((c) => c + 1), 1000);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setInitDone(true), 600);
      return () => clearTimeout(timer);
    }
  }, [currentInit]);

  return (
    <div className="text-center max-w-xl mx-auto">
      {/* Gold sweep line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.2, duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent mb-14"
      />

      <AnimatePresence mode="wait">
        {!initDone ? (
          <motion.div key="init" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            {/* Hero text */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="font-display text-3xl sm:text-4xl md:text-5xl font-medium text-foreground mb-3"
            >
              Welcome to <span className="text-gold-gradient">Quantus V2+</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="font-display text-lg italic text-gold-soft/80 mb-12"
            >
              Your world is now orchestrated.
            </motion.p>

            {/* Initialization sequence */}
            <div className="space-y-0 text-left max-w-xs mx-auto">
              {initSteps.map((step, i) => {
                const done = i < currentInit;
                const active = i === currentInit;
                return (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.0 + i * 0.15 }}
                    className={`flex items-center gap-3 py-2.5 transition-all duration-500 ${
                      done ? "opacity-100" : active ? "opacity-80" : "opacity-25"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-500 ${
                      done
                        ? "border-primary bg-primary/20"
                        : active
                          ? "border-primary/60 shadow-[0_0_10px_hsl(var(--gold)/0.3)]"
                          : "border-gold-soft/20"
                    }`}>
                      {done && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 20 }}>
                          <Check size={9} className="text-primary" strokeWidth={3} />
                        </motion.div>
                      )}
                      {active && (
                        <motion.div
                          className="w-1.5 h-1.5 rounded-full bg-primary"
                          animate={{ scale: [1, 1.4, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                      )}
                    </div>
                    <span className={`font-body text-xs tracking-[0.15em] uppercase transition-colors duration-500 ${
                      done ? "text-foreground" : active ? "text-gold-soft/70" : "text-muted-foreground"
                    }`}>
                      {step}
                    </span>
                  </motion.div>
                );
              })}
            </div>

            {/* Progress bar */}
            <div className="mt-8 mx-auto max-w-xs">
              <div className="h-px bg-border/30 relative overflow-hidden rounded-full">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-primary"
                  animate={{ width: `${(currentInit / initSteps.length) * 100}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="ready"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            {/* Personalized welcome */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="font-display text-3xl sm:text-4xl md:text-5xl font-medium text-foreground mb-3"
            >
              Your environment is ready, <span className="text-gold-gradient">{firstName}</span>.
            </motion.h1>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.6, duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="w-24 h-px bg-primary/50 mx-auto mb-4"
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="font-body text-base text-gold-soft/70 mb-14"
            >
              You may now enter your dashboard.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.5 }}
              className="space-y-3 max-w-xs mx-auto"
            >
              <button
                onClick={onFinish}
                className="w-full flex items-center justify-center gap-2.5 py-4 bg-primary text-primary-foreground font-body text-xs tracking-[0.3em] uppercase rounded-xl hover:brightness-110 transition-all duration-300 gold-glow"
              >
                Enter Dashboard
                <ArrowRight size={14} strokeWidth={1.5} />
              </button>
              <button className="w-full flex items-center justify-center gap-2 py-3.5 border border-gold-soft/20 text-gold-soft/60 font-body text-xs tracking-[0.2em] uppercase rounded-xl hover:border-gold-soft/40 hover:text-gold-soft/90 transition-all duration-300">
                <Compass size={14} strokeWidth={1.5} />
                Take a Guided Tour
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OnboardingComplete;
