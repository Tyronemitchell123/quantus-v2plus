import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, TrendingUp, Atom, Megaphone, Coins, ArrowUpRight } from "lucide-react";
import useDocumentHead from "@/hooks/use-document-head";
import HeroVideoBackground from "@/components/HeroVideoBackground";

const caseStudies = [
  {
    vertical: "Quantum AI Strategy",
    icon: Atom,
    client: "Global Aerospace Manufacturer",
    industry: "Aerospace & Defense",
    challenge:
      "Legacy supply chain models couldn't predict component failures or optimize procurement across 140+ suppliers spanning 23 countries.",
    solution:
      "Deployed QUANTUS AI's quantum-enhanced supply chain optimization engine with real-time anomaly detection across every supplier node.",
    results: [
      { metric: "340%", label: "ROI in 12 months" },
      { metric: "$42M", label: "Annual savings" },
      { metric: "97%", label: "Failure prediction accuracy" },
      { metric: "68%", label: "Procurement cycle reduction" },
    ],
    quote:
      "QUANTUS AI transformed our supply chain from reactive to predictive. We now see disruptions 3 weeks before they happen.",
    quoteAuthor: "VP of Operations",
    accent: "quantum-cyan",
  },
  {
    vertical: "Quantum Predictive Analytics",
    icon: TrendingUp,
    client: "Tier-1 Investment Bank",
    industry: "Financial Services",
    challenge:
      "Classical Monte Carlo simulations took 14+ hours to run portfolio risk assessments, making real-time rebalancing impossible during volatile markets.",
    solution:
      "Implemented quantum Monte Carlo acceleration and entanglement-based anomaly detection for real-time risk modeling across $180B in assets under management.",
    results: [
      { metric: "12,000x", label: "Simulation speedup" },
      { metric: "$1.2B", label: "Risk-adjusted alpha generated" },
      { metric: "0.3ms", label: "Latency per risk calculation" },
      { metric: "99.7%", label: "Anomaly detection accuracy" },
    ],
    quote:
      "What took our quant team overnight now runs in under a second. The quantum advantage is no longer theoretical — it's our competitive moat.",
    quoteAuthor: "Chief Risk Officer",
    accent: "quantum-purple",
  },
  {
    vertical: "Quantum Marketing Engine",
    icon: Megaphone,
    client: "Luxury Fashion House",
    industry: "Luxury Retail",
    challenge:
      "Multi-channel campaigns across 60+ markets required manual A/B testing, resulting in 6-week optimization cycles and inconsistent brand positioning.",
    solution:
      "Deployed quantum superposition-based campaign optimization — testing all creative variants simultaneously across every channel and market segment.",
    results: [
      { metric: "520%", label: "ROAS improvement" },
      { metric: "4.2x", label: "Customer lifetime value" },
      { metric: "6 weeks → 4 hours", label: "Optimization cycle" },
      { metric: "89%", label: "Brand consistency score" },
    ],
    quote:
      "QUANTUS AI doesn't just optimize campaigns — it orchestrates our entire brand presence with a precision that feels almost prescient.",
    quoteAuthor: "Global CMO",
    accent: "primary",
  },
  {
    vertical: "Quantum Finance & DeFi",
    icon: Coins,
    client: "Digital Asset Fund",
    industry: "Decentralized Finance",
    challenge:
      "Classical portfolio optimization couldn't handle the combinatorial complexity of 2,000+ token pairs with sub-second rebalancing requirements.",
    solution:
      "Implemented quantum portfolio optimization with post-quantum cryptography for smart contract security and quantum arbitrage detection across 40+ DEXs.",
    results: [
      { metric: "78%", label: "Sharpe ratio improvement" },
      { metric: "$340M", label: "AUM managed autonomously" },
      { metric: "0", label: "Security breaches (18 months)" },
      { metric: "2,400+", label: "Arbitrage opportunities/day" },
    ],
    quote:
      "Post-quantum security gives our LPs confidence that their assets are protected against threats that don't even exist yet.",
    quoteAuthor: "Managing Partner",
    accent: "quantum-cyan",
  },
];

