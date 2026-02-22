import { Check, X } from "lucide-react";
import { motion } from "framer-motion";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type CellValue = boolean | string;

interface FeatureRow {
  feature: string;
  tooltip: string;
  starter: CellValue;
  professional: CellValue;
  enterprise: CellValue;
}

const categories: { label: string; rows: FeatureRow[] }[] = [
  {
    label: "AI & Analytics",
    rows: [
      { feature: "AI queries / month", tooltip: "The number of AI-powered requests your organization can make each month.", starter: "5,000", professional: "Unlimited", enterprise: "Unlimited" },
      { feature: "Predictive analytics", tooltip: "Machine learning models that forecast trends, revenue, churn, and other key business metrics.", starter: true, professional: true, enterprise: true },
      { feature: "Anomaly detection", tooltip: "Automatically identifies unusual patterns in your data and triggers alerts.", starter: "Basic", professional: "Advanced", enterprise: "Custom" },
      { feature: "Data export (CSV/JSON)", tooltip: "Export your dashboard data and reports in CSV or JSON format.", starter: true, professional: true, enterprise: true },
      { feature: "PDF reports", tooltip: "Generate downloadable PDF reports of your analytics and predictions.", starter: false, professional: true, enterprise: true },
    ],
  },
  {
    label: "Usage & Limits",
    rows: [
      { feature: "AI query overage", tooltip: "Per-query cost once your included monthly AI query allowance is exceeded.", starter: "$0.003/query", professional: "Unlimited", enterprise: "Custom" },
      { feature: "Data processing", tooltip: "Data ingestion and storage capacity for analytics.", starter: "50 GB", professional: "500 GB", enterprise: "Unlimited" },
      { feature: "API calls", tooltip: "External API requests — webhooks, integrations, and data feeds.", starter: "100K", professional: "1M", enterprise: "Unlimited" },
    ],
  },
  {
    label: "Platform & Integration",
    rows: [
      { feature: "API access", tooltip: "RESTful endpoints to programmatically access AI capabilities and data.", starter: "Standard", professional: "Full", enterprise: "Full + Priority" },
      { feature: "API key management", tooltip: "Generate, revoke, and manage API keys for secure programmatic access.", starter: false, professional: true, enterprise: true },
      { feature: "Webhooks", tooltip: "Real-time HTTP callbacks that notify your systems when events occur.", starter: false, professional: true, enterprise: true },
      { feature: "Custom integrations", tooltip: "Connect to your existing tech stack via API integrations.", starter: false, professional: "Limited", enterprise: "Unlimited" },
    ],
  },
  {
    label: "Access & Collaboration",
    rows: [
      { feature: "API integrations", tooltip: "The number of concurrent API integrations under your subscription.", starter: "2", professional: "25", enterprise: "Unlimited" },
      { feature: "Role-based access control", tooltip: "Define permissions — admin, analyst, viewer — to control data access.", starter: false, professional: true, enterprise: true },
      { feature: "Audit log", tooltip: "A record of every action taken on the platform for compliance and accountability.", starter: false, professional: true, enterprise: true },
      { feature: "Shared dashboards", tooltip: "Share interactive dashboards with stakeholders or clients.", starter: false, professional: true, enterprise: true },
    ],
  },
  {
    label: "Support & SLA",
    rows: [
      { feature: "Support channels", tooltip: "AI-powered support across multiple channels.", starter: "AI Chat", professional: "24/7 AI Support", enterprise: "Dedicated AI Concierge" },
      { feature: "Uptime SLA", tooltip: "Guaranteed platform availability percentage.", starter: "99.9%", professional: "99.95%", enterprise: "99.99%" },
      { feature: "Performance reports", tooltip: "Scheduled reports summarizing AI impact, usage trends, and recommendations.", starter: "Weekly", professional: "Daily", enterprise: "Real-time" },
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

      <div className="overflow-x-auto -mx-6 px-6 scrollbar-thin">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="glass-card rounded-2xl overflow-hidden min-w-[540px]"
      >
        <div className="sticky top-16 z-10 grid grid-cols-[minmax(180px,1.2fr)_repeat(3,minmax(100px,1fr))] border-b border-border bg-card/95 backdrop-blur-md">
          <div className="p-5 sticky left-0 z-20 bg-card/95 backdrop-blur-md" />
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
            <div className="grid grid-cols-[minmax(180px,1.2fr)_repeat(3,minmax(100px,1fr))] bg-secondary/30 border-b border-border">
              <div className="p-4 pl-6 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground sticky left-0 z-20 bg-secondary/30 backdrop-blur-md">
                {cat.label}
              </div>
              <div className="col-span-3" />
            </div>

            {cat.rows.map((row, ri) => (
              <div
                key={row.feature}
                className={`grid grid-cols-[minmax(180px,1.2fr)_repeat(3,minmax(100px,1fr))] ${
                  ri < cat.rows.length - 1 || ci < categories.length - 1
                    ? "border-b border-border/50"
                    : ""
                } hover:bg-secondary/20 transition-colors`}
              >
                <div className="p-4 pl-6 text-sm text-foreground/70 flex items-center gap-2 sticky left-0 z-20 bg-card/95 backdrop-blur-md">
                  {row.feature}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info size={13} className="text-muted-foreground/50 hover:text-primary cursor-help transition-colors shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-[260px] text-xs leading-relaxed">
                      {row.tooltip}
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="p-4 text-center"><CellContent value={row.starter} /></div>
                <div className="p-4 text-center"><CellContent value={row.professional} /></div>
                <div className="p-4 text-center"><CellContent value={row.enterprise} /></div>
              </div>
            ))}
          </div>
        ))}
      </motion.div>
      </div>
    </div>
  </section>
);

export default ComparisonTable;
