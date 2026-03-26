import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import heroEstate from "@/assets/hero-estate.jpg";

const AboutCTA = () => (
  <section className="relative py-28 overflow-hidden" aria-label="Call to Action">
    <img
      src={heroEstate}
      alt=""
      className="absolute inset-0 w-full h-full object-cover opacity-15"
      loading="lazy"
      width={1920}
      height={1080}
    />
    <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />

    <div className="container mx-auto px-6 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="text-center max-w-2xl mx-auto"
      >
        <h2 className="font-display text-3xl md:text-5xl font-medium text-foreground mb-6 leading-tight">
          Your Private Office.{" "}
          <span className="text-gold-gradient italic">One Interface.</span>
        </h2>
        <p className="text-muted-foreground text-lg leading-relaxed mb-10 font-body">
          Join a select circle of operators who demand intelligence that matches their ambition.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/contact"
            className="px-8 py-3.5 font-body text-sm font-medium tracking-widest uppercase bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 inline-flex items-center gap-2"
          >
            Request Access <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/pricing"
            className="px-8 py-3.5 font-body text-sm font-medium tracking-widest uppercase border border-border text-foreground/70 hover:text-foreground hover:border-primary/30 transition-all duration-300"
          >
            View Membership
          </Link>
        </div>
      </motion.div>
    </div>
  </section>
);

export default AboutCTA;
