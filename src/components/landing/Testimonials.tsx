import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Testimonials = () => (
  <section className="py-24 sm:py-32 bg-background">
    <div className="container mx-auto px-6 text-center max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <p className="font-body text-xs tracking-[0.35em] uppercase text-primary/70 mb-6">Coming Soon</p>
        <h2 className="font-display text-3xl sm:text-4xl font-medium text-foreground leading-tight mb-6">
          Built for those who
          <br />
          <span className="italic text-primary">demand excellence.</span>
        </h2>
        <p className="font-body text-muted-foreground leading-relaxed mb-8 max-w-xl mx-auto">
          Quantus V2+ is currently in early access. We're onboarding select clients and partners
          who share our commitment to precision, discretion, and operational mastery.
        </p>
        <Link
          to="/waiting-list"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-primary text-primary-foreground text-xs tracking-[0.25em] uppercase font-medium hover:bg-primary/90 transition-colors"
        >
          Request Early Access
        </Link>
      </motion.div>
    </div>
  </section>
);

export default Testimonials;
