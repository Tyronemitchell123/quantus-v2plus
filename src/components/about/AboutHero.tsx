import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import HeroVideoBackground from "@/components/HeroVideoBackground";

const AboutHero = () => (
  <header className="relative min-h-[85vh] flex items-center overflow-hidden">
    <HeroVideoBackground />
    <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />

    <div className="container mx-auto px-6 relative z-10 py-32">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9 }}
        className="max-w-3xl"
      >
        <p className="text-quantum-cyan font-display text-xs tracking-[0.4em] uppercase mb-6">
          Est. 2024 — Quantum Intelligence
        </p>
        <h1 className="font-display text-5xl md:text-7xl font-bold text-foreground leading-[1.1] mb-8">
          We Build Minds That{" "}
          <span className="text-quantum-gradient">Think in Superposition</span>
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl leading-relaxed mb-10 max-w-2xl">
          QUANTUS AI was founded to break the ceiling of classical intelligence. Our autonomous
          quantum systems don't assist — they anticipate, strategize, and execute across
          parallel realities at the speed of light.
        </p>
        <div className="flex flex-wrap gap-4">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-display">
            <Link to="/contact">
              Book a Strategy Call <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="font-display border-border hover:bg-accent">
            <Link to="/enterprise">Enterprise Solutions</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  </header>
);

export default AboutHero;
