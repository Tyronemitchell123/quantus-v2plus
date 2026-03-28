import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const testimonials = [
  { quote: "Quantus V2+ feels like having a private office that never sleeps.", source: "UHNW Family Office, London" },
  { quote: "The orchestration across aviation and staffing was seamless. Nothing else comes close.", source: "Private Client, Dubai" },
  { quote: "We reduced deal cycle time by 60%. The AI anticipates what we need before we ask.", source: "Executive Advisor, Geneva" },
];

const Testimonials = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setCurrent((p) => (p + 1) % testimonials.length), 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-24 sm:py-32 bg-background">
      <div className="container mx-auto px-6 text-center max-w-3xl">
        <div className="relative min-h-[180px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.6 }}
            >
              <span className="font-display text-5xl text-primary/30 leading-none">"</span>
              <p className="font-display text-xl sm:text-2xl italic text-foreground leading-relaxed mt-2 mb-6">
                {testimonials[current].quote}
              </p>
              <p className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground">
                — {testimonials[current].source}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                i === current ? "bg-primary w-4" : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
