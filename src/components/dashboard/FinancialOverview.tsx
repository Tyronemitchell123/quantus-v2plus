import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DollarSign, Clock, TrendingUp, Loader2, ArrowUpRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

type CommissionByCategory = { category: string; total: number; count: number };

const FinancialOverview = () => {
  const [hovered, setHovered] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [commissionTotal, setCommissionTotal] = useState(0);
  const [byCategory, setByCategory] = useState<CommissionByCategory[]>([]);
  const [outstandingTotal, setOutstandingTotal] = useState(0);
  const [pendingInvoiceCount, setPendingInvoiceCount] = useState(0);
  const [monthLabel, setMonthLabel] = useState("");

  useEffect(() => {
    fetchFinancials();
  }, []);

  const fetchFinancials = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setLoading(false); return; }

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    setMonthLabel(now.toLocaleDateString("en-GB", { month: "long", year: "numeric" }));

    const [commRes, invRes] = await Promise.all([
      supabase
        .from("commission_logs")
        .select("category, commission_cents, status")
        .eq("user_id", session.user.id)
        .gte("created_at", monthStart),
      supabase
        .from("invoices")
        .select("amount_cents, status")
        .eq("user_id", session.user.id)
        .in("status", ["draft", "sent", "overdue"]),
    ]);

    // Commission aggregation
    const logs = commRes.data || [];
    const catMap: Record<string, { total: number; count: number }> = {};
    let total = 0;
    for (const log of logs) {
      total += log.commission_cents || 0;
      if (!catMap[log.category]) catMap[log.category] = { total: 0, count: 0 };
      catMap[log.category].total += log.commission_cents || 0;
      catMap[log.category].count += 1;
    }
    setCommissionTotal(total);
    setByCategory(
      Object.entries(catMap)
        .map(([category, v]) => ({ category, ...v }))
        .sort((a, b) => b.total - a.total)
    );

    // Outstanding invoices
    const invoices = invRes.data || [];
    const outstanding = invoices.reduce((s, inv) => s + (inv.amount_cents || 0), 0);
    setOutstandingTotal(outstanding);
    setPendingInvoiceCount(invoices.length);

    setLoading(false);
  };

  const formatPence = (cents: number) =>
    `£${(cents / 100).toLocaleString("en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  if (loading) {
    return (
      <div className="grid sm:grid-cols-2 gap-4">
        {[0, 1].map((i) => (
          <div key={i} className="glass-card p-5 flex items-center justify-center h-32">
            <Loader2 size={18} className="animate-spin text-primary" />
          </div>
        ))}
      </div>
    );
  }

  const hasData = commissionTotal > 0 || pendingInvoiceCount > 0;

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
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <DollarSign size={14} className="text-primary" />
            <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Commissions Earned</p>
          </div>
          <Link to="/settings" className="text-muted-foreground hover:text-primary transition-colors">
            <ArrowUpRight size={14} />
          </Link>
        </div>
        <p className="font-display text-2xl font-medium text-foreground mb-1">
          {commissionTotal > 0 ? formatPence(commissionTotal) : "£0"}
        </p>
        <p className="font-body text-[10px] text-muted-foreground">{monthLabel}</p>

        {hovered === "commissions" && byCategory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-3 pt-3 border-t border-border/50 space-y-1.5"
          >
            {byCategory.map((item) => (
              <div key={item.category} className="flex justify-between">
                <span className="font-body text-[10px] text-muted-foreground capitalize">{item.category}</span>
                <span className="font-body text-[10px] text-foreground">{formatPence(item.total)}</span>
              </div>
            ))}
          </motion.div>
        )}

        {hovered === "commissions" && byCategory.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 pt-3 border-t border-border/50"
          >
            <p className="font-body text-[10px] text-muted-foreground">
              No commission logs yet this month. Complete deals to see earnings here.
            </p>
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
        <p className="font-display text-2xl font-medium text-foreground mb-1">
          {outstandingTotal > 0 ? formatPence(outstandingTotal) : "£0"}
        </p>
        <p className="font-body text-[10px] text-muted-foreground">
          {pendingInvoiceCount} invoice{pendingInvoiceCount !== 1 ? "s" : ""} pending
        </p>
      </motion.div>
    </div>
  );
};

export default FinancialOverview;
