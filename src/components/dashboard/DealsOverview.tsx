import { motion } from "framer-motion";
import { Loader2, CheckCircle2, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const cards = [
  {
    title: "In Progress",
    value: "4",
    desc: "Active deals across modules",
    icon: Loader2,
    cta: "View Deals",
    to: "/intake",
    ring: 65,
  },
  {
    title: "Awaiting Approval",
    value: "2",
    desc: "Negotiation drafts & documents",
    icon: Clock,
    cta: "Review Now",
    to: "/negotiation",
    ring: 30,
  },
  {
    title: "Recently Completed",
    value: "7",
    desc: "Last 30 days",
    icon: CheckCircle2,
    cta: "View Report",
    to: "/deal-completion",
    ring: 100,
  },
];

const DealsOverview = () => (
  <div className="grid sm:grid-cols-3 gap-4">
    {cards.map((card, i) => (
      <motion.div
        key={card.title}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 + i * 0.08 }}
        className="glass-card p-5 group hover:border-primary/20 transition-all duration-500"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2">{card.title}</p>
            <p className="font-display text-3xl font-medium text-foreground">{card.value}</p>
          </div>
          {/* Progress ring */}
          <div className="relative w-10 h-10">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--border))" strokeWidth="2" />
              <circle
                cx="18" cy="18" r="15" fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                strokeDasharray={`${card.ring * 0.94} 94`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <card.icon size={12} className="absolute inset-0 m-auto text-primary" strokeWidth={1.5} />
          </div>
        </div>
        <p className="font-body text-xs text-muted-foreground mb-4">{card.desc}</p>
        <Link
          to={card.to}
          className="inline-flex items-center gap-1 font-body text-[10px] tracking-[0.15em] uppercase text-primary hover:text-primary/80 transition-colors"
        >
          {card.cta} <ArrowRight size={10} />
        </Link>
      </motion.div>
    ))}
  </div>
);

export default DealsOverview;
