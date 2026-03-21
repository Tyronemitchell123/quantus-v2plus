import { motion } from "framer-motion";
import QuantumOrbit from "@/components/QuantumOrbit";
import quantumMission from "@/assets/quantum-mission.jpg";

const glowPulse = {
  boxShadow: [
    "0 0 20px -5px hsla(185, 100%, 55%, 0.15)",
    "0 0 50px -5px hsla(185, 100%, 55%, 0.35), 0 0 100px -10px hsla(270, 80%, 60%, 0.15)",
    "0 0 20px -5px hsla(185, 100%, 55%, 0.15)",
  ],
  transition: { duration: 5, repeat: Infinity, ease: "easeInOut" as const },
};

const AboutMission = () => (
  <section className="py-28 border-y border-border" aria-label="Our Mission">
    <div className="container mx-auto px-6">
      <div className="grid lg:grid-cols-2 gap-20 items-center">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-quantum-cyan font-display text-xs tracking-[0.4em] uppercase mb-4">
            Our Mission
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground leading-tight mb-8">
            Democratize Quantum Intelligence for the{" "}
            <span className="text-gold-gradient gold-glow-text">Enterprise</span>
          </h2>
          <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
            <p>
              We believe the next trillion-dollar leap in productivity won't come from faster
              chips — it will come from fundamentally different computation. Quantum
              superposition and entanglement unlock solution spaces classical systems can never
              reach.
            </p>
            <p>
              Every model we ship leverages quantum-enhanced algorithms — learning from data
              at exponential speed, adapting to markets in parallel realities, and delivering
              results that compound beyond classical limits.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92, x: 40 }}
          whileInView={{ opacity: 1, scale: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <motion.div
            animate={glowPulse}
            className="rounded-2xl overflow-hidden border border-quantum-cyan/20"
          >
            <img
              src={quantumMission}
              alt="Quantum entanglement visualization with interconnected qubits"
              className="w-full h-auto rounded-2xl"
            />
          </motion.div>
          <motion.div
            className="absolute -bottom-6 -right-6 w-28 h-28"
            animate={{ rotate: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          >
            <QuantumOrbit size={112} />
          </motion.div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default AboutMission;
