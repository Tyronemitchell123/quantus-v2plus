import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Brain, LineChart, Zap, Shield, Globe, Sparkles } from "lucide-react";
import ParticleGrid from "@/components/ParticleGrid";

const features = [
  { icon: Brain, title: "Autonomous Intelligence", desc: "Self-learning AI that evolves with your business, making decisions in real time." },
  { icon: LineChart, title: "Predictive Analytics", desc: "Revenue forecasting and market insights powered by deep neural networks." },
  { icon: Zap, title: "Instant Automation", desc: "Eliminate friction across workflows with intelligent process automation." },
  { icon: Shield, title: "Enterprise Security", desc: "Military-grade encryption with zero-knowledge architecture." },
  { icon: Globe, title: "Global Scale", desc: "Infrastructure designed for millions of concurrent users worldwide." },
  { icon: Sparkles, title: "Generative Content", desc: "AI-crafted copy, visuals, and strategy tailored to your brand voice." },
];

const stats = [
  { value: "$2.4B+", label: "Revenue Generated" },
  { value: "99.97%", label: "Uptime SLA" },
  { value: "140+", label: "Enterprise Clients" },
  { value: "12ms", label: "Avg Response Time" },
];

const Index = () => {
  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <ParticleGrid />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background pointer-events-none" />
        <div className="relative z-10 container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <p className="text-primary font-display text-sm tracking-[0.3em] uppercase mb-6">
              Next-Generation AI Platform
            </p>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.05] mb-8">
              <span className="text-foreground">The World's Most</span>
              <br />
              <span className="text-gold-gradient gold-glow-text">Intelligent</span>
              <br />
              <span className="text-foreground">Digital Presence</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              An autonomous AI ecosystem that thinks, creates, and scales — purpose-built for those who define the future.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/chat"
                className="group px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold text-base flex items-center gap-2 hover:opacity-90 transition-opacity"
              >
                Experience AI
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/services"
                className="px-8 py-3.5 rounded-full border border-border text-foreground font-medium text-base hover:border-primary/50 transition-colors"
              >
                Explore Services
              </Link>
            </div>
          </motion.div>
        </div>
        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Stats */}
      <section className="py-20 border-y border-border">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="text-center"
              >
                <div className="font-display text-3xl md:text-4xl font-bold text-primary mb-1">{s.value}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
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
                className="glass-card rounded-xl p-8 group hover:gold-glow transition-shadow duration-500"
              >
                <f.icon className="text-primary mb-5" size={28} />
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
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
            className="glass-card rounded-2xl p-12 md:p-20 text-center gold-glow"
          >
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-6">
              Ready to Define the <span className="text-gold-gradient">Future</span>?
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
              Join the world's most forward-thinking organizations leveraging autonomous AI.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
            >
              Get Started
              <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;
