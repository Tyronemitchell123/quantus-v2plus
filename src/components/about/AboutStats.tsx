import { motion } from "framer-motion";

const stats = [
  { value: "10¹⁸", label: "Quantum Ops / Second", sub: "Zero classical bottlenecks" },
  { value: "99.99%", label: "Uptime SLA", sub: "Enterprise-grade reliability" },
  { value: "$2.4B+", label: "Client Revenue Protected", sub: "Across 14 countries" },
  { value: "0", label: "Human Operators", sub: "Fully autonomous platform" },
];

const AboutStats = () => (
  <section className="py-20 relative overflow-hidden" aria-label="Platform Statistics">
    <div className="absolute inset-0 bg-gradient-to-r from-quantum-cyan/[0.03] via-transparent to-quantum-purple/[0.03]" />
    <div className="container mx-auto px-6 relative z-10">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="text-center"
          >
            <div className="font-display text-4xl md:text-5xl font-bold text-quantum-gradient mb-2">
              {s.value}
            </div>
            <p className="font-display text-foreground font-semibold text-sm mb-1">{s.label}</p>
            <p className="text-muted-foreground text-xs">{s.sub}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default AboutStats;
