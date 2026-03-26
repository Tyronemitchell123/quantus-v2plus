import { motion } from "framer-motion";

interface Props {
  onContinue: () => void;
}

const OnboardingWelcome = ({ onContinue }: Props) => (
  <div className="text-center">
    <motion.div
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ delay: 0.3, duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
      className="w-full h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent mb-16"
    />
    <motion.h1
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.8 }}
      className="font-display text-4xl sm:text-5xl md:text-6xl font-medium text-foreground mb-4"
    >
      Welcome to <span className="text-gold-gradient">Quantus A.I</span>
    </motion.h1>
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.9, duration: 0.6 }}
      className="font-display text-lg italic text-gold-soft/70 mb-14"
    >
      Your world is now orchestrated.
    </motion.p>
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.5 }}
      onClick={onContinue}
      className="px-10 py-4 bg-primary text-primary-foreground font-body text-xs tracking-[0.3em] uppercase rounded-xl hover:brightness-110 transition-all duration-300 gold-glow"
    >
      Begin Onboarding
    </motion.button>
  </div>
);

export default OnboardingWelcome;
