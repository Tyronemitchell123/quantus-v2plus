import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Plane, Heart, Users, ArrowRight, Check, Clock, Lightbulb, Activity,
  FileText, CreditCard, MessageSquare, TrendingUp, Zap, Target,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const DashboardFeed = () => {
  // Live KPI data
  const { data: kpiData } = useQuery({
    queryKey: ["dashboard-kpis"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const [dealsRes, completedRes, commissionsRes, invoicesRes] = await Promise.all([
        supabase.from("deals").select("id, deal_number, category, status, deal_value_estimate, updated_at, created_at").eq("user_id", user.id).neq("status", "completed").order("updated_at", { ascending: false }).limit(10),
        supabase.from("deals").select("id, completed_at, created_at").eq("user_id", user.id).eq("status", "completed"),
        supabase.from("commission_logs").select("commission_cents, status").eq("user_id", user.id),
        supabase.from("invoices").select("amount_cents, status").eq("user_id", user.id),
      ]);

      const activeDeals = dealsRes.data || [];
      const completedDeals = completedRes.data || [];
      const commissions = commissionsRes.data || [];
      const invoices = invoicesRes.data || [];

      // Pipeline value
      const pipelineValue = activeDeals.reduce((sum, d) => sum + (d.deal_value_estimate || 0), 0);

      // Revenue earned (paid commissions)
      const revenueEarned = commissions.filter(c => c.status === "paid").reduce((sum, c) => sum + (c.commission_cents || 0), 0);

      // Pending revenue
      const pendingRevenue = commissions.filter(c => c.status !== "paid").reduce((sum, c) => sum + (c.commission_cents || 0), 0);

      // Avg completion time (days)
      let avgCompletionDays = 0;
      if (completedDeals.length > 0) {
        const totalDays = completedDeals.reduce((sum, d) => {
          if (!d.completed_at || !d.created_at) return sum;
          return sum + (new Date(d.completed_at).getTime() - new Date(d.created_at).getTime()) / (1000 * 60 * 60 * 24);
        }, 0);
        avgCompletionDays = Math.round(totalDays / completedDeals.length);
      }

      // Conversion rate
      const totalDeals = activeDeals.length + completedDeals.length;
      const conversionRate = totalDeals > 0 ? Math.round((completedDeals.length / totalDeals) * 100) : 0;

      return {
        activeDeals,
        completedCount: completedDeals.length,
        pipelineValue,
        revenueEarned,
        pendingRevenue,
        avgCompletionDays,
        conversionRate,
        totalDeals,
      };
    },
    refetchInterval: 60000,
  });

  // Recent activity from notifications
  const { data: recentActivity } = useQuery({
    queryKey: ["dashboard-activity"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase
        .from("notifications")
        .select("title, body, category, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
    refetchInterval: 30000,
  });

  const formatGBP = (cents: number) => `£${(cents / 100).toLocaleString("en-GB", { minimumFractionDigits: 0 })}`;
  const formatValue = (val: number) => val >= 1000000 ? `£${(val / 1000000).toFixed(1)}M` : val >= 1000 ? `£${(val / 1000).toFixed(0)}K` : `£${val}`;

  const kpis = [
    { label: "Pipeline Value", value: formatValue((kpiData?.pipelineValue || 0) * 100), icon: TrendingUp, color: "text-primary" },
    { label: "Revenue Earned", value: formatGBP(kpiData?.revenueEarned || 0), icon: CreditCard, color: "text-emerald-500" },
    { label: "Pending Revenue", value: formatGBP(kpiData?.pendingRevenue || 0), icon: Clock, color: "text-amber-500" },
    { label: "Conversion Rate", value: `${kpiData?.conversionRate || 0}%`, icon: Target, color: "text-primary" },
    { label: "Avg Completion", value: `${kpiData?.avgCompletionDays || 0}d`, icon: Zap, color: "text-primary/70" },
    { label: "Completed Deals", value: String(kpiData?.completedCount || 0), icon: Check, color: "text-emerald-500" },
  ];

  const categoryIcons: Record<string, any> = { aviation: Plane, medical: Heart, staffing: Users };
  const statusProgress: Record<string, number> = {
    intake: 14, sourcing: 28, matching: 42, shortlisted: 56, negotiation: 70, execution: 85, completed: 100,
  };

  return (
    <div className="space-y-8">
      {/* KPI Grid */}
      <section>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-body text-[11px] tracking-[0.25em] uppercase text-gold-soft/50 mb-4">
          Live Performance
        </motion.p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {kpis.map((kpi, i) => (
            <motion.div key={kpi.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-4 rounded-xl">
              <kpi.icon size={14} className={`${kpi.color} mb-2`} strokeWidth={1.5} />
              <p className="text-lg font-display text-foreground">{kpi.value}</p>
              <p className="font-body text-[9px] tracking-wider uppercase text-muted-foreground mt-0.5">{kpi.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Active Deals */}
      <section>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex items-center justify-between mb-4">
          <p className="font-body text-[11px] tracking-[0.25em] uppercase text-gold-soft/50">Active Deals</p>
          <Link to="/deals" className="font-body text-[10px] tracking-[0.15em] uppercase text-gold-soft/40 hover:text-gold-soft/70 transition-colors">View All →</Link>
        </motion.div>
        {(kpiData?.activeDeals?.length || 0) > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
            {kpiData?.activeDeals.map((deal: any, i: number) => {
              const Icon = categoryIcons[deal.category] || FileText;
              const progress = statusProgress[deal.status] || 14;
              return (
                <motion.div key={deal.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }} whileHover={{ scale: 1.04 }} className="glass-card p-5 rounded-xl min-w-[280px] snap-start group cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon size={14} className="text-primary" strokeWidth={1.5} />
                      <span className="font-body text-[10px] tracking-[0.2em] uppercase text-gold-soft/50">{deal.category}</span>
                    </div>
                    <span className="font-body text-[10px] text-muted-foreground">#{deal.deal_number}</span>
                  </div>
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-body text-[10px] text-muted-foreground capitalize">{deal.status}</span>
                      <span className="font-body text-[10px] text-primary/70">{progress}%</span>
                    </div>
                    <div className="h-px bg-border/50 relative overflow-hidden rounded-full">
                      <motion.div className="absolute inset-y-0 left-0 bg-primary" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ delay: 0.3 + i * 0.1, duration: 0.8 }} />
                    </div>
                  </div>
                  {deal.deal_value_estimate && (
                    <p className="font-body text-xs text-foreground/80 mb-3">Est. value: {formatValue(deal.deal_value_estimate * 100)}</p>
                  )}
                  <Link to="/deals" className="font-body text-[10px] tracking-[0.15em] uppercase text-primary/60 group-hover:text-primary transition-colors flex items-center gap-1">
                    Open Deal <ArrowRight size={10} />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="glass-card p-8 rounded-xl text-center">
            <p className="text-sm text-muted-foreground">No active deals. <Link to="/intake" className="text-primary hover:underline">Start a new deal →</Link></p>
          </div>
        )}
      </section>

      {/* Recent Activity */}
      <section>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="font-body text-[11px] tracking-[0.25em] uppercase text-gold-soft/50 mb-4">
          Recent Activity
        </motion.p>
        <div className="glass-card rounded-xl overflow-hidden">
          {(recentActivity || []).length > 0 ? (
            (recentActivity || []).map((item: any, i: number) => {
              const iconMap: Record<string, any> = { payment: CreditCard, deal: FileText, billing: CreditCard, system: Activity };
              const Icon = iconMap[item.category] || MessageSquare;
              const timeAgo = getTimeAgo(item.created_at);
              return (
                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + i * 0.06 }} className="flex items-center gap-3 px-5 py-3.5 border-b border-border/30 last:border-0 hover:bg-secondary/20 transition-colors">
                  <Icon size={14} className="text-gold-soft/40 shrink-0" strokeWidth={1.5} />
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-xs text-foreground/80 truncate">{item.title}</p>
                    {item.body && <p className="font-body text-[10px] text-muted-foreground truncate">{item.body}</p>}
                  </div>
                  <span className="font-body text-[10px] text-muted-foreground shrink-0">{timeAgo}</span>
                </motion.div>
              );
            })
          ) : (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-muted-foreground">No recent activity yet.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default DashboardFeed;