const accentBorder: Record<string, string> = {
  "quantum-cyan": "border-quantum-cyan/20 hover:border-quantum-cyan/40",
  "quantum-purple": "border-quantum-purple/20 hover:border-quantum-purple/40",
  primary: "border-primary/20 hover:border-primary/40",
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

const CaseStudies = () => {
  useDocumentHead({
    title: "Case Studies — Quantum AI ROI & Results | QUANTUS AI",
    description: "Real-world quantum AI case studies: 340% ROI, 12,000x simulation speedup, $1.2B alpha generated. See how enterprises achieve quantum advantage.",
    canonical: "https://quantus-loom.lovable.app/case-studies",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "QUANTUS AI Case Studies",
      description: "Real-world quantum AI results across aerospace, finance, marketing, and enterprise operations.",
      url: "https://quantus-loom.lovable.app/case-studies",
    },
  });

  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="py-24 relative overflow-hidden">
        <HeroVideoBackground />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-quantum-cyan/[0.03] rounded-full blur-[120px]" />
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto"
          >
            <p className="text-quantum-cyan font-display text-sm tracking-[0.3em] uppercase mb-4">
              Case Studies
            </p>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-6">
              Quantum Results,{" "}
              <span className="text-quantum-gradient quantum-glow-text">Proven</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Real outcomes from real enterprises. See how QUANTUS AI delivers measurable quantum advantage across every service vertical.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Case Study Cards */}
      <section className="pb-24">
        <div className="container mx-auto px-6">
          <div className="space-y-12 max-w-5xl mx-auto">
            {caseStudies.map((cs, i) => (
              <motion.article
                key={cs.vertical}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className={`glass-card rounded-2xl p-8 md:p-10 border ${accentBorder[cs.accent]} transition-colors duration-500`}
              >
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 rounded-lg ${accentBg[cs.accent]} flex items-center justify-center`}>
                    <cs.icon size={20} className={accentText[cs.accent]} />
                  </div>
                  <div>
                    <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${accentText[cs.accent]}`}>
                      {cs.vertical}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {cs.client} · {cs.industry}
                    </p>
                  </div>
                </div>

                {/* Challenge & Solution */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-2">
                      Challenge
                    </h3>
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      {cs.challenge}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-2">
                      Solution
                    </h3>
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      {cs.solution}
                    </p>
                  </div>
                </div>

                {/* Results Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {cs.results.map((r) => (
                    <motion.div
                      key={r.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      className="bg-secondary/40 rounded-xl p-4 text-center"
                    >
                      <div className={`font-display text-2xl md:text-3xl font-bold ${accentText[cs.accent]} mb-1`}>
                        {r.metric}
                      </div>
                      <div className="text-xs text-muted-foreground">{r.label}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="border-l-2 border-border pl-5">
                  <p className="text-sm text-foreground/70 italic leading-relaxed mb-1">
                    "{cs.quote}"
                  </p>
                  <cite className="text-xs text-muted-foreground not-italic">
                    — {cs.quoteAuthor}, {cs.client}
                  </cite>
                </blockquote>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Summary Stats */}
      <section className="py-24 border-y border-border relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent pointer-events-none" />
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="text-primary font-display text-sm tracking-[0.3em] uppercase mb-4">
              Aggregate Impact
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Across All <span className="text-gold-gradient gold-glow-text">Deployments</span>
            </h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { metric: "$1.6B+", label: "Total client value generated" },
              { metric: "340%", label: "Average ROI" },
              { metric: "99.99%", label: "Platform uptime" },
              { metric: "0", label: "Security incidents" },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="font-display text-3xl md:text-4xl font-bold text-primary mb-1">
                  {s.metric}
                </div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="quantum-card rounded-2xl p-12 md:p-20 text-center quantum-glow relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-quantum-cyan/[0.03] via-transparent to-quantum-purple/[0.03] pointer-events-none" />
            <div className="relative z-10">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Ready to Write Your{" "}
                <span className="text-quantum-gradient">Success Story</span>?
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
                Join the enterprises already achieving quantum advantage. Request a demo to see QUANTUS AI in action.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
              >
                Request Demo
                <ArrowRight size={18} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default CaseStudies;
