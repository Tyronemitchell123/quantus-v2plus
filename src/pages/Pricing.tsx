import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Check, ArrowRight, Sparkles, Zap, Crown } from "lucide-react";

const tiers = [
  {
    name: "Starter",
    price: "$499",
    period: "/month",
    description: "For growing teams ready to leverage AI automation.",
    icon: Zap,
    features: [
      "Up to 10,000 AI queries/month",
      "Predictive analytics dashboard",
      "Email & chat support",
      "2 team seats",
      "Standard API access",
      "Weekly performance reports",
    ],
    cta: "Get Started",
    highlight: false,
  },
  {
    name: "Professional",
    price: "$1,499",
    period: "/month",
    description: "For organizations demanding enterprise-grade intelligence.",
    icon: Sparkles,
    features: [
      "Unlimited AI queries",
      "Advanced predictive models",
      "Priority 24/7 support",
      "25 team seats",
      "Full API + Webhooks",
      "Custom AI model training",
      "Dedicated account manager",
      "Real-time market intelligence",
    ],
    cta: "Start Free Trial",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "Bespoke AI solutions for global-scale operations.",
    icon: Crown,
    features: [
      "Everything in Professional",
      "Unlimited team seats",
      "On-premise deployment option",
      "Custom SLA (99.99% uptime)",
      "White-glove onboarding",
      "Dedicated AI engineering team",
      "Private model fine-tuning",
      "Executive strategy sessions",
    ],
    cta: "Contact Sales",
    highlight: false,
  },
];

const Pricing = () => {
  return (
    <div className="pt-16 min-h-screen">
      {/* Header */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/[0.04] rounded-full blur-[120px]" />
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto"
          >
            <p className="text-primary font-display text-sm tracking-[0.3em] uppercase mb-4">
              Pricing
            </p>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-6">
              Invest in <span className="text-gold-gradient gold-glow-text">Intelligence</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Transparent pricing built for scale. Every plan includes our core AI engine — choose the tier that matches your ambition.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-24">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
            {tiers.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.6 }}
                className={`relative rounded-2xl p-8 flex flex-col ${
                  tier.highlight
                    ? "glass-card gold-glow ring-1 ring-primary/30"
                    : "glass-card"
                }`}
              >
                {tier.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold tracking-wider uppercase">
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <tier.icon
                    size={24}
                    className={tier.highlight ? "text-primary" : "text-muted-foreground"}
                  />
                </div>

                <h3 className="font-display text-xl font-semibold text-foreground mb-1">
                  {tier.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-6">{tier.description}</p>

                <div className="mb-8">
                  <span className="font-display text-4xl font-bold text-foreground">
                    {tier.price}
                  </span>
                  <span className="text-muted-foreground text-sm">{tier.period}</span>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm">
                      <Check size={16} className="text-primary shrink-0 mt-0.5" />
                      <span className="text-foreground/80">{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={tier.name === "Enterprise" ? "/contact" : "/chat"}
                  className={`w-full text-center py-3 rounded-full font-semibold text-sm transition-all ${
                    tier.highlight
                      ? "bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20"
                      : "border border-border text-foreground hover:border-primary/50"
                  }`}
                >
                  {tier.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ / CTA */}
      <section className="py-24 border-t border-border">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-2xl p-12 md:p-20 text-center max-w-4xl mx-auto gold-glow"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Need a Custom <span className="text-gold-gradient">Solution</span>?
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
              Our enterprise team will architect an AI strategy tailored to your organization's unique requirements.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
            >
              Talk to Sales
              <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
