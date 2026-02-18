import { motion } from "framer-motion";
import { Atom, TrendingUp, Megaphone, Coins, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import useDocumentHead from "@/hooks/use-document-head";

const services = [
  {
    icon: Atom,
    title: "Quantum AI Strategy",
    desc: "End-to-end quantum AI transformation roadmaps for enterprises seeking quantum advantage over classical competitors.",
    features: ["Quantum model development", "Quantum data architecture", "ROI forecasting via quantum simulation", "Autonomous quantum deployment"],
  },
  {
    icon: TrendingUp,
    title: "Quantum Predictive Analytics",
    desc: "Real-time market intelligence and revenue forecasting powered by quantum variational algorithms.",
    features: ["Quantum-enhanced revenue prediction", "Entanglement-based anomaly detection", "Quantum Monte Carlo simulations", "Risk assessment via quantum annealing"],
  },
  {
    icon: Megaphone,
    title: "Quantum Marketing Engine",
    desc: "AI-driven campaigns enhanced by quantum optimization, self-optimizing across all channels simultaneously.",
    features: ["Quantum A/B testing (all variants at once)", "Superposition audience targeting", "Quantum content generation", "Cross-channel quantum orchestration"],
  },
  {
    icon: Coins,
    title: "Quantum Finance & DeFi",
    desc: "Quantum-powered financial systems for algorithmic trading, portfolio optimization, and decentralized finance.",
    features: ["Quantum portfolio optimization", "Post-quantum cryptography", "Quantum-resistant smart contracts", "Quantum arbitrage detection"],
  },
];

const tiers = [
  { name: "Growth", price: "$5,000", period: "/mo", features: ["1 quantum model", "Basic quantum analytics", "AI concierge access", "5 API integrations"] },
  { name: "Enterprise", price: "$25,000", period: "/mo", features: ["Unlimited quantum models", "Full quantum analytics suite", "24/7 quantum monitoring", "Unlimited integrations"], featured: true },
  { name: "Custom", price: "Request Demo", period: "", features: ["Bespoke quantum solutions", "Dedicated quantum pipeline", "Quantum SLA guarantee", "On-premise quantum option"] },
];

const Services = () => {
  useDocumentHead({
    title: "Quantum AI Services — Strategy, Analytics & Finance | QUANTUS AI",
    description: "Enterprise quantum AI services: quantum strategy consulting, quantum predictive analytics, quantum marketing engine & quantum finance solutions.",
    canonical: "https://quantus-loom.lovable.app/services",
  });

  return (
    <div className="pt-24">
    <section className="py-24">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <p className="text-quantum-cyan font-display text-sm tracking-[0.3em] uppercase mb-4">What We Offer</p>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground">
            Quantum <span className="text-quantum-gradient">AI Services</span>
          </h1>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-24">
          {services.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="quantum-card rounded-xl p-8 group hover:quantum-glow transition-shadow duration-500"
            >
              <s.icon className="text-quantum-cyan mb-5" size={28} />
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">{s.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-5">{s.desc}</p>
              <ul className="space-y-2">
                {s.features.map((f) => (
                  <li key={f} className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-quantum-cyan" />
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Pricing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-quantum-cyan font-display text-sm tracking-[0.3em] uppercase mb-4">Pricing</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
            Invest in <span className="text-quantum-gradient">Quantum Advantage</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {tiers.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-xl p-8 ${t.featured ? "quantum-card quantum-glow border border-quantum-cyan/30" : "quantum-card"}`}
            >
              {t.featured && (
                <span className="text-xs font-semibold text-quantum-cyan uppercase tracking-widest">Most Popular</span>
              )}
              <h3 className="font-display text-xl font-semibold text-foreground mt-2 mb-1">{t.name}</h3>
              <div className="mb-6">
                <span className="font-display text-3xl font-bold text-foreground">{t.price}</span>
                <span className="text-muted-foreground text-sm">{t.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {t.features.map((f) => (
                  <li key={f} className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-quantum-cyan" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/contact"
                className={`inline-flex items-center justify-center w-full gap-2 py-3 rounded-full text-sm font-semibold transition-colors ${
                  t.featured
                    ? "bg-primary text-primary-foreground hover:opacity-90"
                    : "border border-border text-foreground hover:border-quantum-cyan/50"
                }`}
              >
                Get Started <ArrowRight size={16} />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  </div>
  );
};

export default Services;
