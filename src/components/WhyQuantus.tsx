import { motion } from "framer-motion";
import { Bot, Zap, BarChart3, ShieldCheck, DollarSign } from "lucide-react";

const benefits = [
  {
    icon: Bot,
    title: "100% Autonomous",
    desc: "Every process — sales, support, onboarding, advisory — is AI-driven with zero human overhead. No tickets. No wait times. Just intelligence.",
    accent: "quantum-cyan",
  },
  {
    icon: Zap,
    title: "Quantum Advantage",
    desc: "Quantum algorithms solve optimization and simulation problems exponentially faster than classical computing — unlocking solutions that were previously impossible.",
    accent: "quantum-purple",
  },
  {
    icon: BarChart3,
    title: "Real-Time Intelligence",
    desc: "Live market monitoring, anomaly detection, and predictive models that adapt continuously — so you act on insight, not intuition.",
    accent: "quantum-cyan",
  },
  {
    icon: ShieldCheck,
    title: "Enterprise Scale",
    desc: "Custom SLAs up to 99.99% uptime, on-premise deployment, private model fine-tuning, and post-quantum cryptography for uncompromising security.",
    accent: "primary",
  },
  {
    icon: DollarSign,
    title: "Hybrid Pricing",
    desc: "Flat monthly tiers with transparent usage-based rates for compute, queries, and data — scale freely without surprises.",
    accent: "quantum-purple",
  },
];

const accentColor: Record<string, string> = {
  "quantum-cyan": "hsl(var(--quantum-cyan))",
  "quantum-purple": "hsl(var(--quantum-purple))",
  primary: "hsl(var(--primary))",
};

const accentBg: Record<string, string> = {
  "quantum-cyan": "bg-quantum-cyan/10",
  "quantum-purple": "bg-quantum-purple/10",
  primary: "bg-primary/10",
};

const accentText: Record<string, string> = {
  "quantum-cyan": "text-quantum-cyan",
  "quantum-purple": "text-quantum-purple",
  primary: "text-primary",
};

const WhyQuantus = () => {
  return (
    <section className="py-24 border-b border-border relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/[0.02] rounded-full blur-[150px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-primary font-display text-sm tracking-[0.3em] uppercase mb-4">
            Why QUANTUS V2+
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
            Built for Those Who{" "}
            <span className="text-gold-gradient gold-glow-text">Define the Future</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mt-4 leading-relaxed">
            Five core differentiators that set QUANTUS V2+ apart from every other platform on the market.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              whileHover={{ y: -6, transition: { duration: 0.3 } }}
              className={`glass-card rounded-xl p-8 group hover:ring-1 hover:ring-border transition-all duration-300 ${
                i === 4 ? "md:col-span-2 lg:col-span-1 lg:col-start-2" : ""
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl ${accentBg[b.accent]} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
              >
                <b.icon className={accentText[b.accent]} size={24} />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                {b.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {b.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyQuantus;
