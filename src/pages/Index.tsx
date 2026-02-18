import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Brain, LineChart, Zap, Shield, Globe, Sparkles } from "lucide-react";
import ParticleGrid from "@/components/ParticleGrid";
import { useTypewriter } from "@/hooks/use-typewriter";
import { useRef } from "react";

const features = [
  { icon: Brain, title: "Autonomous Intelligence", desc: "Self-learning AI that evolves with your business, making decisions in real time.", color: "from-primary/20 to-primary/5" },
  { icon: LineChart, title: "Predictive Analytics", desc: "Revenue forecasting and market insights powered by deep neural networks.", color: "from-neon-blue/20 to-neon-blue/5" },
  { icon: Zap, title: "Instant Automation", desc: "Eliminate friction across workflows with intelligent process automation.", color: "from-emerald/20 to-emerald/5" },
  { icon: Shield, title: "Enterprise Security", desc: "Military-grade encryption with zero-knowledge architecture.", color: "from-primary/20 to-primary/5" },
  { icon: Globe, title: "Global Scale", desc: "Infrastructure designed for millions of concurrent users worldwide.", color: "from-neon-blue/20 to-neon-blue/5" },
  { icon: Sparkles, title: "Generative Content", desc: "AI-crafted copy, visuals, and strategy tailored to your brand voice.", color: "from-emerald/20 to-emerald/5" },
];

const StatCounter = ({ display, label }: { display: string; label: string }) => {
  return (
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
};

const logos = ["OpenAI", "Google", "Meta", "Microsoft", "Tesla", "SpaceX"];

const Index = () => {
  const { displayed, done } = useTypewriter("Intelligent", 80, 800);
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="relative">
      {/* Hero */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <ParticleGrid />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background pointer-events-none" />
        
        {/* Ambient orbs */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/[0.03] rounded-full blur-[100px] animate-pulse-gold" />
        <div className="absolute bottom-1/3 right-1/4 w-[300px] h-[300px] bg-neon-blue/[0.02] rounded-full blur-[80px] animate-float" />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <motion.p
              initial={{ opacity: 0, letterSpacing: "0.5em" }}
              animate={{ opacity: 1, letterSpacing: "0.3em" }}
              transition={{ duration: 1.2, delay: 0.2 }}
              className="text-primary font-display text-sm uppercase mb-6"
            >
              Next-Generation AI Platform
            </motion.p>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.05] mb-8">
              <span className="text-foreground">The World's Most</span>
              <br />
              <span className="text-gold-gradient gold-glow-text">
                {displayed}
                {!done && <span className="animate-pulse">|</span>}
              </span>
              <br />
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.8, duration: 0.8 }}
                className="text-foreground"
              >
                Digital Presence
              </motion.span>
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.2, duration: 0.8 }}
              className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              An autonomous AI ecosystem that thinks, creates, and scales — purpose-built for those who define the future.
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
                Experience AI
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/services"
                className="px-8 py-4 rounded-full border border-border text-foreground font-medium text-base hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                Explore Services
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
            className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2"
          >
            <div className="w-1 h-2 bg-primary rounded-full" />
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
            Trusted by Industry Leaders
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

      {/* Stats — Animated Counters */}
      <section className="py-24 border-b border-border relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent pointer-events-none" />
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCounter display="$2.4B+" label="Revenue Generated" />
            <StatCounter display="99.97%" label="Uptime SLA" />
            <StatCounter display="140+" label="Enterprise Clients" />
            <StatCounter display="12ms" label="Avg Response Time" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/[0.02] rounded-full blur-[150px] pointer-events-none" />
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-primary font-display text-sm tracking-[0.3em] uppercase mb-4">Capabilities</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
              Built for the <span className="text-gold-gradient">Elite</span>
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="glass-card rounded-xl p-8 group hover:gold-glow transition-all duration-500 relative overflow-hidden"
              >
                {/* Gradient accent on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                    <f.icon className="text-primary" size={24} />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
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
            className="glass-card rounded-2xl p-12 md:p-20 text-center gold-glow relative overflow-hidden"
          >
            {/* Background shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/[0.03] to-transparent animate-pulse-gold pointer-events-none" />
            <div className="relative z-10">
              <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-6">
                Ready to Define the <span className="text-gold-gradient">Future</span>?
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
                Join the world's most forward-thinking organizations leveraging autonomous AI.
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
