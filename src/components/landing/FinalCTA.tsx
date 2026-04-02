import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const FinalCTA = forwardRef<HTMLElement>((_, ref) => (
  <section ref={ref} className="relative py-36 sm:py-44 overflow-hidden bg-background">
    {/* Cinematic vignette */}
    <div className="absolute inset-0 bg-obsidian-vignette pointer-events-none opacity-40" />

    {/* Animated gold line sweep */}
    <motion.div
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
      className="absolute top-1/2 left-0 right-0 sovereign-line origin-left"
    />

    {/* Slow particle wave effect */}
    <motion.div
      animate={{ x: ["-10%", "10%", "-10%"] }}
      transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      className="absolute inset-0 opacity-[0.025]"
      style={{ background: "radial-gradient(ellipse 600px 300px at 50% 50%, hsl(var(--primary)), transparent)" }}
    />

    {/* Vertical ratio lines */}
    <div className="absolute inset-y-0 left-[25%] w-px bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent pointer-events-none" />
    <div className="absolute inset-y-0 right-[25%] w-px bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent pointer-events-none" />

    <div className="relative z-10 container mx-auto px-6 text-center max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-[8px] tracking-[0.6em] uppercase text-primary/30 font-body mb-8"
        >
          Begin Your Sovereign Journey
        </motion.p>

        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium leading-tight mb-4 text-foreground">
          Your world.
          <br />
          <span className="italic text-gold-gradient gold-glow-text">Orchestrated.</span>
        </h2>
        <p className="font-body text-muted-foreground/60 mb-12 text-base leading-relaxed">
          Experience the future of ultra-premium service orchestration.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
          <Link
            to="/auth"
            className="inline-flex items-center gap-3 px-10 py-4 font-body text-[9px] font-medium tracking-[0.35em] uppercase bg-primary text-primary-foreground rounded-xl hover:brightness-110 transition-all duration-700 gold-glow group"
          >
            Start Free — No Card Required
            <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform duration-500" />
          </Link>
          <Link
            to="/pricing"
            className="inline-flex items-center gap-2 px-8 py-4 font-body text-[10px] font-medium tracking-[0.3em] uppercase text-primary/80 hover:text-primary transition-all duration-500"
          >
            Compare Plans
            <ArrowRight size={12} />
          </Link>
        </div>
      </motion.div>
    </div>
  </section>
));

FinalCTA.displayName = "FinalCTA";

export default FinalCTA;
