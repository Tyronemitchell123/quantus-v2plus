import { motion } from "framer-motion";
import { Brain, Workflow, ShieldCheck, Sparkles, Eye, Zap } from "lucide-react";

const cards = [
  { icon: Brain, title: "Silent Intelligence", desc: "AI that anticipates UHNW complexity before you articulate it. Precision without prompting.", label: "Autonomous Systems" },
  { icon: Workflow, title: "Modular Orchestration", desc: "Automated workflows across aviation, medical, staffing, and lifestyle — unified in one sovereign interface.", label: "Forever Architecture" },
  { icon: ShieldCheck, title: "Invisible Discretion", desc: "Privacy-first architecture engineered for those who operate beyond the visible.", label: "Silent Wealth" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.18, duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const ValueProposition = () => (
  <section className="py-28 sm:py-36 bg-background relative">
    {/* Gold vertical accent lines — Quantus Ratio */}
    <div className="absolute inset-y-0 left-[33.33%] w-px bg-gradient-to-b from-transparent via-primary/[0.04] to-transparent pointer-events-none" />
    <div className="absolute inset-y-0 right-[33.33%] w-px bg-gradient-to-b from-transparent via-primary/[0.04] to-transparent pointer-events-none" />

    <div className="container mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <p className="text-[9px] tracking-[0.5em] uppercase text-primary/50 font-body mb-4">Core Pillars</p>
        <h2 className="font-display text-3xl sm:text-4xl font-medium text-foreground">
          Precision <span className="italic text-primary/80">Protocols</span>
        </h2>
      </motion.div>

      <div className="grid sm:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeUp}
            custom={i}
            className="glass-card p-8 sm:p-9 text-center group hover:border-primary/15 transition-all duration-700 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <p className="text-[8px] tracking-[0.4em] uppercase text-primary/40 font-body mb-6">{card.label}</p>
            <card.icon className="w-5 h-5 text-primary mx-auto mb-5" strokeWidth={1.5} />
            <h3 className="font-display text-lg font-medium mb-3 text-foreground">{card.title}</h3>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default ValueProposition;
