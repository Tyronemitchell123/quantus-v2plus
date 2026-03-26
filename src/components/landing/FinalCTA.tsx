import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const FinalCTA = () => (
  <section className="relative py-32 sm:py-40 overflow-hidden bg-background">
    {/* Animated gold line */}
    <motion.div
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
      className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent origin-left"
    />

    <div className="relative z-10 container mx-auto px-6 text-center max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium leading-tight mb-4 text-foreground">
          Your world.
          <br />
          <span className="italic text-primary">Orchestrated.</span>
        </h2>
        <p className="font-body text-muted-foreground mb-10 text-base leading-relaxed">
          Experience the future of ultra-premium service orchestration.
        </p>
        <Link
          to="/auth"
          className="inline-flex items-center gap-2 px-10 py-4 font-body text-xs font-medium tracking-[0.3em] uppercase bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-500 gold-glow"
        >
          Enter the Ecosystem
          <ArrowRight size={14} />
        </Link>
      </motion.div>
    </div>
  </section>
);

export default FinalCTA;
