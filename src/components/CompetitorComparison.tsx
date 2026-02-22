import { motion } from "framer-motion";
import { Check, X, Minus } from "lucide-react";

type CellValue = "yes" | "no" | "partial" | string;

interface CompetitorRow {
  feature: string;
  quantus: CellValue;
  palantir: CellValue;
  c3ai: CellValue;
  darktrace: CellValue;
}

const rows: CompetitorRow[] = [
  { feature: "AI-powered analytics", quantus: "yes", palantir: "yes", c3ai: "yes", darktrace: "partial" },
  { feature: "Anomaly detection alerts", quantus: "yes", palantir: "partial", c3ai: "partial", darktrace: "yes" },
  { feature: "Real-time predictive analytics", quantus: "yes", palantir: "yes", c3ai: "yes", darktrace: "yes" },
  { feature: "Data export (CSV/JSON/PDF)", quantus: "yes", palantir: "partial", c3ai: "partial", darktrace: "no" },
  { feature: "Webhook integrations", quantus: "yes", palantir: "yes", c3ai: "partial", darktrace: "yes" },
  { feature: "API key management", quantus: "yes", palantir: "partial", c3ai: "yes", darktrace: "no" },
  { feature: "Transparent usage pricing", quantus: "yes", palantir: "no", c3ai: "partial", darktrace: "no" },
  { feature: "AI concierge chat", quantus: "yes", palantir: "no", c3ai: "no", darktrace: "no" },
];

const competitors = [
  { key: "quantus" as const, label: "QUANTUS", highlight: true },
  { key: "palantir" as const, label: "Palantir" },
  { key: "c3ai" as const, label: "C3.ai" },
  { key: "darktrace" as const, label: "Darktrace" },
];

const CellIcon = ({ value }: { value: CellValue }) => {
  if (value === "yes") return <Check size={16} className="text-primary" />;
  if (value === "no") return <X size={16} className="text-muted-foreground/40" />;
  if (value === "partial") return <Minus size={16} className="text-muted-foreground" />;
  return <span className="text-xs text-muted-foreground">{value}</span>;
};

const CompetitorComparison = () => {
  return (
    <section className="py-24 border-t border-border" aria-label="Competitor Comparison">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-primary font-display text-sm tracking-[0.3em] uppercase mb-4">
            How We Compare
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            QUANTUS vs the <span className="text-gold-gradient gold-glow-text">Competition</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mt-4">
            The only platform combining autonomous AI analytics with transparent pricing and real-time alerts.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="overflow-x-auto max-w-5xl mx-auto"
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-4 pr-4 font-display text-muted-foreground font-medium min-w-[180px]">
                  Capability
                </th>
                {competitors.map((c) => (
                  <th
                    key={c.key}
                    className={`py-4 px-3 font-display text-center min-w-[100px] ${
                      c.highlight
                        ? "text-primary font-semibold"
                        : "text-muted-foreground font-medium"
                    }`}
                  >
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <motion.tr
                  key={row.feature}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                >
                  <td className="py-3.5 pr-4 text-foreground/80">{row.feature}</td>
                  {competitors.map((c) => (
                    <td
                      key={c.key}
                      className={`py-3.5 px-3 text-center ${
                        c.highlight ? "bg-primary/[0.04]" : ""
                      }`}
                    >
                      <span className="inline-flex justify-center">
                        <CellIcon value={row[c.key]} />
                      </span>
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </section>
  );
};

export default CompetitorComparison;
