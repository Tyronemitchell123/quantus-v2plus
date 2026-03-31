import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plane, Heart, Users, Globe, Truck, Handshake, Anchor, Scale, Landmark, ArrowRight,
} from "lucide-react";

const modules = [
  {
    icon: Plane,
    title: "Aviation Intelligence",
    desc: "Aircraft sourcing, valuation, buyer-seller matching, and off-market inventory across light jets to VIP airliners.",
    stats: "49 aircraft tracked",
    link: "/modules",
  },
  {
    icon: Heart,
    title: "Medical & Wellness",
    desc: "Clinic matching, longevity programs, regenerative medicine, and post-care workflows with JCI-accredited providers.",
    stats: "52 providers",
    link: "/modules",
  },
  {
    icon: Users,
    title: "UHNW Staffing",
    desc: "Estate management, private office, household staff, security, and off-market talent with full background verification.",
    stats: "43 candidates",
    link: "/modules",
  },
  {
    icon: Globe,
    title: "Luxury Lifestyle",
    desc: "Ultra-luxury itineraries, private villas, yacht charters, Michelin dining, and off-market experiential access.",
    stats: "39 options",
    link: "/modules",
  },
  {
    icon: Truck,
    title: "Logistics & Recovery",
    desc: "Dispatch automation, secure transport, international logistics, fleet analytics, and emergency routing protocols.",
    stats: "34 operators",
    link: "/modules",
  },
  {
    icon: Handshake,
    title: "Partner Ecosystem",
    desc: "Partner scoring, compliance tracking, revenue-share modeling, and off-market vendor management across verticals.",
    stats: "40 vendors",
    link: "/modules",
  },
  {
    icon: Anchor,
    title: "Marine & Yachting",
    desc: "Motor yachts, superyachts, charter management, crew agencies, marina berths, and refit coordination.",
    stats: "78 vessels",
    link: "/modules",
  },
  {
    icon: Scale,
    title: "Legal Intelligence",
    desc: "Corporate law, IP & patents, tax & trust, litigation, immigration, and multi-jurisdictional compliance.",
    stats: "72 firms",
    link: "/modules",
  },
  {
    icon: Landmark,
    title: "Finance & Wealth",
    desc: "Wealth management, private banking, M&A advisory, tax advisory, fund management, and FX treasury.",
    stats: "72 providers",
    link: "/modules",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const ModuleShowcase = () => (
  <section className="py-24 sm:py-32">
    <div className="container mx-auto px-6">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
        custom={0}
        className="text-center mb-16"
      >
        <p className="font-body text-xs tracking-[0.35em] uppercase text-primary/70 mb-4">
          Sovereign Modules
        </p>
        <h2 className="font-display text-3xl sm:text-4xl font-medium text-foreground mb-3">
          Nine verticals. One intelligence layer.
        </h2>
        <p className="font-body text-sm text-muted-foreground max-w-xl mx-auto">
          Each module operates as an autonomous orchestration engine — sourcing, scoring, and managing deals across every vertical your portfolio demands.
        </p>
      </motion.div>

      {/* 3x3 grid on desktop, horizontal scroll on mobile */}
      <div className="flex lg:grid lg:grid-cols-3 gap-4 max-w-6xl mx-auto overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 lg:pb-0 -mx-6 px-6 lg:mx-auto lg:px-0">
        {modules.map((mod, i) => (
          <motion.div
            key={mod.title}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={i}
            className="snap-center min-w-[280px] sm:min-w-[300px] lg:min-w-0 shrink-0"
          >
            <Link to={mod.link} className="group block h-full">
              <div className="relative h-full glass-card rounded-xl p-6 transition-all duration-500 hover:border-primary/20 hover:shadow-[0_0_40px_-12px_hsl(var(--gold)/0.15)]">
                {/* Icon + Title */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/[0.08] border border-primary/10 flex items-center justify-center group-hover:bg-primary/[0.12] transition-colors duration-500">
                    <mod.icon className="w-4.5 h-4.5 text-primary" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-body text-xs tracking-[0.15em] uppercase text-foreground group-hover:text-primary transition-colors duration-300">
                      {mod.title}
                    </h3>
                    <p className="font-body text-[9px] text-primary/50">{mod.stats}</p>
                  </div>
                </div>

                {/* Description */}
                <p className="font-body text-xs text-muted-foreground leading-relaxed mb-5">
                  {mod.desc}
                </p>

                {/* CTA */}
                <div className="flex items-center gap-1.5 text-primary/40 group-hover:text-primary transition-colors duration-300">
                  <span className="font-body text-[9px] tracking-[0.2em] uppercase">
                    Explore Module
                  </span>
                  <ArrowRight size={10} className="transition-transform duration-300 group-hover:translate-x-1" />
                </div>

                {/* Gold underline animation */}
                <div className="h-px mt-3 bg-primary/0 group-hover:bg-primary/30 transition-all duration-500 origin-left scale-x-0 group-hover:scale-x-100" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default ModuleShowcase;
