import { lazy, Suspense, useRef, useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const ParticleGrid = lazy(() => import("@/components/ParticleGrid"));
const HomepageHeroVideo = lazy(() => import("@/components/HomepageHeroVideo"));
const LiveDemoWidget = lazy(() => import("@/components/landing/LiveDemoWidget"));
const MagneticButton = lazy(() => import("@/components/landing/MagneticButton"));

const HeroSection = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const [scrollStyle, setScrollStyle] = useState({ opacity: 1, transform: "translateY(0px)" });

  const handleScroll = useCallback(() => {
    const el = heroRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const totalH = el.offsetHeight;
    if (totalH === 0) return;
    const progress = Math.min(Math.max(-rect.top / totalH, 0), 1);
    const clampedProgress = Math.min(progress / 0.7, 1);
    const opacity = 1 - clampedProgress;
    const y = clampedProgress * 60;
    setScrollStyle({ opacity, transform: `translateY(${y}px)` });
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <section
      ref={heroRef}
      style={{ opacity: scrollStyle.opacity }}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background"
    >
      <Suspense fallback={null}>
        <HomepageHeroVideo />
        <ParticleGrid />
      </Suspense>

      {/* Cinematic vignette overlay */}
      <div className="absolute inset-0 bg-obsidian-vignette pointer-events-none z-[1]" />

      {/* Jet-window glass reflection at top */}
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-foreground/[0.015] to-transparent pointer-events-none z-[2]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background pointer-events-none z-[2]" />

      {/* Gold vertical line motif — Quantus Ratio */}
      <div className="absolute inset-y-0 left-[8.33%] w-px bg-gradient-to-b from-transparent via-primary/[0.04] to-transparent pointer-events-none z-[2]" />
      <div className="absolute inset-y-0 right-[8.33%] w-px bg-gradient-to-b from-transparent via-primary/[0.04] to-transparent pointer-events-none z-[2]" />

      <div
        style={{ transform: scrollStyle.transform }}
        className="relative z-10 container mx-auto px-6 text-center max-w-4xl"
      >
        {/* H1 outside animated wrapper so LCP element is immediately visible */}
        <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-[96px] font-semibold leading-[0.95] tracking-wide mb-4">
          <span className="text-gold-gradient gold-glow-text">Quantus V2+</span>
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Sovereign label */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="font-body text-[8px] sm:text-[9px] tracking-[0.6em] uppercase text-primary/40 mb-10"
          >
            Autonomous Intelligence Platform
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="mb-6"
          >
            <span className="text-foreground/60 font-display font-light italic text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
              A.I
            </span>
          </motion.div>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="w-24 h-px mx-auto mb-10"
            style={{ background: "linear-gradient(90deg, transparent, hsl(var(--gold)/0.6), transparent)" }}
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="font-display text-lg sm:text-xl md:text-2xl italic text-foreground/70 mb-3 leading-relaxed"
          >
            The Intelligence Behind the Extraordinary
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="font-body text-sm sm:text-base text-muted-foreground/60 max-w-lg mx-auto leading-relaxed mb-16"
          >
            A sovereign orchestration engine for UHNW clients, private offices, and elite operators.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-5"
          >
            <Suspense fallback={
              <Link
                to="/auth"
                className="inline-block px-10 py-4 font-body text-[9px] font-medium tracking-[0.4em] uppercase bg-primary text-primary-foreground rounded-xl hover:brightness-110 transition-all duration-700 gold-glow"
              >
                Enter the Platform
              </Link>
            }>
              <MagneticButton strength={0.2}>
                <Link
                  to="/auth"
                  className="inline-block px-10 py-4 font-body text-[9px] font-medium tracking-[0.4em] uppercase bg-primary text-primary-foreground rounded-xl hover:brightness-110 transition-all duration-700 gold-glow"
                >
                  Enter the Platform
                </Link>
              </MagneticButton>
              <LiveDemoWidget />
            </Suspense>
          </motion.div>
        </motion.div>
      </div>

      {/* Animated scroll indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-[7px] tracking-[0.5em] uppercase text-muted-foreground/20 font-body">Scroll</span>
          <div className="w-px h-14 bg-gradient-to-b from-primary/30 to-transparent" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
