import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import QuantumOrbit from "@/components/QuantumOrbit";

const AboutCTA = () => (
  <section className="py-28 relative overflow-hidden" aria-label="Get Started">
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-quantum-cyan/[0.03] to-transparent" />
    <div className="container mx-auto px-6 relative z-10 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="max-w-2xl mx-auto"
      >
        <motion.div
          className="inline-block mb-8"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          <QuantumOrbit size={64} />
        </motion.div>
        <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground leading-tight mb-6">
          Ready to Think in{" "}
          <span className="text-quantum-gradient">Superposition?</span>
        </h2>
        <p className="text-muted-foreground text-lg leading-relaxed mb-10">
          Join the enterprises already operating at quantum speed. No tickets. No wait times.
          Just intelligence that compounds.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-display">
            <Link to="/contact">
              Start Your Quantum Journey <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="font-display border-border hover:bg-accent">
            <Link to="/pricing">View Pricing</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  </section>
);

export default AboutCTA;
