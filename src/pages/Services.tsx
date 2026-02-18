import { motion } from "framer-motion";
import { Brain, TrendingUp, Megaphone, Coins, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const services = [
  {
    icon: Brain,
    title: "AI Strategy & Consulting",
    desc: "End-to-end AI transformation roadmaps for enterprise organizations seeking competitive advantage.",
    features: ["Custom model development", "Data architecture design", "ROI forecasting", "Autonomous deployment"],
  },
  {
    icon: TrendingUp,
    title: "Predictive Analytics",
    desc: "Real-time market intelligence and revenue forecasting powered by proprietary neural networks.",
    features: ["Revenue prediction", "Customer churn analysis", "Market trend detection", "Risk assessment"],
  },
  {
    icon: Megaphone,
    title: "Autonomous Marketing",
    desc: "AI-driven campaigns that self-optimize across channels, maximizing ROI without human intervention.",
    features: ["Dynamic content generation", "Audience segmentation", "A/B test automation", "Cross-channel orchestration"],
  },
  {
    icon: Coins,
    title: "Crypto & Finance Integration",
    desc: "Intelligent financial systems bridging traditional markets with decentralized finance.",
    features: ["Smart contract auditing", "Algorithmic trading", "DeFi integration", "Portfolio optimization"],
  },
];

const tiers = [
  { name: "Growth", price: "$5,000", period: "/mo", features: ["1 AI model", "Basic analytics", "AI concierge access", "5 API integrations"] },
  { name: "Enterprise", price: "$25,000", period: "/mo", features: ["Unlimited models", "Full analytics suite", "24/7 autonomous monitoring", "Unlimited integrations"], featured: true },
  { name: "Custom", price: "Request Demo", period: "", features: ["Bespoke solutions", "Dedicated AI pipeline", "SLA guarantee", "On-premise option"] },
];

const Services = () => (
  <div className="pt-24">
    <section className="py-24">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <p className="text-primary font-display text-sm tracking-[0.3em] uppercase mb-4">What We Offer</p>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground">
            Premium <span className="text-gold-gradient">AI Services</span>
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
              className="glass-card rounded-xl p-8 group hover:gold-glow transition-shadow duration-500"
            >
              <s.icon className="text-primary mb-5" size={28} />
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">{s.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-5">{s.desc}</p>
              <ul className="space-y-2">
                {s.features.map((f) => (
                  <li key={f} className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-primary" />
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
          <p className="text-primary font-display text-sm tracking-[0.3em] uppercase mb-4">Pricing</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
            Invest in <span className="text-gold-gradient">Excellence</span>
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
              className={`rounded-xl p-8 ${t.featured ? "glass-card gold-glow border border-primary/30" : "glass-card"}`}
            >
              {t.featured && (
                <span className="text-xs font-semibold text-primary uppercase tracking-widest">Most Popular</span>
              )}
              <h3 className="font-display text-xl font-semibold text-foreground mt-2 mb-1">{t.name}</h3>
              <div className="mb-6">
                <span className="font-display text-3xl font-bold text-foreground">{t.price}</span>
                <span className="text-muted-foreground text-sm">{t.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {t.features.map((f) => (
                  <li key={f} className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/contact"
                className={`inline-flex items-center justify-center w-full gap-2 py-3 rounded-full text-sm font-semibold transition-colors ${
                  t.featured
                    ? "bg-primary text-primary-foreground hover:opacity-90"
                    : "border border-border text-foreground hover:border-primary/50"
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

export default Services;
