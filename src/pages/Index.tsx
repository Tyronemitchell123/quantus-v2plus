import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Atom, LineChart, Zap, Shield, Globe, Sparkles } from "lucide-react";
import { lazy, Suspense, useRef } from "react";
import QuantumOrbit from "@/components/QuantumOrbit";
import { useTypewriter } from "@/hooks/use-typewriter";

const QuantumField = lazy(() => import("@/components/QuantumField"));
const AIRecommendations = lazy(() => import("@/components/AIRecommendations"));
import HeroVideoBackground from "@/components/HeroVideoBackground";
import WhyQuantus from "@/components/WhyQuantus";
import useDocumentHead from "@/hooks/use-document-head";
import quantumProcessor from "@/assets/quantum-processor.jpg";
import quantumAnalytics from "@/assets/quantum-analytics.jpg";

const features = [
  { icon: Atom, title: "Quantum Intelligence", desc: "Quantum-enhanced neural networks that process exponentially faster, unlocking solutions classical AI cannot reach.", color: "from-quantum-cyan/20 to-quantum-cyan/5" },
  { icon: LineChart, title: "Quantum Analytics", desc: "Probabilistic forecasting powered by quantum superposition for unmatched predictive accuracy.", color: "from-quantum-purple/20 to-quantum-purple/5" },
  { icon: Zap, title: "Quantum Acceleration", desc: "Near-instantaneous computation for complex optimizations that would take classical systems hours.", color: "from-primary/20 to-primary/5" },
  { icon: Shield, title: "Quantum Encryption", desc: "Post-quantum cryptography ensuring your data remains secure against even quantum-level attacks.", color: "from-quantum-cyan/20 to-quantum-cyan/5" },
  { icon: Globe, title: "Quantum Mesh Network", desc: "Globally distributed quantum nodes delivering sub-millisecond latency worldwide.", color: "from-quantum-purple/20 to-quantum-purple/5" },
  { icon: Sparkles, title: "Generative Quantum AI", desc: "AI-crafted content, strategies, and models enhanced by quantum variational circuits.", color: "from-primary/20 to-primary/5" },
];

