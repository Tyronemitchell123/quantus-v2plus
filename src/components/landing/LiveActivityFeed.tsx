import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plane, Ship, Heart, Briefcase, Scale, Stethoscope, Building, TrendingUp, Shield } from "lucide-react";

interface Activity {
  id: number;
  icon: React.ReactNode;
  text: string;
  time: string;
  category: string;
}

const ACTIVITY_POOL = [
  { icon: <Plane size={12} />, text: "Private jet sourced: London → Dubai", category: "Aviation" },
  { icon: <Ship size={12} />, text: "Yacht charter confirmed: Adriatic Sea", category: "Marine" },
  { icon: <Heart size={12} />, text: "Wellness retreat booked: Swiss Alps", category: "Lifestyle" },
  { icon: <Briefcase size={12} />, text: "Executive assistant placed: Singapore", category: "Staffing" },
  { icon: <Scale size={12} />, text: "Legal review completed: Trust restructure", category: "Legal" },
  { icon: <Stethoscope size={12} />, text: "Medical specialist matched: Zurich", category: "Medical" },
  { icon: <Building size={12} />, text: "Property acquisition: Mayfair penthouse", category: "Real Estate" },
  { icon: <TrendingUp size={12} />, text: "Portfolio rebalanced: £12M allocation", category: "Finance" },
  { icon: <Shield size={12} />, text: "Compliance audit passed: KYC verified", category: "Compliance" },
  { icon: <Plane size={12} />, text: "Off-market aircraft identified: G650ER", category: "Aviation" },
  { icon: <Ship size={12} />, text: "Vessel inspection scheduled: 42m Benetti", category: "Marine" },
  { icon: <Heart size={12} />, text: "Private chef arranged: Côte d'Azur villa", category: "Lifestyle" },
  { icon: <Briefcase size={12} />, text: "Security team deployed: Monaco GP", category: "Staffing" },
  { icon: <Stethoscope size={12} />, text: "Concierge medicine: Annual review booked", category: "Medical" },
  { icon: <Building size={12} />, text: "Vendor negotiation closed: 18% below ask", category: "Real Estate" },
];

const LiveActivityFeed = () => {
  const [items, setItems] = useState<Activity[]>([]);
  const counterRef = useRef(0);

  useEffect(() => {
    // Seed initial items
    const initial = ACTIVITY_POOL.slice(0, 3).map((a, i) => ({
      ...a,
      id: i,
      time: `${Math.floor(Math.random() * 5) + 1}m ago`,
    }));
    counterRef.current = 3;
    setItems(initial);

    const interval = setInterval(() => {
      const idx = counterRef.current % ACTIVITY_POOL.length;
      const newItem: Activity = {
        ...ACTIVITY_POOL[idx],
        id: counterRef.current,
        time: "Just now",
      };
      counterRef.current += 1;

      setItems((prev) => {
        const next = [newItem, ...prev];
        return next.slice(0, 5);
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-16 relative overflow-hidden">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-body text-[10px] tracking-[0.4em] uppercase text-primary/60">
              Live Platform Activity
            </span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-foreground">
            Orchestration in Motion
          </h2>
        </div>

        <div className="relative">
          {/* Gradient fade edges */}
          <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />

          <div className="space-y-2 py-4">
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center gap-4 px-5 py-3 rounded-xl border border-border/30 bg-card/30 backdrop-blur-sm group hover:border-primary/20 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary/15 transition-colors">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{item.text}</p>
                    <p className="text-[10px] text-muted-foreground tracking-wider uppercase">
                      {item.category}
                    </p>
                  </div>
                  <span className="text-[10px] text-muted-foreground/60 shrink-0 tabular-nums">
                    {item.time}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-6 text-[10px] tracking-[0.3em] uppercase text-muted-foreground/40"
        >
          Simulated activity based on real platform workflows
        </motion.p>
      </div>
    </section>
  );
};

export default LiveActivityFeed;
