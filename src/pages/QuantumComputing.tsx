import { motion } from "framer-motion";
import { Atom, Zap, Lock, Brain, Layers, ArrowRight } from "lucide-react";
import { Suspense, lazy } from "react";
import useDocumentHead from "@/hooks/use-document-head";
import QuantumOrbit from "@/components/QuantumOrbit";
import HeroVideoBackground from "@/components/HeroVideoBackground";

const QubitVisualization = lazy(() => import("@/components/QubitVisualization"));

const algorithms = [
  {
    icon: Lock,
    name: "Shor's Algorithm",
    tagline: "Exponential Speedup for Factoring",
    desc: "Breaks RSA encryption by factoring large integers in polynomial time. Classical computers need sub-exponential time — quantum does it in O((log N)³).",
    complexity: { classical: "O(e^(N^⅓))", quantum: "O((log N)³)" },
    color: "quantum-cyan",
  },
  {
    icon: Brain,
    name: "Grover's Algorithm",
    tagline: "Quadratic Speedup for Search",
    desc: "Searches an unsorted database of N items in √N steps instead of N. Powers QUANTUS AI's real-time pattern recognition across massive datasets.",
    complexity: { classical: "O(N)", quantum: "O(√N)" },
    color: "quantum-purple",
  },
  {
    icon: Zap,
    name: "VQE (Variational Quantum Eigensolver)",
    tagline: "Hybrid Quantum-Classical Optimization",
    desc: "Finds ground-state energies of molecules for drug discovery and materials science. Runs on near-term quantum hardware with classical co-processing.",
    complexity: { classical: "O(e^N)", quantum: "Polynomial" },
    color: "quantum-cyan",
  },
  {
    icon: Layers,
    name: "QAOA",
    tagline: "Combinatorial Optimization",
    desc: "Quantum Approximate Optimization Algorithm tackles NP-hard problems like supply chain routing and portfolio optimization with quantum advantage.",
    complexity: { classical: "NP-hard", quantum: "Approximate Poly" },
    color: "quantum-purple",
  },
];

const concepts = [
  { title: "Superposition", desc: "A qubit exists in both |0⟩ and |1⟩ simultaneously until measured, enabling parallel computation across all possible states." },
  { title: "Entanglement", desc: "Correlated qubits share quantum state instantly regardless of distance — Einstein's 'spooky action at a distance' made useful." },
  { title: "Quantum Gates", desc: "Unitary operations (Hadamard, CNOT, Toffoli) manipulate qubits to build quantum circuits — the building blocks of quantum algorithms." },
  { title: "Decoherence", desc: "Quantum states are fragile. QUANTUS AI's error-correction protocols maintain coherence 100× longer than industry standard." },
];

const QuantumComputing = () => {
  useDocumentHead({
    title: "Quantum Computing — QUANTUS AI",
    description: "Explore interactive qubit visualizations, Bloch sphere manipulation, quantum entanglement, and algorithm explainers powered by QUANTUS AI.",
    canonical: "https://quantus-loom.lovable.app/quantum",
  });

  return (
    <div className="pt-24">
      {/* Hero */}
      <header className="py-24 relative overflow-hidden">
        <HeroVideoBackground />
        <div className="absolute top-10 right-10 opacity-20 pointer-events-none">
          <QuantumOrbit size={200} />
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <p className="text-quantum-cyan font-display text-sm tracking-[0.3em] uppercase mb-6">Quantum Computing</p>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground leading-tight mb-8">
              The Science Behind <span className="text-quantum-gradient">QUANTUS</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Explore the quantum mechanics that power our platform. Interact with a real-time Bloch sphere, visualize entanglement, and understand the algorithms that give quantum computers their exponential edge.
            </p>
          </motion.div>
        </div>
      </header>

      {/* Interactive Qubit Visualization */}
      <section className="py-24 border-y border-border" aria-label="Interactive Qubit Lab">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-quantum-cyan font-display text-sm tracking-[0.3em] uppercase mb-4">Interactive Lab</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
                Manipulate a <span className="text-quantum-gradient">Qubit</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                The Bloch sphere represents a single qubit's state. The north pole is |0⟩, the south pole is |1⟩, and every point on the surface is a valid superposition. Use the sliders to explore.
              </p>
              <div className="space-y-4">
                {concepts.map((c, i) => (
                  <motion.div
                    key={c.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="quantum-card rounded-xl p-5"
                  >
                    <h3 className="font-display text-sm font-semibold text-quantum-cyan mb-1">{c.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{c.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="sticky top-24"
            >
              <Suspense
                fallback={
                  <div className="w-full aspect-square max-h-[450px] rounded-2xl border border-border bg-background/50 flex items-center justify-center">
                    <div className="text-muted-foreground flex items-center gap-2">
                      <Atom className="animate-quantum-orbit" size={20} />
                      <span className="text-sm">Loading quantum simulation…</span>
                    </div>
                  </div>
                }
              >
                <QubitVisualization />
              </Suspense>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quantum Algorithms */}
      <section className="py-24" aria-label="Quantum Algorithms">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-quantum-cyan font-display text-sm tracking-[0.3em] uppercase mb-4">Algorithms</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
              Quantum <span className="text-quantum-gradient">Advantage</span>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              These algorithms are the reason quantum computers matter. Each one solves a class of problems exponentially or quadratically faster.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {algorithms.map((algo, i) => (
              <motion.div
                key={algo.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6, transition: { duration: 0.3 } }}
                className="quantum-card rounded-xl p-8 hover:quantum-glow transition-all duration-500 group"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-${algo.color}/10 shrink-0`}>
                    <algo.icon className={`text-${algo.color}`} size={22} />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-foreground">{algo.name}</h3>
                    <p className={`text-xs font-medium text-${algo.color}`}>{algo.tagline}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">{algo.desc}</p>

                {/* Complexity comparison */}
                <div className="flex gap-4 text-xs">
                  <div className="flex-1 rounded-lg bg-secondary/50 p-3">
                    <span className="text-muted-foreground block mb-1">Classical</span>
                    <span className="font-mono text-foreground">{algo.complexity.classical}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <ArrowRight size={14} />
                  </div>
                  <div className={`flex-1 rounded-lg bg-${algo.color}/10 p-3 border border-${algo.color}/20`}>
                    <span className={`text-${algo.color} block mb-1`}>Quantum</span>
                    <span className="font-mono text-foreground">{algo.complexity.quantum}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-border">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
              Ready to Harness <span className="text-quantum-gradient">Quantum Power</span>?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              QUANTUS AI brings these algorithms to your enterprise — no quantum physics PhD required.
            </p>
            <a
              href="/pricing"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all hover:shadow-lg hover:shadow-primary/20"
            >
              Explore Plans <ArrowRight size={16} />
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default QuantumComputing;
