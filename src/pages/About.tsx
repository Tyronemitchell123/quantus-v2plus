import { motion } from "framer-motion";
import { Atom, Eye, Target } from "lucide-react";
import QuantumOrbit from "@/components/QuantumOrbit";
import useDocumentHead from "@/hooks/use-document-head";

const capabilities = [
  { icon: Atom, title: "Quantum Neural Architecture", desc: "Proprietary quantum neural networks process information in superposition, delivering exponentially faster insights than classical systems." },
  { icon: Eye, title: "Quantum Sensing", desc: "Advanced quantum-enhanced perception systems for real-time environmental analysis at the atomic level." },
  { icon: Target, title: "Quantum Strategic Reasoning", desc: "Multi-dimensional planning leveraging quantum annealing to explore solution spaces classical AI cannot reach." },
];

const About = () => {
  useDocumentHead({
    title: "About QUANTUS AI — Engineering the Quantum Future",
    description: "Discover how QUANTUS AI harnesses quantum computing for autonomous intelligence. Quantum neural architecture, quantum sensing & strategic reasoning.",
    canonical: "https://quantus-loom.lovable.app/about",
  });

  return (
    <div className="pt-24">
      <header className="py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <p className="text-quantum-cyan font-display text-sm tracking-[0.3em] uppercase mb-6">Our Story</p>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground leading-tight mb-8">
              Engineering the <span className="text-quantum-gradient">Quantum Future</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              QUANTUS AI was founded on a singular vision: to harness the power of quantum computing for autonomous intelligence that doesn't just assist — it transcends. We build quantum AI systems that think in superposition, strategize across parallel dimensions, and execute at the speed of light.
            </p>
          </motion.div>
        </div>
      </header>

      <section className="py-24 border-y border-border" aria-label="Our Mission">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">Our Mission</h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                To democratize quantum-powered AI for visionary enterprises. We believe intelligence should be quantum-enhanced, autonomous, and transformative.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Every system we build leverages quantum superposition and entanglement — learning from data at exponential speed, adapting to markets in parallel realities, and delivering results that compound beyond classical limits.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="quantum-card rounded-2xl p-10 quantum-glow relative overflow-hidden"
            >
              <div className="absolute top-4 right-4 opacity-30">
                <QuantumOrbit size={80} />
              </div>
              <div className="relative z-10">
                <div className="text-6xl font-display font-bold text-quantum-gradient mb-4">2026</div>
                <p className="text-foreground font-display text-xl font-semibold mb-2">Year of Quantum AI</p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Our quantum processing core handles over 10^18 quantum operations per second, with zero classical bottlenecks.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24" aria-label="Quantum Capabilities">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-quantum-cyan font-display text-sm tracking-[0.3em] uppercase mb-4">Quantum Capabilities</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
              What Powers <span className="text-quantum-gradient">QUANTUS</span>
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {capabilities.map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="quantum-card rounded-xl p-8 text-center hover:quantum-glow transition-all duration-500"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-quantum-cyan/10 mb-6">
                  <c.icon className="text-quantum-cyan" size={24} />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-3">{c.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
