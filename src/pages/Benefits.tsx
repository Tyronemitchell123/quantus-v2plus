import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Bot, Zap, BarChart3, ShieldCheck, DollarSign,
  Building2, Plane, Diamond, Landmark, Cpu,
  ArrowRight, Sparkles,
} from "lucide-react";
import useDocumentHead from "@/hooks/use-document-head";
import HeroImageBackground from "@/components/HeroImageBackground";
import heroBenefits from "@/assets/hero-benefits.jpg";
import QuantumOrbit from "@/components/QuantumOrbit";

/* ── benefit data ─────────────────────────────────────────── */
const benefits = [
  {
    icon: Bot,
    title: "100 % Autonomous Operations",
    tagline: "Zero humans. Pure intelligence.",
    desc: "Every process — sales, support, onboarding, advisory — is AI-driven. No tickets, no wait times, no human overhead. Your AI workforce operates 24/7 with sub-second response times and continuous learning.",
    useCases: [
      "Fully autonomous customer support handling 10,000+ tickets/day",
      "AI-driven sales qualification and pipeline management",
      "Self-optimising onboarding flows that adapt per user profile",
    ],
    accent: "quantum-cyan",
    stat: "0",
    statLabel: "humans required",
  },
  {
    icon: Zap,
    title: "Quantum Advantage",
    tagline: "Exponentially faster than classical computing.",
    desc: "Quantum algorithms solve optimisation, simulation and cryptographic problems at speeds impossible for classical computers — unlocking solutions that were previously out of reach.",
    useCases: [
      "Portfolio optimisation across 10,000+ assets in real time",
      "Drug molecule simulation 12,000× faster than supercomputers",
      "Logistics route optimisation saving $42 M+ annually",
    ],
    accent: "quantum-purple",
    stat: "10¹⁸",
    statLabel: "quantum ops/sec",
  },
  {
    icon: BarChart3,
    title: "Real-Time Intelligence",
    tagline: "Act on insight, not intuition.",
    desc: "Live market monitoring, anomaly detection and predictive models that adapt continuously. Every decision is backed by streaming data processed at the speed of light.",
    useCases: [
      "Sub-millisecond fraud detection across global transactions",
      "Predictive maintenance reducing downtime by 94 %",
      "Live sentiment analysis of 50 M+ social signals per hour",
    ],
    accent: "quantum-cyan",
    stat: "< 1 ms",
    statLabel: "insight latency",
  },
  {
    icon: ShieldCheck,
    title: "Enterprise-Grade Security",
    tagline: "Post-quantum cryptography, built in.",
    desc: "Custom SLAs up to 99.99 % uptime, on-premise deployment, private model fine-tuning and post-quantum encryption protect your most sensitive data — today and against future threats.",
    useCases: [
      "SOC 2 Type II and ISO 27001 certified infrastructure",
      "Quantum-resistant key exchange for financial institutions",
      "Air-gapped deployments for defence and intelligence",
    ],
    accent: "primary",
    stat: "99.99 %",
    statLabel: "uptime SLA",
  },
  {
    icon: DollarSign,
    title: "Hybrid Pricing",
    tagline: "Scale freely without surprises.",
    desc: "Flat monthly tiers with transparent, usage-based rates for compute, queries and data storage. Pay for what you use — no lock-ins, no hidden fees, instant scaling.",
    useCases: [
      "Startups start at $2,499/mo with full AI capabilities",
      "Enterprise custom pricing with dedicated compute pools",
      "Pay-per-query model for seasonal or burst workloads",
    ],
    accent: "quantum-purple",
    stat: "$0",
    statLabel: "hidden fees",
  },
];

const accentMap: Record<string, { bg: string; text: string; border: string }> = {
  "quantum-cyan": { bg: "bg-quantum-cyan/10", text: "text-quantum-cyan", border: "border-quantum-cyan/20" },
  "quantum-purple": { bg: "bg-quantum-purple/10", text: "text-quantum-purple", border: "border-quantum-purple/20" },
  primary: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/20" },
};

/* ── target audience ──────────────────────────────────────── */
const audiences = [
  { icon: Landmark, title: "Finance & Banking", desc: "Hedge funds, investment banks, and fintechs leveraging quantum-speed risk analysis and algorithmic trading." },
  { icon: Plane, title: "Aerospace & Defence", desc: "Quantum simulation for materials science, flight optimisation, and classified-level secure communications." },
  { icon: Diamond, title: "Luxury & Retail", desc: "Hyper-personalised customer experiences, demand forecasting, and autonomous supply chain management." },
  { icon: Building2, title: "Enterprise ($100 M+ Revenue)", desc: "C-suite leaders seeking a fully autonomous AI platform that eliminates human overhead while multiplying ROI." },
  { icon: Cpu, title: "Quantum-Native Startups", desc: "Emerging companies building next-generation products on top of quantum-enhanced compute infrastructure." },
];