const StatCounter = ({ display, label }: { display: string; label: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="text-center"
  >
    <div className="font-display text-4xl md:text-5xl font-bold text-primary mb-1">
      {display}
    </div>
    <div className="text-sm text-muted-foreground">{label}</div>
  </motion.div>
);

const logos = ["OpenAI", "Google", "Meta", "Microsoft", "Tesla", "SpaceX"];

const Index = () => {
  useDocumentHead({
    title: "QUANTUS AI — The World's First Quantum Intelligence Platform",
    description: "Quantum-powered autonomous AI that thinks at the speed of light. Quantum computing, predictive analytics, quantum encryption for visionary organizations.",
    canonical: "https://quantus-loom.lovable.app/",
  });

  const { displayed, done } = useTypewriter("Quantum", 80, 800);
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.15], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  return (
    <div className="relative">
      {/* Hero */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <HeroVideoBackground />
        <Suspense fallback={null}><QuantumField /></Suspense>
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background pointer-events-none" />
        
        {/* Quantum ambient orbs */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-quantum-cyan/[0.03] rounded-full blur-[100px] animate-quantum-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-[300px] h-[300px] bg-quantum-purple/[0.03] rounded-full blur-[80px] animate-float" />
        <div className="absolute top-1/2 right-1/3 w-[200px] h-[200px] bg-primary/[0.02] rounded-full blur-[60px] animate-pulse-gold" />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 container mx-auto px-6 text-center">
          <motion.div
            initial={{ y: 40 }}
            animate={{ y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <motion.p
              initial={{ opacity: 0, letterSpacing: "0.5em" }}
              animate={{ opacity: 1, letterSpacing: "0.3em" }}
              transition={{ duration: 1.2, delay: 0.2 }}
              className="text-quantum-cyan font-display text-sm uppercase mb-6"
            >
              Quantum-Powered AI Platform
            </motion.p>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.05] mb-8">
              <span className="text-foreground">The World's First</span>
              <br />
              <span className="text-quantum-gradient quantum-glow-text">
                {displayed}
                {!done && <span className="animate-quantum-flicker">|</span>}
              </span>
              <br />
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.8, duration: 0.8 }}
                className="text-foreground"
              >
                Intelligence
              </motion.span>
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.2, duration: 0.8 }}
              className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              An autonomous quantum AI ecosystem that thinks at the speed of light, computes the impossible, and scales infinitely — for those who define the future.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.6, duration: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                to="/chat"
                className="group px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold text-base flex items-center gap-2 hover:shadow-xl hover:shadow-primary/30 transition-all"
              >
                Experience Quantum AI
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/services"
                className="px-8 py-4 rounded-full border border-quantum-cyan/30 text-foreground font-medium text-base hover:border-quantum-cyan/60 hover:bg-quantum-cyan/5 transition-all"
              >
                Explore Quantum Services
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-quantum-cyan/30 flex justify-center pt-2"
          >
            <div className="w-1 h-2 bg-quantum-cyan rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Trust Bar */}
      <section className="py-12 border-b border-border overflow-hidden">
        <div className="container mx-auto px-6">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-xs text-muted-foreground/60 tracking-[0.3em] uppercase mb-8"
          >
            Trusted by Quantum-Forward Organizations
          </motion.p>
          <div className="flex items-center justify-center gap-12 md:gap-16 flex-wrap">
            {logos.map((logo, i) => (
              <motion.span
                key={logo}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="font-display text-lg md:text-xl font-bold text-muted-foreground/20 hover:text-muted-foreground/40 transition-colors cursor-default"
              >
                {logo}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 border-b border-border relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-quantum-cyan/[0.01] to-transparent pointer-events-none" />
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCounter display="10^18" label="Quantum Ops/sec" />
            <StatCounter display="99.99%" label="Uptime SLA" />
            <StatCounter display="140+" label="Enterprise Clients" />
            <StatCounter display="0.3ms" label="Quantum Latency" />
          </div>
        </div>
      </section>

      {/* Why QUANTUS AI */}
      <WhyQuantus />

      {/* Features */}
      <section className="py-24 relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-quantum-purple/[0.02] rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-quantum-cyan/[0.02] rounded-full blur-[120px] pointer-events-none" />
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-quantum-cyan font-display text-sm tracking-[0.3em] uppercase mb-4">Quantum Capabilities</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
              Powered by <span className="text-quantum-gradient">Quantum Physics</span>
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="quantum-card rounded-xl p-8 group hover:quantum-glow transition-all duration-500 relative overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-quantum-cyan/10 flex items-center justify-center mb-5 group-hover:bg-quantum-cyan/20 transition-colors">
                    <f.icon className="text-quantum-cyan" size={24} />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Analytics image showcase */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 30px -10px hsla(185, 100%, 55%, 0.15)",
                  "0 0 60px -10px hsla(185, 100%, 55%, 0.3), 0 0 100px -20px hsla(270, 80%, 60%, 0.15)",
                  "0 0 30px -10px hsla(185, 100%, 55%, 0.15)",
                ],
                transition: { duration: 5, repeat: Infinity, ease: "easeInOut" as const },
              }}
              className="rounded-2xl overflow-hidden border border-quantum-purple/20"
            >
              <motion.img
                src={quantumAnalytics}
                alt="Quantum analytics dashboard with holographic charts and data nodes"
                className="w-full h-auto rounded-2xl"
                animate={{ y: [0, -8, 0], transition: { duration: 6, repeat: Infinity, ease: "easeInOut" as const } }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.4 }}
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Quantum Visualization Section */}
      <section className="py-24 border-y border-border relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-quantum-cyan/[0.02] via-transparent to-quantum-purple/[0.02] pointer-events-none" />
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-quantum-cyan font-display text-sm tracking-[0.3em] uppercase mb-4">Quantum Core</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
                Beyond Classical <span className="text-quantum-gradient">Limits</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Our quantum processing core leverages superposition and entanglement to solve optimization, cryptography, and machine learning problems exponentially faster than any classical system.
              </p>
              <ul className="space-y-3">
                {["Quantum superposition for parallel computation", "Entanglement-based secure communications", "Variational quantum circuits for ML", "Quantum error correction at scale"].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-quantum-cyan" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative"
            >
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 20px -5px hsla(185, 100%, 55%, 0.2)",
                    "0 0 40px -5px hsla(185, 100%, 55%, 0.4), 0 0 80px -10px hsla(270, 80%, 60%, 0.2)",
                    "0 0 20px -5px hsla(185, 100%, 55%, 0.2)",
                  ],
                  transition: { duration: 4, repeat: Infinity, ease: "easeInOut" as const },
                }}
                className="rounded-2xl overflow-hidden border border-quantum-cyan/20"
              >
                <motion.img
                  src={quantumProcessor}
                  alt="Quantum processor chip with glowing cyan and purple data streams"
                  className="w-full h-auto rounded-2xl"
                  animate={{ y: [0, -10, 0], transition: { duration: 5, repeat: Infinity, ease: "easeInOut" as const } }}
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.4 }}
                />
              </motion.div>
              <motion.div
                className="absolute -bottom-4 -right-4 w-20 h-20"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <QuantumOrbit size={80} />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* AI Recommendations */}
      <AIRecommendations />

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="quantum-card rounded-2xl p-12 md:p-20 text-center quantum-glow relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-quantum-cyan/[0.03] via-transparent to-quantum-purple/[0.03] animate-quantum-pulse pointer-events-none" />
            <div className="relative z-10">
              <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-6">
                Ready for <span className="text-quantum-gradient">Quantum</span> Advantage?
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
                Join the world's most forward-thinking organizations leveraging quantum-powered autonomous AI.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold hover:shadow-xl hover:shadow-primary/30 transition-all"
              >
                Get Started
                <ArrowRight size={18} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;
