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
      { feature: "AI queries / month", tooltip: "The number of AI-powered requests your team can make each month, including predictions, classifications, and natural language queries.", starter: "10,000", professional: "Unlimited", enterprise: "Unlimited" },
      { feature: "Predictive analytics", tooltip: "Machine learning models that forecast trends, revenue, churn, and other key business metrics based on your historical data.", starter: true, professional: true, enterprise: true },
      { feature: "Real-time market intelligence", tooltip: "Live monitoring of market signals, competitor movements, and industry trends delivered directly to your dashboard.", starter: false, professional: true, enterprise: true },
      { feature: "Custom AI model training", tooltip: "Train bespoke AI models on your proprietary data for domain-specific predictions and recommendations.", starter: false, professional: true, enterprise: true },
      { feature: "Private model fine-tuning", tooltip: "Dedicated model instances fine-tuned exclusively on your data, hosted in an isolated environment for maximum security.", starter: false, professional: false, enterprise: true },
      { feature: "Anomaly detection", tooltip: "Automatically identifies unusual patterns in your data — from revenue spikes to user behavior shifts — and alerts your team.", starter: "Basic", professional: "Advanced", enterprise: "Custom" },
    ],
  },
  {
    label: "Platform & Integration",
    rows: [
      { feature: "API access", tooltip: "RESTful and GraphQL endpoints to programmatically access AI capabilities, data, and platform features from your own applications.", starter: "Standard", professional: "Full", enterprise: "Full + Priority" },
      { feature: "Webhooks", tooltip: "Real-time HTTP callbacks that notify your systems instantly when events occur — new predictions, alerts, or data changes.", starter: false, professional: true, enterprise: true },
      { feature: "On-premise deployment", tooltip: "Deploy the entire platform within your own infrastructure for complete data sovereignty and compliance requirements.", starter: false, professional: false, enterprise: true },
      { feature: "SSO / SAML", tooltip: "Single Sign-On integration with your identity provider (Okta, Azure AD, Google Workspace) for centralized access management.", starter: false, professional: false, enterprise: true },
      { feature: "Custom integrations", tooltip: "Connect to your existing tech stack — CRMs, ERPs, data warehouses, and other business tools via pre-built or custom connectors.", starter: false, professional: "Limited", enterprise: "Unlimited" },
    ],
  },
  {
    label: "Team & Collaboration",
    rows: [
      { feature: "Team seats", tooltip: "The number of individual user accounts that can access the platform simultaneously under your subscription.", starter: "2", professional: "25", enterprise: "Unlimited" },
      { feature: "Role-based access control", tooltip: "Define granular permissions — admin, analyst, viewer — to control who can access, modify, or export data and settings.", starter: false, professional: true, enterprise: true },
      { feature: "Audit log", tooltip: "A complete, immutable record of every action taken on the platform for compliance, security reviews, and accountability.", starter: false, professional: true, enterprise: true },
      { feature: "Shared dashboards", tooltip: "Collaboratively build and share interactive dashboards with teammates, stakeholders, or clients with configurable access.", starter: false, professional: true, enterprise: true },
    ],
  },
  {
    label: "Support & SLA",
    rows: [
      { feature: "Support channels", tooltip: "How you can reach our support team — from standard email and chat to dedicated phone lines and Slack channels.", starter: "Email & Chat", professional: "Priority 24/7", enterprise: "Dedicated" },
      { feature: "Dedicated account manager", tooltip: "A named point of contact who understands your business, proactively optimizes your setup, and coordinates internal resources.", starter: false, professional: true, enterprise: true },
      { feature: "Uptime SLA", tooltip: "Guaranteed platform availability percentage, backed by service credits if we fall below the commitment.", starter: "99.9%", professional: "99.95%", enterprise: "99.99%" },
      { feature: "White-glove onboarding", tooltip: "A guided implementation program including data migration, team training, workflow design, and go-live support.", starter: false, professional: false, enterprise: true },
      { feature: "Executive strategy sessions", tooltip: "Quarterly sessions with our AI leadership team to align platform usage with your strategic business objectives.", starter: false, professional: false, enterprise: true },
      { feature: "Performance reports", tooltip: "Scheduled reports summarizing AI impact, usage trends, ROI metrics, and optimization recommendations.", starter: "Weekly", professional: "Daily", enterprise: "Real-time" },
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

      <div className="overflow-x-auto -mx-6 px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="glass-card rounded-2xl overflow-hidden min-w-[600px]"
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
                <div className="p-4 pl-6 text-sm text-foreground/70 flex items-center gap-2">
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
