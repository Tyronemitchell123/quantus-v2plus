import { motion } from "framer-motion";
import { AlertTriangle, TrendingUp, Zap, Brain } from "lucide-react";

const overageRates = [
  { feature: "AI Queries", rate: "£0.003", unit: "per query", icon: Brain, description: "Auto-charged when you exceed your plan's AI query limit" },
  { feature: "Quantum Jobs", rate: "£0.50", unit: "per job", icon: Zap, description: "Auto-charged for quantum computing jobs beyond your plan limit" },
];

const OveragePricing = () => {
  return (
    <section className="py-16 border-t border-border">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-primary font-display text-sm tracking-[0.3em] uppercase mb-4">Pay As You Go</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Usage-Based <span className="text-gold-gradient">Overage</span> Billing
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Never get blocked. When you exceed your plan limits, you're automatically billed at transparent per-unit rates.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-8">
          {overageRates.map((item, i) => (
            <motion.div
              key={item.feature}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-2xl p-6 flex items-start gap-4"
            >
              <div className="p-3 rounded-xl bg-primary/10">
                <item.icon size={24} className="text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground mb-1">{item.feature}</h3>
                <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-2xl font-bold text-foreground">{item.rate}</span>
                  <span className="text-xs text-muted-foreground">{item.unit}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
        >
          <AlertTriangle size={14} className="text-primary" />
          <span>Set spending caps in your <a href="/settings" className="text-primary hover:underline">account settings</a> to control overage costs.</span>
        </motion.div>
      </div>
    </section>
  );
};

export default OveragePricing;
