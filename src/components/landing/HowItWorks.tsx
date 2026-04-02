import { motion } from "framer-motion";

const phases = [
  { num: "01", title: "Intake", desc: "Intent detection, priority scoring, and deal routing." },
  { num: "02", title: "Sourcing", desc: "Multi-source curation and weighted shortlist generation." },
  { num: "03", title: "Outreach", desc: "Cinematic vendor messaging and document collection." },
  { num: "04", title: "Negotiation", desc: "Leverage analysis, counter-offers, and behavior prediction." },
  { num: "05", title: "Workflow", desc: "Scheduling, coordination, and risk management." },
  { num: "06", title: "Documentation", desc: "Contract generation, invoicing, and commission tracking." },
  { num: "07", title: "Completion", desc: "Final reports, intelligence capture, and upsell activation." },
];

const HowItWorks = () => (
  <section className="py-24 sm:py-32 overflow-hidden">
    <div className="container mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="text-center mb-16"
      >
        <p className="font-body text-xs tracking-[0.35em] uppercase text-primary/70 mb-4">How It Works</p>
        <h2 className="font-display text-3xl sm:text-4xl font-medium text-foreground">Seven phases. Zero friction.</h2>
      </motion.div>

      {/* Timeline */}
      <div className="relative max-w-5xl mx-auto">
        {/* Gold line */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="hidden lg:block absolute top-6 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent origin-left"
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-6 lg:gap-4">
          {phases.map((phase, i) => (
            <motion.div
              key={phase.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.6 }}
              className="text-center group"
            >
              {/* Dot */}
              <div className="relative mx-auto w-3 h-3 mb-4">
                <div className="w-3 h-3 rounded-full border border-primary/60 bg-background group-hover:bg-primary/20 transition-colors duration-300" />
                <div className="absolute inset-0 rounded-full bg-primary/30 scale-0 group-hover:scale-[2.5] transition-transform duration-500 opacity-40" />
              </div>

              <p className="font-body text-[10px] tracking-[0.2em] text-primary/80 mb-1">{phase.num}</p>
              <h3 className="font-display text-sm font-medium text-foreground mb-2">{phase.title}</h3>
              <p className="font-body text-[11px] text-muted-foreground leading-relaxed">{phase.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default HowItWorks;
