import { motion } from "framer-motion";
import heroWellness from "@/assets/hero-wellness.jpg";

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
          <p className="text-primary font-body text-xs tracking-[0.4em] uppercase mb-4">
            Our Mission
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-medium text-foreground leading-tight mb-8">
            Orchestrate Every Dimension of{" "}
            <span className="text-gold-gradient italic">Ultra-Premium Life</span>
          </h2>
          <div className="space-y-6 text-muted-foreground text-lg leading-relaxed font-body">
            <p>
              We believe the next leap in service excellence won't come from more staff — it will come from fundamentally different intelligence. Anticipatory AI that operates across aviation, medical travel, staffing, and lifestyle simultaneously.
            </p>
            <p>
              Every workflow we build leverages multi-vertical orchestration — learning preferences across domains, automating high-value decisions, and delivering results that compound beyond what any single concierge could achieve.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92, x: 40 }}
          whileInView={{ opacity: 1, scale: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden group"
        >
          <img
            src={heroWellness}
            alt="Ultra-luxury wellness environment"
            className="w-full h-auto rounded-none transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
            width={1920}
            height={1080}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
        </motion.div>
      </div>
    </div>
  </section>
);

export default AboutMission;
