import { motion } from "framer-motion";
import { Shield, Eye, Target, Lock, Cpu } from "lucide-react";

const values = [
  {
    icon: Shield,
    title: "Privacy-First Architecture",
    desc: "End-to-end encrypted workflows. No third-party data sharing. Your operations remain yours — always.",
  },
  {
    icon: Eye,
    title: "Radical Transparency",
    desc: "Real-time dashboards, full audit trails, and explainable AI outputs. You see exactly what your system sees.",
  },
  {
    icon: Target,
    title: "Outcome Obsession",
    desc: "We measure success by your ROI — not by feature count. If it doesn't move revenue or reduce risk, we don't ship it.",
  },
  {
    icon: Lock,
    title: "Discreet Power",
    desc: "Designed for those who value discretion above all. Every interaction, every data point, protected with institutional-grade security.",
  },
  {
    icon: Cpu,
    title: "Autonomous Operations",
    desc: "No tickets. No wait times. AI agents handle every interaction from onboarding to strategic advisory — 24/7/365.",
  },
];

const AboutValues = () => (
  <section className="py-28 border-t border-border relative overflow-hidden" aria-label="Our Values">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/[0.02] rounded-full blur-[150px] pointer-events-none" />

    <div className="container mx-auto px-6 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <p className="text-primary font-body text-xs tracking-[0.4em] uppercase mb-4">
          Our Principles
        </p>
        <h2 className="font-display text-3xl md:text-5xl font-medium text-foreground">
          What We <span className="text-gold-gradient italic">Stand For</span>
        </h2>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {values.map((v, i) => (
          <motion.div
            key={v.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
            whileHover={{ y: -6, transition: { duration: 0.3 } }}
            className={`glass-card p-8 group hover:border-primary/20 transition-all duration-300 ${
              i === 3 ? "lg:col-start-1" : i === 4 ? "lg:col-start-2" : ""
            }`}
          >
            <div className="w-12 h-12 rounded-none bg-primary/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
              <v.icon className="text-primary" size={24} strokeWidth={1.5} />
            </div>
            <h3 className="font-display text-lg font-medium text-foreground mb-2">{v.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed font-body">{v.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default AboutValues;
