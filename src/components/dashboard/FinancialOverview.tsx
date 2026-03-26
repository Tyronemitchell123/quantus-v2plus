import { useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, Clock } from "lucide-react";

const commissionBreakdown = [
  { label: "Aviation", value: "£42,000" },
  { label: "Medical", value: "£8,500" },
  { label: "Staffing", value: "£6,200" },
  { label: "Lifestyle", value: "£3,800" },
  { label: "Logistics", value: "£1,200" },
];

const FinancialOverview = () => {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-5 group"
        onMouseEnter={() => setHovered("commissions")}
        onMouseLeave={() => setHovered(null)}
      >
        <div className="flex items-center gap-2 mb-3">
          <DollarSign size={14} className="text-primary" />
          <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Commissions Earned</p>
        </div>
        <p className="font-display text-2xl font-medium text-foreground mb-1">£61,700</p>
        <p className="font-body text-[10px] text-muted-foreground">This month</p>

        {hovered === "commissions" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-3 pt-3 border-t border-border/50 space-y-1.5"
          >
            {commissionBreakdown.map((item) => (
              <div key={item.label} className="flex justify-between">
                <span className="font-body text-[10px] text-muted-foreground">{item.label}</span>
                <span className="font-body text-[10px] text-foreground">{item.value}</span>
              </div>
            ))}
          </motion.div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="glass-card p-5"
      >
        <div className="flex items-center gap-2 mb-3">
          <Clock size={14} className="text-primary" />
          <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Outstanding Payments</p>
        </div>
        <p className="font-display text-2xl font-medium text-foreground mb-1">£18,400</p>
        <p className="font-body text-[10px] text-muted-foreground">3 invoices pending</p>
      </motion.div>
    </div>
  );
};

export default FinancialOverview;
