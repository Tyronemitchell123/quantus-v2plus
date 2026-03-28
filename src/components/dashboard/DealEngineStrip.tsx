import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const deals = [
  { id: "QTX-2847", category: "Aviation", phase: 3, progress: 42, nextAction: "Awaiting vendor response" },
  { id: "QTX-2851", category: "Medical", phase: 5, progress: 71, nextAction: "Schedule appointment" },
  { id: "QTX-2853", category: "Staffing", phase: 2, progress: 28, nextAction: "Review shortlist" },
  { id: "QTX-2856", category: "Lifestyle", phase: 6, progress: 85, nextAction: "Sign contract" },
];

const DealEngineStrip = () => (
  <div>
    <p className="font-body text-[10px] tracking-[0.3em] uppercase text-primary/60 mb-4">Deal Engine</p>
    <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
      {deals.map((deal, i) => (
        <motion.div
          key={deal.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 + i * 0.08 }}
          className="glass-card p-5 min-w-[220px] shrink-0 hover:border-primary/20 transition-all duration-500 group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-body text-xs font-medium text-foreground">{deal.id}</span>
            <span className="font-body text-[10px] tracking-wider uppercase text-primary/60">{deal.category}</span>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <span className="font-body text-[10px] text-muted-foreground">Phase {deal.phase}/7</span>
            <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${deal.progress}%` }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                className="h-full bg-primary rounded-full"
              />
            </div>
          </div>
          <p className="font-body text-[11px] text-muted-foreground mb-3">{deal.nextAction}</p>
          <Link
            to="/deals"
            className="inline-flex items-center gap-1 font-body text-[10px] tracking-[0.1em] uppercase text-primary/60 group-hover:text-primary transition-colors"
          >
            Open <ArrowRight size={9} />
          </Link>
        </motion.div>
      ))}
    </div>
  </div>
);

export default DealEngineStrip;
