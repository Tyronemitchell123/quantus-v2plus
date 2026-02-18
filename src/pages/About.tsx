import { motion } from "framer-motion";
import { Atom, Eye, Target } from "lucide-react";
import QuantumOrbit from "@/components/QuantumOrbit";
import useDocumentHead from "@/hooks/use-document-head";
import quantumMission from "@/assets/quantum-mission.jpg";
import quantumNeural from "@/assets/quantum-neural.jpg";

const capabilities = [
  { icon: Atom, title: "Quantum Neural Architecture", desc: "Proprietary quantum neural networks process information in superposition, delivering exponentially faster insights than classical systems." },
  { icon: Eye, title: "Quantum Sensing", desc: "Advanced quantum-enhanced perception systems for real-time environmental analysis at the atomic level." },
  { icon: Target, title: "Quantum Strategic Reasoning", desc: "Multi-dimensional planning leveraging quantum annealing to explore solution spaces classical AI cannot reach." },
];

const floatAnimation = {
  y: [0, -12, 0],
  transition: { duration: 5, repeat: Infinity, ease: "easeInOut" as const },
};

const glowPulse = {
  boxShadow: [
    "0 0 20px -5px hsla(185, 100%, 55%, 0.2)",
    "0 0 40px -5px hsla(185, 100%, 55%, 0.4), 0 0 80px -10px hsla(270, 80%, 60%, 0.2)",
    "0 0 20px -5px hsla(185, 100%, 55%, 0.2)",
  ],
  transition: { duration: 4, repeat: Infinity, ease: "easeInOut" as const },
};

const About = () => {
  useDocumentHead({
    title: "About QUANTUS AI — Engineering the Quantum Future",
    description: "Discover how QUANTUS AI harnesses quantum computing for autonomous intelligence. Quantum neural architecture, quantum sensing & strategic reasoning.",
    canonical: "https://quantus-loom.lovable.app/about",
  });

  return (
    <div className="pt-24">
      {/* Hero with animated neural image */}
      <header className="py-24 relative overflow-hidden">
        <motion.div
          className="absolute -top-20 -right-20 w-[500px] h-[500px] opacity-20 blur-sm pointer-events-none"
          animate={floatAnimation}
        >
          <img src={quantumNeural} alt="" className="w-full h-full object-cover rounded-full" aria-hidden="true" />
        </motion.div>

        <div className="container mx-auto px-6 relative z-10">
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

      {/* Mission section with animated image */}
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

            {/* Animated mission image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 30 }}
              whileInView={{ opacity: 1, scale: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative"
            >
              <motion.div
                animate={glowPulse}
                className="rounded-2xl overflow-hidden border border-quantum-cyan/20"
              >
                <motion.img
                  src={quantumMission}
                  alt="Quantum entanglement visualization with connected qubits"
                  className="w-full h-auto rounded-2xl"
                  animate={floatAnimation}
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.4 }}
                />
              </motion.div>
              <motion.div
                className="absolute -bottom-4 -right-4 w-24 h-24"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <QuantumOrbit size={96} />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Neural image showcase */}
      <section className="py-24 relative overflow-hidden" aria-label="Quantum Intelligence">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: -30 }}
              whileInView={{ opacity: 1, scale: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative order-2 md:order-1"
            >
              <motion.div
                animate={glowPulse}
                className="rounded-2xl overflow-hidden border border-quantum-purple/20"
              >
                <motion.img
                  src={quantumNeural}
                  alt="Quantum neural network brain visualization"
                  className="w-full h-auto rounded-2xl"
                  animate={floatAnimation}
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.4 }}
                />
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 md:order-2"
            >
              <p className="text-quantum-cyan font-display text-sm tracking-[0.3em] uppercase mb-4">Quantum Intelligence</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
                Beyond <span className="text-quantum-gradient">Classical Limits</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Our quantum neural architecture processes information across multiple states simultaneously, achieving computational breakthroughs impossible with traditional systems.
              </p>
              <div className="quantum-card rounded-xl p-6 relative overflow-hidden">
                <div className="absolute top-3 right-3 opacity-30">
                  <QuantumOrbit size={60} />
                </div>
                <div className="relative z-10">
                  <div className="text-5xl font-display font-bold text-quantum-gradient mb-2">10<sup className="text-xl">18</sup></div>
                  <p className="text-foreground font-display text-lg font-semibold mb-1">Quantum Ops/Second</p>
                  <p className="text-muted-foreground text-sm">Zero classical bottlenecks</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-24 border-t border-border" aria-label="Quantum Capabilities">
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
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="quantum-card rounded-xl p-8 text-center hover:quantum-glow transition-all duration-500"
              >
                <motion.div
                  className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-quantum-cyan/10 mb-6"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
                >
                  <c.icon className="text-quantum-cyan" size={24} />
                </motion.div>
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
