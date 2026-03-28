import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, Loader2, Plus, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { ModuleDeal, ModuleSourcingResult, ModuleVendorOutreach } from "@/hooks/use-module-data";

const statusLabels: Record<string, string> = {
  intake: "Intake",
  sourcing: "Sourcing",
  matching: "Matching",
  negotiation: "Negotiation",
  execution: "Execution",
  completed: "Completed",
  cancelled: "Cancelled",
};

const statusColors: Record<string, string> = {
  intake: "border-blue-400/30 text-blue-400",
  sourcing: "border-amber-400/30 text-amber-400",
  matching: "border-purple-400/30 text-purple-400",
  negotiation: "border-orange-400/30 text-orange-400",
  execution: "border-emerald-400/30 text-emerald-400",
  completed: "border-emerald-500/30 text-emerald-500",
  cancelled: "border-red-400/30 text-red-400",
};

interface Props {
  deals: ModuleDeal[];
  sourcingResults: ModuleSourcingResult[];
  vendorOutreach: ModuleVendorOutreach[];
  loading: boolean;
  categoryLabel: string;
}

const ModuleLiveDeals = ({ deals, sourcingResults, vendorOutreach, loading, categoryLabel }: Props) => {
  if (loading) {
    return (
      <div className="glass-card border border-primary/10 p-6 mb-6">
        <div className="flex items-center gap-3">
          <Loader2 size={14} className="animate-spin text-primary" />
          <span className="font-body text-xs text-muted-foreground">Loading live data…</span>
        </div>
      </div>
    );
  }

  const activeDeals = deals.filter(d => d.status !== "completed" && d.status !== "cancelled");
  const completedDeals = deals.filter(d => d.status === "completed");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 space-y-4"
    >
      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Active Deals", value: activeDeals.length },
          { label: "Completed", value: completedDeals.length },
          { label: "Sourced Options", value: sourcingResults.length },
          { label: "Vendor Contacts", value: vendorOutreach.length },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card border border-primary/10 p-3 text-center"
          >
            <p className="font-display text-lg text-primary">{stat.value}</p>
            <p className="font-body text-[8px] tracking-[0.2em] uppercase text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Active deals list */}
      {activeDeals.length > 0 && (
        <div className="glass-card border border-primary/10 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-body text-[9px] tracking-[0.2em] uppercase text-primary/60">
              Your Active {categoryLabel} Deals
            </h3>
            <Link to="/deals" className="font-body text-[9px] text-primary hover:underline flex items-center gap-1">
              View All <ArrowRight size={8} />
            </Link>
          </div>
          <div className="space-y-2">
            {activeDeals.slice(0, 5).map((deal, i) => (
              <motion.div
                key={deal.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link
                  to={`/deals?deal=${deal.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:border-primary/20 bg-card/50 transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-body text-[10px] text-primary/60 font-mono shrink-0">{deal.deal_number}</span>
                    <span className="font-body text-xs text-foreground truncate">{deal.intent || deal.sub_category || "Request"}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-0.5 border rounded text-[8px] font-body uppercase tracking-wider ${statusColors[deal.status] || "border-border text-muted-foreground"}`}>
                      {statusLabels[deal.status] || deal.status}
                    </span>
                    <span className="font-body text-[9px] text-muted-foreground flex items-center gap-1">
                      <Clock size={8} />
                      {formatDistanceToNow(new Date(deal.updated_at), { addSuffix: true })}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Top sourcing results */}
      {sourcingResults.length > 0 && (
        <div className="glass-card border border-primary/10 p-4">
          <h3 className="font-body text-[9px] tracking-[0.2em] uppercase text-primary/60 mb-3">
            Top Sourced Options
          </h3>
          <div className="space-y-2">
            {sourcingResults.slice(0, 3).map((sr, i) => (
              <div key={sr.id} className="flex items-center justify-between p-2 rounded border border-border/30 bg-card/30">
                <div className="min-w-0">
                  <p className="font-body text-xs text-foreground truncate">{sr.name}</p>
                  <p className="font-body text-[10px] text-muted-foreground">{sr.location || sr.tier}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-1">
                    <TrendingUp size={8} className="text-primary" />
                    <span className="font-body text-[10px] text-primary">{sr.overall_score}%</span>
                  </div>
                  {sr.estimated_cost && (
                    <span className="font-body text-[10px] text-muted-foreground">
                      {sr.cost_currency || "USD"} {Number(sr.estimated_cost).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {deals.length === 0 && (
        <div className="glass-card border border-primary/10 p-8 text-center">
          <p className="font-body text-xs text-muted-foreground mb-3">No live {categoryLabel.toLowerCase()} operations yet.</p>
          <Link
            to="/intake"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-body text-[10px] tracking-[0.15em] uppercase rounded-lg hover:opacity-90 transition-all"
          >
            <Plus size={10} /> Submit First Request
          </Link>
        </div>
      )}
    </motion.div>
  );
};

export default ModuleLiveDeals;
