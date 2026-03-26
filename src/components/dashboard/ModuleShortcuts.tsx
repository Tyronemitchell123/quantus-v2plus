import { motion } from "framer-motion";
import { Plane, Heart, Users, Globe, Truck, Handshake, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const modules = [
  { icon: Plane, title: "Aviation", desc: "Aircraft sourcing and valuation.", to: "/intake" },
  { icon: Heart, title: "Medical & Wellness", desc: "Clinic matching and longevity.", to: "/intake" },
  { icon: Users, title: "Staffing", desc: "Household and estate personnel.", to: "/intake" },
  { icon: Globe, title: "Lifestyle", desc: "Ultra-luxury travel and experiences.", to: "/intake" },
  { icon: Truck, title: "Logistics", desc: "Dispatch and fleet management.", to: "/intake" },
  { icon: Handshake, title: "Partnerships", desc: "Revenue-share and licensing.", to: "/intake" },
];

const ModuleShortcuts = () => (
  <div>
    <p className="font-body text-[10px] tracking-[0.3em] uppercase text-primary/60 mb-4">Modules</p>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {modules.map((mod, i) => (
        <motion.div
          key={mod.title}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + i * 0.06 }}
        >
          <Link
            to={mod.to}
            className="glass-card p-5 block group hover:border-primary/20 transition-all duration-500"
          >
            <mod.icon className="w-5 h-5 text-primary mb-3" strokeWidth={1.5} />
            <h3 className="font-body text-sm font-medium text-foreground mb-1">{mod.title}</h3>
            <p className="font-body text-xs text-muted-foreground mb-3">{mod.desc}</p>
            <span className="inline-flex items-center gap-1 font-body text-[10px] tracking-[0.15em] uppercase text-primary/60 group-hover:text-primary transition-colors">
              Enter Module <ArrowRight size={10} />
            </span>
          </Link>
        </motion.div>
      ))}
    </div>
  </div>
);

export default ModuleShortcuts;
