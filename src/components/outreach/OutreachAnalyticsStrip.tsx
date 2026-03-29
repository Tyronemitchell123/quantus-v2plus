import { motion } from "framer-motion";
import { TrendingUp, Clock, Percent, BarChart3 } from "lucide-react";

interface Props {
  outreachList: {
    status: string;
    negotiation_ready: boolean;
    response_time_hours: number | null;
    created_at: string;
  }[];
}

const OutreachAnalyticsStrip = ({ outreachList }: Props) => {
  const total = outreachList.length;
  if (total === 0) return null;

  const responded = outreachList.filter(
    (o) => o.status === "responded" || o.status === "negotiation_ready" || o.negotiation_ready
  ).length;
  const responseRate = Math.round((responded / total) * 100);

  const responseTimes = outreachList
    .filter((o) => o.response_time_hours != null)
    .map((o) => o.response_time_hours!);
  const avgResponseTime = responseTimes.length > 0
    ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
    : null;

  const negotiationReady = outreachList.filter((o) => o.negotiation_ready).length;
  const conversionRate = responded > 0
    ? Math.round((negotiationReady / responded) * 100)
    : 0;

  const metrics = [
    {
      label: "Response Rate",
      value: `${responseRate}%`,
      icon: Percent,
      color: responseRate >= 50 ? "text-success" : "text-accent",
    },
    {
      label: "Avg Response Time",
      value: avgResponseTime != null ? `${avgResponseTime}h` : "—",
      icon: Clock,
      color: avgResponseTime != null && avgResponseTime <= 24 ? "text-success" : "text-primary",
    },
    {
      label: "Conversion to Negotiation",
      value: `${conversionRate}%`,
      icon: TrendingUp,
      color: conversionRate >= 50 ? "text-success" : "text-primary",
    },
    {
      label: "Engagement Score",
      value: `${Math.min(100, Math.round((responseRate * 0.4) + (conversionRate * 0.4) + (avgResponseTime != null && avgResponseTime <= 24 ? 20 : 0)))}`,
      icon: BarChart3,
      color: "text-primary",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-4 mb-6"
    >
      <p className="font-body text-[9px] tracking-[0.25em] uppercase text-gold-soft/50 mb-3">
        Outreach Performance
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center shrink-0">
              <m.icon size={12} className={m.color} />
            </div>
            <div>
              <p className={`font-display text-lg leading-none ${m.color}`}>{m.value}</p>
              <p className="font-body text-[8px] tracking-wider uppercase text-muted-foreground mt-0.5">{m.label}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default OutreachAnalyticsStrip;