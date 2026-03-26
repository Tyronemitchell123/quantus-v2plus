import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import heroAbstract from "@/assets/hero-abstract.jpg";

const AboutHero = () => (
  <header className="relative min-h-[85vh] flex items-center overflow-hidden">
    <img
      src={heroAbstract}
      alt=""
      className="absolute inset-0 w-full h-full object-cover"
      width={1920}
      height={1080}
    />
    <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />
    <div className="absolute inset-0 bg-gradient-to-r from-background/50 via-transparent to-background/50" />

    <div className="container mx-auto px-6 relative z-10 py-32">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9 }}
        className="max-w-3xl"
      >
        <p className="text-primary font-body text-xs tracking-[0.4em] uppercase mb-6">
          Est. 2024 — Private Intelligence
        </p>
        <h1 className="font-display text-5xl md:text-7xl font-medium text-foreground leading-[1.1] mb-8">
          Intelligence That{" "}
          <span className="text-gold-gradient italic">Anticipates</span>
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl leading-relaxed mb-10 max-w-2xl font-body">
          Quantus A.I was founded to orchestrate every dimension of ultra-high-net-worth life. Our autonomous systems don't assist — they anticipate, strategize, and execute across every vertical.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            to="/contact"
            className="px-8 py-3.5 font-body text-sm font-medium tracking-widest uppercase bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 inline-flex items-center gap-2"
          >
            Book a Strategy Call <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/enterprise"
            className="px-8 py-3.5 font-body text-sm font-medium tracking-widest uppercase border border-border text-foreground/70 hover:text-foreground hover:border-primary/30 transition-all duration-300"
          >
            Enterprise Solutions
          </Link>
        </div>
      </motion.div>
    </div>
  </header>
);

export default AboutHero;
