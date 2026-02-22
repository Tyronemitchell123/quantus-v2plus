import { motion } from "framer-motion";
import { Database, Brain, Globe } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const usageItems = [
  {
    icon: Brain,
    label: "AI Queries",
    price: "$0.003",
    unit: "per query",
    tooltip: "Standard AI inference queries — text analysis, classification, summarization.",
    included: "5K included in Starter, unlimited in Professional",
  },
  {
    icon: Database,
    label: "Data Processing",
    price: "$0.40",
    unit: "per GB",
    tooltip: "Data ingestion and storage for analytics and reports.",
    included: "50 GB in Starter, 500 GB in Professional",
  },
  {
    icon: Globe,
    label: "API Calls",
    price: "$0.0005",
    unit: "per call",
    tooltip: "External API requests — webhooks, integrations, data feeds.",
    included: "100K in Starter, 1M in Professional",
  },
];

const UsagePricing = () => {
  return (
    <section className="py-24 border-t border-border">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <p className="text-primary font-display text-sm tracking-[0.3em] uppercase mb-4">
            Pay As You Go
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Usage-Based <span className="text-gold-gradient gold-glow-text">Pricing</span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Every plan includes generous usage allowances. Overages are billed at transparent per-unit rates — no surprises.
          </p>
        </motion.div>

        <TooltipProvider>
          <div className="grid sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {usageItems.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="glass-card rounded-xl p-6 text-center group hover:ring-1 hover:ring-primary/20 transition-all"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 mb-4">
                  <item.icon size={20} className="text-primary" />
                </div>

                <h3 className="font-display text-sm font-semibold text-foreground mb-3">
                  {item.label}
                </h3>

                <div className="mb-3">
                  <span className="font-display text-2xl font-bold text-foreground">
                    {item.price}
                  </span>
                  <span className="text-muted-foreground text-xs ml-1">
                    {item.unit}
                  </span>
                </div>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-xs text-muted-foreground leading-relaxed cursor-help border-b border-dashed border-muted-foreground/30 inline">
                      {item.included}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-[220px] text-xs">
                    {item.tooltip}
                  </TooltipContent>
                </Tooltip>
              </motion.div>
            ))}
          </div>
        </TooltipProvider>
      </div>
    </section>
  );
};

export default UsagePricing;
