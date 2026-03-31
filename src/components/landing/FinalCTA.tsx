import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const FinalCTA = forwardRef<HTMLElement>((_, ref) => (
  <section ref={ref} className="relative py-32 sm:py-40 overflow-hidden bg-background">
  <section className="relative py-32 sm:py-40 overflow-hidden bg-background">
    {/* Animated gold line sweep */}
    <motion.div
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
      className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent origin-left"
    />

    {/* Slow particle wave effect */}
    <motion.div
      animate={{ x: ["-10%", "10%", "-10%"] }}
      transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      className="absolute inset-0 opacity-[0.03]"
      style={{ background: "radial-gradient(ellipse 600px 300px at 50% 50%, hsl(var(--primary)), transparent)" }}
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
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 px-10 py-4 font-body text-xs font-medium tracking-[0.3em] uppercase bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-all duration-500 gold-glow"
          >
            Start Free — No Card Required
            <ArrowRight size={14} />
          </Link>
          <Link
            to="/pricing"
            className="inline-flex items-center gap-2 px-8 py-4 font-body text-xs font-medium tracking-[0.3em] uppercase text-primary hover:text-primary/80 transition-all"
          >
            Compare Plans
            <ArrowRight size={14} />
          </Link>
        </div>
      </motion.div>
    </div>
  </section>
));

FinalCTA.displayName = "FinalCTA";

export default FinalCTA;
