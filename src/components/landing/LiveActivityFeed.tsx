import { motion } from "framer-motion";
import { Plane, Ship, Heart, Briefcase, Scale, Stethoscope, TrendingUp, Shield, Truck } from "lucide-react";
import { Link } from "react-router-dom";

const verticals = [
  { icon: <Plane size={12} />, name: "Aviation", desc: "Private jet sourcing, charter management, fleet operations" },
  { icon: <Stethoscope size={12} />, name: "Medical", desc: "Specialist matching, medical travel coordination" },
  { icon: <Briefcase size={12} />, name: "Staffing", desc: "Executive placement, crew management, security" },
  { icon: <Heart size={12} />, name: "Lifestyle", desc: "Estates, hospitality, concierge services" },
  { icon: <Truck size={12} />, name: "Logistics", desc: "Transport coordination, supply chain management" },
  { icon: <Ship size={12} />, name: "Marine", desc: "Yacht charter, vessel acquisition, maritime ops" },
  { icon: <Scale size={12} />, name: "Legal", desc: "Compliance review, trust structuring, due diligence" },
  { icon: <TrendingUp size={12} />, name: "Finance", desc: "Wealth advisory, portfolio management, M&A" },
  { icon: <Shield size={12} />, name: "Partnerships", desc: "Brokerage, vendor networks, co-investment" },
];

const LiveActivityFeed = () => (
  <section className="py-16 relative overflow-hidden">
    <div className="container mx-auto px-6 max-w-4xl">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="font-body text-[10px] tracking-[0.4em] uppercase text-primary/60">
            Platform Capabilities
          </span>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-semibold text-foreground">
          Nine Verticals. One Engine.
        </h2>
        <p className="text-sm text-muted-foreground mt-3 max-w-xl mx-auto">
          Every service category is orchestrated through a unified AI-driven deal pipeline — from intake to completion.
        </p>
      </div>

      <div className="space-y-2 py-4">
        {verticals.map((v, i) => (
          <motion.div
            key={v.name}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-4 px-5 py-3 rounded-xl border border-border/30 bg-card/30 backdrop-blur-sm group hover:border-primary/20 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary/15 transition-colors">
              {v.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{v.name}</p>
              <p className="text-[10px] text-muted-foreground tracking-wider">
                {v.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center mt-8"
      >
        <Link
          to="/waiting-list"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-xs tracking-[0.2em] uppercase font-medium hover:bg-primary/90 transition-colors"
        >
          Join the Waiting List
        </Link>
      </motion.div>
    </div>
  </section>
);

export default LiveActivityFeed;
