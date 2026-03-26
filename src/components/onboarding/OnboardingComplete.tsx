import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface Props {
  onFinish: () => void;
}

const OnboardingComplete = ({ onFinish }: Props) => (
  <div className="text-center">
    <motion.div
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ delay: 0.2, duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent mb-16"
    />
    <motion.h1
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.8 }}
      className="font-display text-3xl sm:text-4xl md:text-5xl font-medium text-foreground mb-4"
    >
      Your profile is now complete.
    </motion.h1>
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.0 }}
      className="font-display text-lg italic text-gold-soft/70 mb-14"
    >
      Quantus A.I is ready to orchestrate your world.
    </motion.p>
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.3 }}
      onClick={onFinish}
      className="inline-flex items-center gap-2 px-10 py-4 bg-primary text-primary-foreground font-body text-xs tracking-[0.3em] uppercase rounded-xl hover:brightness-110 transition-all duration-300 gold-glow"
    >
      Enter Dashboard
      <ArrowRight size={14} strokeWidth={1.5} />
    </motion.button>
  </div>
);

export default OnboardingComplete;
