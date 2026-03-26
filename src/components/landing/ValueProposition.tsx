import { motion } from "framer-motion";
import { Brain, Workflow, ShieldCheck } from "lucide-react";

const cards = [
  { icon: Brain, title: "Intelligence", desc: "AI that understands UHNW complexity." },
  { icon: Workflow, title: "Orchestration", desc: "Automated workflows across aviation, medical, staffing, and lifestyle." },
  { icon: ShieldCheck, title: "Discretion", desc: "Privacy-first architecture with cinematic precision." },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  }),
};

const ValueProposition = () => (
  <section className="py-24 sm:py-32 bg-background">
    <div className="container mx-auto px-6">
      <div className="grid sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            custom={i}
            className="glass-card p-8 text-center group hover:border-primary/20 transition-all duration-500"
          >
            <card.icon className="w-6 h-6 text-primary mx-auto mb-5" strokeWidth={1.5} />
            <h3 className="font-display text-lg font-medium mb-3 text-foreground">{card.title}</h3>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default ValueProposition;
