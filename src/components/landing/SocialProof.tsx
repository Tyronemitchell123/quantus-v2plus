import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Shield, Clock, Globe, Award } from "lucide-react";

const stats = [
  { label: "Deals Orchestrated", value: 2400, suffix: "+", icon: Globe },
  { label: "Countries Served", value: 47, suffix: "", icon: Award },
  { label: "Avg Response Time", value: 12, suffix: "min", icon: Clock },
  { label: "Data Encrypted", value: 100, suffix: "%", icon: Shield },
];

const trustLogos = [
  "ISO 27001", "SOC 2", "GDPR", "PCI DSS", "FCA Regulated",
];

function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <span ref={ref} className="text-3xl sm:text-4xl font-bold tabular-nums text-foreground">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

const SocialProof = () => (
  <section className="py-20 sm:py-28 bg-background relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] via-transparent to-primary/[0.02] pointer-events-none" />

    <div className="container mx-auto px-6 relative z-10">
      {/* Stats counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto mb-16">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.6 }}
            className="text-center"
          >
            <stat.icon className="w-5 h-5 text-primary mx-auto mb-3" strokeWidth={1.5} />
            <AnimatedCounter target={stat.value} suffix={stat.suffix} />
            <p className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground mt-2">
              {stat.label}
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
);

export default SocialProof;
