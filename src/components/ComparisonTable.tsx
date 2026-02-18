import { Check, X, Minus } from "lucide-react";
import { motion } from "framer-motion";

type CellValue = boolean | string;

interface FeatureRow {
  feature: string;
  starter: CellValue;
  professional: CellValue;
  enterprise: CellValue;
}

const categories: { label: string; rows: FeatureRow[] }[] = [
  {
    label: "AI & Analytics",
    rows: [
      { feature: "AI queries / month", starter: "10,000", professional: "Unlimited", enterprise: "Unlimited" },
      { feature: "Predictive analytics", starter: true, professional: true, enterprise: true },
      { feature: "Real-time market intelligence", starter: false, professional: true, enterprise: true },
      { feature: "Custom AI model training", starter: false, professional: true, enterprise: true },
      { feature: "Private model fine-tuning", starter: false, professional: false, enterprise: true },
      { feature: "Anomaly detection", starter: "Basic", professional: "Advanced", enterprise: "Custom" },
    ],
  },
  {
    label: "Platform & Integration",
    rows: [
      { feature: "API access", starter: "Standard", professional: "Full", enterprise: "Full + Priority" },
      { feature: "Webhooks", starter: false, professional: true, enterprise: true },
      { feature: "On-premise deployment", starter: false, professional: false, enterprise: true },
      { feature: "SSO / SAML", starter: false, professional: false, enterprise: true },
      { feature: "Custom integrations", starter: false, professional: "Limited", enterprise: "Unlimited" },
    ],
  },
  {
    label: "Team & Collaboration",
    rows: [
      { feature: "Team seats", starter: "2", professional: "25", enterprise: "Unlimited" },
      { feature: "Role-based access control", starter: false, professional: true, enterprise: true },
      { feature: "Audit log", starter: false, professional: true, enterprise: true },
      { feature: "Shared dashboards", starter: false, professional: true, enterprise: true },
    ],
  },
  {
    label: "Support & SLA",
    rows: [
      { feature: "Support channels", starter: "Email & Chat", professional: "Priority 24/7", enterprise: "Dedicated" },
      { feature: "Dedicated account manager", starter: false, professional: true, enterprise: true },
      { feature: "Uptime SLA", starter: "99.9%", professional: "99.95%", enterprise: "99.99%" },
      { feature: "White-glove onboarding", starter: false, professional: false, enterprise: true },
      { feature: "Executive strategy sessions", starter: false, professional: false, enterprise: true },
      { feature: "Performance reports", starter: "Weekly", professional: "Daily", enterprise: "Real-time" },
    ],
  },
];

const tierHeaders = ["Starter", "Professional", "Enterprise"];

const CellContent = ({ value }: { value: CellValue }) => {
  if (value === true) return <Check size={16} className="text-primary mx-auto" />;
  if (value === false) return <X size={14} className="text-muted-foreground/40 mx-auto" />;
  return <span className="text-foreground/80 text-sm">{value}</span>;
};

const ComparisonTable = () => (
  <section className="pb-24">
    <div className="container mx-auto px-6 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <p className="text-primary font-display text-sm tracking-[0.3em] uppercase mb-4">
          Compare
        </p>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
          Feature <span className="text-gold-gradient">Breakdown</span>
        </h2>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="glass-card rounded-2xl overflow-hidden"
      >
        {/* Sticky header */}
        <div className="sticky top-16 z-10 grid grid-cols-[1fr_repeat(3,minmax(100px,1fr))] border-b border-border bg-card/95 backdrop-blur-md">
          <div className="p-5" />
          {tierHeaders.map((h, i) => (
            <div
              key={h}
              className={`p-5 text-center font-display text-sm font-semibold tracking-wide ${
                i === 1 ? "text-primary" : "text-foreground"
              }`}
            >
              {h}
            </div>
          ))}
        </div>

        {categories.map((cat, ci) => (
          <div key={cat.label}>
            {/* Category header */}
            <div className="grid grid-cols-[1fr_repeat(3,minmax(100px,1fr))] bg-secondary/30 border-b border-border">
              <div className="p-4 pl-6 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {cat.label}
              </div>
              <div className="col-span-3" />
            </div>

            {cat.rows.map((row, ri) => (
              <div
                key={row.feature}
                className={`grid grid-cols-[1fr_repeat(3,minmax(100px,1fr))] ${
                  ri < cat.rows.length - 1 || ci < categories.length - 1
                    ? "border-b border-border/50"
                    : ""
                } hover:bg-secondary/20 transition-colors`}
              >
                <div className="p-4 pl-6 text-sm text-foreground/70">{row.feature}</div>
                <div className="p-4 text-center"><CellContent value={row.starter} /></div>
                <div className="p-4 text-center"><CellContent value={row.professional} /></div>
                <div className="p-4 text-center"><CellContent value={row.enterprise} /></div>
              </div>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  </section>
);

export default ComparisonTable;
