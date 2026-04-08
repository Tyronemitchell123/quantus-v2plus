import { forwardRef } from "react";
import { motion } from "framer-motion";
import { Shield, Rocket, Globe, Lock } from "lucide-react";

const highlights = [
  { label: "Launching Soon", sub: "Early access opening", icon: Rocket },
  { label: "9 Verticals", sub: "Aviation to Finance", icon: Globe },
  { label: "Enterprise-Grade", sub: "End-to-end encryption", icon: Lock },
  { label: "GDPR Compliant", sub: "UK & EU data residency", icon: Shield },
];

const trustLogos = [
  "ISO 27001", "SOC 2", "GDPR", "PCI DSS", "FCA Regulated",
];

const SocialProof = forwardRef<HTMLElement>((_, ref) => (
  <section ref={ref} className="py-20 sm:py-28 bg-background relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] via-transparent to-primary/[0.02] pointer-events-none" />

    <div className="container mx-auto px-6 relative z-10">
      {/* Early access badge */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] tracking-[0.3em] uppercase text-primary font-medium">Early Access — Register Your Interest</span>
        </div>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto mb-16">
        {highlights.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.6 }}
            className="text-center"
          >
            <item.icon className="w-5 h-5 text-primary mx-auto mb-3" strokeWidth={1.5} />
            <span className="text-lg sm:text-xl font-bold text-foreground block">
              {item.label}
            </span>
            <p className="font-body text-xs tracking-[0.1em] uppercase text-muted-foreground mt-2">
              {item.sub}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Trust badges */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="flex flex-wrap items-center justify-center gap-4 sm:gap-6"
      >
        {trustLogos.map((badge) => (
          <div
            key={badge}
            className="px-4 py-2 rounded-lg border border-border/40 bg-card/30 backdrop-blur-sm"
          >
            <span className="font-body text-xs tracking-[0.1em] uppercase text-muted-foreground font-medium">
              {badge}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  </section>
));

SocialProof.displayName = "SocialProof";

export default SocialProof;