/* ── page ──────────────────────────────────────────────────── */
const Benefits = () => {
  useDocumentHead({
    title: "Benefits — Why QUANTUS V2+ | Quantum-Enhanced Autonomous Intelligence",
    description: "Discover the five core advantages of QUANTUS V2+: 100% autonomous ops, quantum computing, real-time intelligence, enterprise security, and transparent pricing.",
    canonical: "https://quantus-loom.lovable.app/benefits",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "QUANTUS V2+ Benefits",
      description: "Five core advantages: autonomous operations, quantum computing, real-time intelligence, enterprise security, and transparent pricing.",
      url: "https://quantus-loom.lovable.app/benefits",
    },
  });

  return (
    <div className="pt-24">
      {/* ── Hero ──────────────────────────────── */}
      <header className="py-24 relative overflow-hidden">
        <HeroImageBackground src={heroBenefits} alt="Luxury yacht at sunset" opacity="opacity-20" />
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <p className="text-quantum-cyan font-display text-sm tracking-[0.3em] uppercase mb-6">
              Platform Advantages
            </p>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground leading-tight mb-6">
              Five Reasons to Choose{" "}
              <span className="text-gold-gradient gold-glow-text">QUANTUS V2+</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
              The only platform fusing quantum computing with 100 % autonomous intelligence — engineered for enterprises that define the future.
            </p>
          </motion.div>
        </div>
      </header>

      {/* ── Expanded Benefits ─────────────────── */}
      <section className="py-24 border-t border-border">
        <div className="container mx-auto px-6 space-y-28">
          {benefits.map((b, i) => {
            const a = accentMap[b.accent];
            const reverse = i % 2 !== 0;
            return (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6 }}
                className={`grid md:grid-cols-2 gap-12 items-center ${reverse ? "md:[direction:rtl]" : ""}`}
              >
                {/* Text */}
                <div className={reverse ? "md:[direction:ltr]" : ""}>
                  <div className={`w-14 h-14 rounded-xl ${a.bg} flex items-center justify-center mb-5`}>
                    <b.icon className={a.text} size={28} />
                  </div>
                  <p className={`font-display text-sm tracking-[0.25em] uppercase mb-2 ${a.text}`}>{b.tagline}</p>
                  <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">{b.title}</h2>
                  <p className="text-muted-foreground text-lg leading-relaxed mb-6">{b.desc}</p>

                  <h3 className="font-display text-sm font-semibold text-foreground/70 uppercase tracking-wider mb-3">
                    Use Cases
                  </h3>
                  <ul className="space-y-2">
                    {b.useCases.map((uc) => (
                      <li key={uc} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Sparkles size={14} className={`${a.text} mt-0.5 shrink-0`} />
                        <span>{uc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Visual stat card */}
                <div className={reverse ? "md:[direction:ltr]" : ""}>
                  <motion.div
                    whileHover={{ y: -6, transition: { duration: 0.3 } }}
                    className={`quantum-card rounded-2xl p-10 text-center border ${a.border} relative overflow-hidden`}
                  >
                    <motion.div
                      className="absolute top-4 right-4 opacity-20"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                      <QuantumOrbit size={80} />
                    </motion.div>
                    <div className="relative z-10">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className={`text-6xl md:text-7xl font-display font-bold mb-2 ${a.text}`}
                      >
                        {b.stat}
                      </motion.div>
                      <p className="text-foreground font-display text-lg font-semibold">{b.statLabel}</p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── Who It's For ──────────────────────── */}
      <section className="py-24 border-t border-border relative overflow-hidden" aria-label="Who QUANTUS V2+ is built for">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/[0.02] rounded-full blur-[180px] pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-primary font-display text-sm tracking-[0.3em] uppercase mb-4">
              Who It's For
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
              Built for <span className="text-gold-gradient gold-glow-text">Visionary Leaders</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mt-4 leading-relaxed">
              QUANTUS V2+ is purpose-built for C-suite executives at high-revenue organisations who refuse to settle for incremental improvement.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {audiences.map((aud, i) => (
              <motion.div
                key={aud.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                whileHover={{ y: -6, transition: { duration: 0.3 } }}
                className={`glass-card rounded-xl p-8 group hover:ring-1 hover:ring-border transition-all duration-300 ${
                  i === 4 ? "md:col-span-2 lg:col-span-1 lg:col-start-2" : ""
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <aud.icon className="text-primary" size={24} />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">{aud.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{aud.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────── */}
      <section className="py-24 border-t border-border">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
              Ready to Transcend?
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
              Experience the only AI platform that operates at quantum speed with zero human bottlenecks.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all hover:shadow-lg hover:shadow-primary/20"
              >
                View Pricing <ArrowRight size={16} />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-border text-foreground font-semibold hover:bg-secondary/50 transition-all"
              >
                Book a Demo
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Benefits;
