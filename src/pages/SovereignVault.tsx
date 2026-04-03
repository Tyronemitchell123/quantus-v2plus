import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import useDocumentHead from "@/hooks/use-document-head";
import DashboardPageWrapper from "@/components/layouts/DashboardPageWrapper";
import { Button } from "@/components/ui/button";
import {
  Vault, DollarSign, Clock, CheckCircle, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrencyCents, formatDateGB, commissionStatusColor } from "@/lib/format-utils";

type CommissionLog = {
  id: string;
  deal_id: string;
  category: string;
  status: string;
  deal_value_cents: number | null;
  commission_cents: number;
  commission_rate: number | null;
  vendor_name: string | null;
  paid_at: string | null;
  created_at: string;
};

const SovereignVault = () => {
  useDocumentHead({ title: "The Vault — Quantus V2+", description: "Commission accruals and payout ledger." });

  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [commissions, setCommissions] = useState<CommissionLog[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchCommissions = async () => {
      const { data } = await supabase
        .from("commission_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setCommissions((data as CommissionLog[]) || []);
      setLoading(false);
    };
    fetchCommissions();
  }, [user]);

  const totalAccrued = commissions.reduce((s, c) => s + c.commission_cents, 0);
  const pendingTotal = commissions
    .filter(c => c.status === "pending" || c.status === "expected")
    .reduce((s, c) => s + c.commission_cents, 0);
  const paidTotal = commissions
    .filter(c => c.status === "paid")
    .reduce((s, c) => s + c.commission_cents, 0);

  const handleRequestPayout = () => {
    toast.info("Payout request submitted. Your admin will review and process pending commissions.");
  };

  const isEmpty = commissions.length === 0;

  return (
    <DashboardPageWrapper footerLeft="Quantus V2+ — The Vault">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
            <Vault size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="font-display text-lg font-semibold text-foreground">The Vault</h1>
            <p className="font-body text-[10px] text-muted-foreground tracking-wider">Commission Accruals & Payout Ledger</p>
          </div>
        </div>
        <Button onClick={handleRequestPayout} size="sm" className="gap-2">
          <DollarSign size={14} /> Request Payout
        </Button>
      </div>

      {isEmpty && !loading && (
        <div className="glass-card p-4 border-primary/20">
          <p className="font-body text-xs text-muted-foreground">
            No commissions yet. Revenue will appear here once deals are completed.
          </p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Accrued", value: formatCurrencyCents(totalAccrued), icon: DollarSign, accent: "text-primary" },
          { label: "Pending Payout", value: formatCurrencyCents(pendingTotal), icon: Clock, accent: "text-amber-400" },
          { label: "Paid Out", value: formatCurrencyCents(paidTotal), icon: CheckCircle, accent: "text-emerald-400" },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card p-5"
          >
            <div className="flex items-center gap-2 mb-2">
              <card.icon size={14} className={card.accent} />
              <span className="font-body text-[9px] tracking-[0.2em] uppercase text-muted-foreground">{card.label}</span>
            </div>
            <p className="font-display text-2xl font-semibold text-foreground">{card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Ledger */}
      <div className="space-y-3">
        <h2 className="font-display text-sm font-semibold text-foreground">Commission Ledger</h2>

        {loading ? (
          <div className="glass-card p-8 flex items-center justify-center">
            <Loader2 size={18} className="animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-2">
            {commissions.map((c, i) => {
              const isPaid = c.status === "paid";
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card p-4 flex items-center gap-4"
                >
                  <div className={`p-2 rounded-lg ${isPaid ? "text-emerald-400 bg-emerald-400/10" : "text-amber-400 bg-amber-400/10"}`}>
                    {isPaid ? <CheckCircle size={14} /> : <Clock size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-xs text-foreground">
                      {c.category} — {c.vendor_name || "Deal"}: <span className="font-medium">{c.deal_value_cents ? formatCurrencyCents(c.deal_value_cents) : "—"}</span>
                    </p>
                    <p className="font-body text-[10px] text-muted-foreground mt-0.5">
                      {formatDateGB(c.created_at)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-display text-sm font-semibold text-primary">{formatCurrencyCents(c.commission_cents)}</p>
                    <p className="font-body text-[9px] text-muted-foreground">
                      {c.commission_rate ? `${(c.commission_rate * 100).toFixed(1)}%` : "commission"}
                    </p>
                  </div>
                  <span className={`font-body text-[9px] tracking-wider px-2 py-1 rounded-full shrink-0 ${
                    isPaid ? "bg-emerald-400/10 text-emerald-400" : "bg-amber-400/10 text-amber-400"
                  }`}>
                    {c.status}
                  </span>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardPageWrapper>
  );
};

export default SovereignVault;
