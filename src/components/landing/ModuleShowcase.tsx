import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plane, Heart, Users, Globe, Truck, Handshake, ArrowRight } from "lucide-react";

import heroAviation from "@/assets/hero-aviation.jpg";
import heroWellness from "@/assets/hero-wellness.jpg";
import heroEstate from "@/assets/hero-estate.jpg";
import heroLifestyle from "@/assets/hero-lifestyle.jpg";
import heroPrecision from "@/assets/hero-precision.jpg";
import heroTravel from "@/assets/hero-travel.jpg";

const modules = [
  { icon: Plane, title: "Aviation Intelligence", desc: "Aircraft sourcing, valuation, and buyer-seller matching.", image: heroAviation, link: "/dashboard" },
  { icon: Heart, title: "Medical & Wellness", desc: "Clinic matching, longevity programs, and post-care workflows.", image: heroWellness, link: "/dashboard" },
  { icon: Users, title: "UHNW Staffing", desc: "Role definition, matchmaking, and estate digital twin.", image: heroEstate, link: "/dashboard" },
  { icon: Globe, title: "Luxury Travel", desc: "Ultra-luxury itineraries, hotel and yacht matching.", image: heroLifestyle, link: "/dashboard" },
  { icon: Truck, title: "Logistics & Recovery", desc: "Dispatch automation, fleet analytics, and compliance.", image: heroPrecision, link: "/dashboard" },
  { icon: Handshake, title: "Partnership Ecosystem", desc: "Partner scoring, revenue-share modeling, and licensing.", image: heroTravel, link: "/dashboard" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const ModuleShowcase = () => (
  <section className="py-24 sm:py-32">
    <div className="container mx-auto px-6">
      <motion.div
        initial="hidden" whileInView="visible" viewport={{ once: true }}
        variants={fadeUp} custom={0}
        className="text-center mb-16"
      >
        <p className="font-body text-xs tracking-[0.35em] uppercase text-primary/70 mb-4">Modules</p>
        <h2 className="font-display text-3xl sm:text-4xl font-medium text-foreground">
          Six verticals. One intelligence layer.
        </h2>
      </motion.div>

      {/* Horizontal snap-scroll on mobile, grid on desktop */}
      <div className="flex lg:grid lg:grid-cols-3 gap-5 max-w-6xl mx-auto overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 lg:pb-0 -mx-6 px-6 lg:mx-auto lg:px-0">
        {modules.map((mod, i) => (
          <motion.div
            key={mod.title}
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp} custom={i}
            whileHover={{ scale: 1.02, rotateY: 2 }}
            className="relative overflow-hidden group cursor-pointer snap-center min-w-[280px] sm:min-w-[320px] lg:min-w-0 shrink-0"
          >
            <Link to={mod.link}>
              <div className="relative h-64 overflow-hidden">
                <img
                  src={mod.image} alt={mod.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy" width={640} height={400}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                <div className="absolute inset-0 border border-primary/0 group-hover:border-primary/20 transition-all duration-500" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-center gap-2.5 mb-2">
                  <mod.icon className="w-4 h-4 text-primary" strokeWidth={1.5} />
                  <h3 className="font-body text-xs tracking-[0.2em] uppercase text-primary/80">{mod.title}</h3>
                </div>
                <p className="font-body text-xs text-muted-foreground leading-relaxed mb-3">{mod.desc}</p>
                {/* Gold underline animation on hover */}
                <div className="flex items-center gap-1.5 text-primary/50 group-hover:text-primary transition-colors duration-300">
                  <span className="font-body text-[10px] tracking-[0.2em] uppercase">Explore Module</span>
                  <ArrowRight size={10} />
                </div>
                <div className="h-px mt-2 bg-primary/0 group-hover:bg-primary/40 transition-all duration-500 origin-left scale-x-0 group-hover:scale-x-100" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default ModuleShowcase;
