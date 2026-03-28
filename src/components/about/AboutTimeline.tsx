import { motion } from "framer-motion";
import { Rocket, Brain, Shield, Globe } from "lucide-react";

const milestones = [
  {
    year: "2024 Q1",
    icon: Rocket,
    title: "Founded",
    desc: "QUANTUS V2+ launches with a singular vision: autonomous quantum intelligence for the enterprise.",
  },
  {
    year: "2024 Q3",
    icon: Brain,
    title: "Quantum Neural Architecture",
    desc: "First proprietary quantum neural network achieves 10¹⁸ ops/sec in controlled benchmarks.",
  },
  {
    year: "2025 Q1",
    icon: Shield,
    title: "Enterprise GA",
    desc: "General availability with post-quantum cryptography, custom SLAs, and private model fine-tuning.",
  },
  {
    year: "2025 Q4",
    icon: Globe,
    title: "Global Expansion",
    desc: "Operating across 14 countries, protecting $2.4B+ in client revenue with zero human operators.",
  },
];

const AboutTimeline = () => (
  <section className="py-28 border-t border-border" aria-label="Our Journey">
    <div className="container mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-20"
      >
        <p className="text-quantum-cyan font-display text-xs tracking-[0.4em] uppercase mb-4">
          Our Journey
        </p>
        <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
          Milestones That <span className="text-gold-gradient gold-glow-text">Define Us</span>
        </h2>
      </motion.div>

      <div className="relative max-w-3xl mx-auto">
        {/* Vertical line */}
        <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-border md:-translate-x-px" />

        {milestones.map((m, i) => {
          const isLeft = i % 2 === 0;
          return (
            <motion.div
              key={m.year}
              initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              className={`relative flex items-start mb-16 last:mb-0 ${
                isLeft ? "md:flex-row" : "md:flex-row-reverse"
              } flex-row`}
            >
              {/* Dot */}
              <div className="absolute left-6 md:left-1/2 w-3 h-3 rounded-full bg-quantum-cyan -translate-x-1.5 mt-2 z-10 ring-4 ring-background" />

              {/* Content card */}
              <div
                className={`ml-14 md:ml-0 md:w-[calc(50%-2rem)] ${
                  isLeft ? "md:pr-8 md:text-right" : "md:pl-8"
                }`}
              >
                <span className="text-quantum-cyan font-display text-xs tracking-widest uppercase">
                  {m.year}
                </span>
                <div className="quantum-card rounded-xl p-6 mt-2">
                  <div className={`flex items-center gap-3 mb-3 ${isLeft ? "md:justify-end" : ""}`}>
                    <div className="w-10 h-10 rounded-lg bg-quantum-cyan/10 flex items-center justify-center shrink-0">
                      <m.icon className="text-quantum-cyan" size={20} />
                    </div>
                    <h3 className="font-display text-lg font-semibold text-foreground">{m.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{m.desc}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  </section>
);

export default AboutTimeline;
