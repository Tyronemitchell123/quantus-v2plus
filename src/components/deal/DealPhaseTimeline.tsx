import { motion } from "framer-motion";

const phaseLabels = ["Intake", "Sourcing", "Outreach", "Shortlist", "Negotiation", "Workflow", "Documents", "Completion"];
const statusToPhase: Record<string, number> = {
  classified: 1, intake: 1, sourcing: 2, outreach: 3, matching: 3, shortlisting: 4, negotiation: 5, execution: 6, documentation: 7, completed: 8, cancelled: 8,
};

interface Deal {
  id: string;
  status: string;
}

interface Props {
  deals: Deal[];
}

const DealPhaseTimeline = ({ deals }: Props) => {
  const phaseCounts = phaseLabels.map((_, i) => {
    return deals.filter(d => (statusToPhase[d.status] || 1) === i + 1).length;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-card rounded-xl p-6 mb-8"
    >
      <p className="font-body text-[10px] tracking-[0.25em] uppercase text-gold-soft/50 mb-4">Pipeline Overview</p>
      <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide">
        {phaseLabels.map((label, i) => {
          const count = phaseCounts[i];
          const hasDeals = count > 0;

          return (
            <div key={label} className="flex items-center shrink-0">
              <div className="flex flex-col items-center gap-2 min-w-[80px]">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-body font-medium border transition-all ${
                    hasDeals
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground/40"
                  }`}
                >
                  {count > 0 ? count : i + 1}
                </div>
                <span className="font-body text-[9px] tracking-wider uppercase text-muted-foreground whitespace-nowrap">
                  {label}
                </span>
              </div>
              {i < phaseLabels.length - 1 && (
                <div className={`w-6 h-px mx-0.5 ${hasDeals ? "bg-primary/30" : "bg-border"}`} />
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default DealPhaseTimeline;
