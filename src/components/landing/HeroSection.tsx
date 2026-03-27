import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import ParticleGrid from "@/components/ParticleGrid";
import HomepageHeroVideo from "@/components/HomepageHeroVideo";

const HeroSection = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.7], [0, 60]);

  return (
    <motion.section
      ref={heroRef}
      style={{ opacity: heroOpacity }}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background"
    >
      <ParticleGrid />

      {/* Jet-window glass reflection at top */}
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-foreground/[0.02] to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background pointer-events-none" />

      <motion.div
        style={{ y: heroY }}
        className="relative z-10 container mx-auto px-6 text-center max-w-4xl"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-[96px] font-semibold leading-[0.95] tracking-wide mb-6">
            <span className="text-gold-gradient">Quantus</span>
            <br />
            <span className="text-foreground font-light italic text-4xl sm:text-5xl md:text-6xl lg:text-7xl">A.I</span>
          </h1>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="w-16 h-px bg-primary mx-auto mb-8"
          />

          <p className="font-display text-lg sm:text-xl md:text-2xl italic text-foreground/80 mb-4 leading-relaxed">
            The Intelligence Behind the Extraordinary
          </p>
          <p className="font-body text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed mb-12">
            A cinematic, modular, anticipatory ecosystem for UHNW clients, private offices, and elite operators.
          </p>

          <Link
            to="/auth"
            className="inline-block px-10 py-4 font-body text-xs font-medium tracking-[0.3em] uppercase border-2 border-primary text-primary rounded-xl hover:bg-primary hover:text-primary-foreground transition-all duration-500 gold-glow"
          >
            Enter the Ecosystem
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-px h-14 bg-gradient-to-b from-primary/50 to-transparent" />
      </motion.div>
    </motion.section>
  );
};

export default HeroSection;
