import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import ParticleGrid from "@/components/ParticleGrid";
import HomepageHeroVideo from "@/components/HomepageHeroVideo";
import LiveDemoWidget from "@/components/landing/LiveDemoWidget";
import MagneticButton from "@/components/landing/MagneticButton";

const HeroSection = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.7], [0, 60]);
  const lineScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.3]);

  return (
    <motion.section
      ref={heroRef}
      style={{ opacity: heroOpacity }}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background"
    >
      <HomepageHeroVideo />
      <ParticleGrid />

      {/* Jet-window glass reflection at top */}
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-foreground/[0.02] to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background pointer-events-none" />

      {/* Gold vertical line motif — Quantus Ratio */}
      <div className="absolute inset-y-0 left-[8.33%] w-px bg-gradient-to-b from-transparent via-primary/[0.06] to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-[8.33%] w-px bg-gradient-to-b from-transparent via-primary/[0.06] to-transparent pointer-events-none" />

      <motion.div
        style={{ y: heroY }}
        className="relative z-10 container mx-auto px-6 text-center max-w-4xl"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Sovereign label */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="font-body text-[9px] sm:text-[10px] tracking-[0.5em] uppercase text-primary/50 mb-8"
          >
            Autonomous Intelligence Platform
          </motion.p>

          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-[96px] font-semibold leading-[0.95] tracking-wide mb-4">
            <span className="text-gold-gradient">Quantus V2+</span>
          </h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mb-6"
          >
            <span className="text-foreground font-display font-light italic text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
              A.I
            </span>
          </motion.div>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.6, duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="w-20 h-px bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mb-9"
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="font-display text-lg sm:text-xl md:text-2xl italic text-foreground/80 mb-3 leading-relaxed"
          >
            The Intelligence Behind the Extraordinary
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.8 }}
            className="font-body text-sm sm:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed mb-14"
          >
            A sovereign orchestration engine for UHNW clients, private offices, and elite operators.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <MagneticButton strength={0.2}>
              <Link
                to="/auth"
                className="inline-block px-10 py-4 font-body text-[10px] font-medium tracking-[0.35em] uppercase bg-primary text-primary-foreground rounded-xl hover:brightness-110 transition-all duration-500 gold-glow"
              >
                Enter the Platform
              </Link>
            </MagneticButton>
            <LiveDemoWidget />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Animated scroll indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-[7px] tracking-[0.4em] uppercase text-muted-foreground/30 font-body">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-primary/40 to-transparent" />
        </motion.div>
      </motion.div>
    </motion.section>
  );
};

export default HeroSection;
