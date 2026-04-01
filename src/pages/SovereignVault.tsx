import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import useDocumentHead from "@/hooks/use-document-head";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import MobileBottomNav from "@/components/mobile/MobileBottomNav";
import ParticleGrid from "@/components/ParticleGrid";
import { Button } from "@/components/ui/button";
import {
  Vault, DollarSign, ArrowUpRight, Clock, CheckCircle, Loader2, Ban,
} from "lucide-react";
import { toast } from "sonner";

type Commission = {
  id: string;
  total_value: number;
  quantus_cut: number;
  payout_status: string;
  created_at: string;
  lead_id: string;
};

const SovereignVault = () => {
  useDocumentHead({ title: "The Vault — Quantus V2+", description: "Commission accruals and payout ledger." });

  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [commissions, setCommissions] = useState<Commission[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("commissions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setCommissions((data as Commission[]) || []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  const totalAccrued = commissions.reduce((s, c) => s + Number(c.quantus_cut), 0);
  const pendingTotal = commissions.filter(c => c.payout_status === "Pending").reduce((s, c) => s + Number(c.quantus_cut), 0);
  const paidTotal = commissions.filter(c => c.payout_status === "Paid").reduce((s, c) => s + Number(c.quantus_cut), 0);

  const formatCurrency = (v: number) => `£${v.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const handleRequestPayout = () => {
    toast.info("Payout request submitted. Your admin will review and process pending commissions.");
  };

  const isEmpty = commissions.length === 0;

  return (
    <div className="min-h-screen bg-background flex relative">
      <div className="fixed inset-0 pointer-events-none opacity-10 z-0"><ParticleGrid /></div>
      <div className="fixed inset-0 pointer-events-none z-0" style={{ background: "radial-gradient(ellipse at center, transparent 60%, hsl(var(--background)) 100%)" }} />

      <DashboardSidebar />

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <DashboardTopBar onMobileMenuToggle={() => {}} notifications={[]} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pb-24 lg:pb-8 space-y-6">
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
                No commissions yet. Revenue will appear here once leads are recovered and deals closed.
              </p>
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Total Accrued", value: formatCurrency(totalAccrued), icon: DollarSign, accent: "text-primary" },
              { label: "Pending Payout", value: formatCurrency(pendingTotal), icon: Clock, accent: "text-amber-400" },
              { label: "Paid Out", value: formatCurrency(paidTotal), icon: CheckCircle, accent: "text-emerald-400" },
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
                {commissions.map((c, i) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card p-4 flex items-center gap-4"
                  >
                    <div className={`p-2 rounded-lg ${c.payout_status === "Paid" ? "text-emerald-400 bg-emerald-400/10" : "text-amber-400 bg-amber-400/10"}`}>
                      {c.payout_status === "Paid" ? <CheckCircle size={14} /> : <Clock size={14} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-xs text-foreground">
                        Deal Value: <span className="font-medium">{formatCurrency(c.total_value)}</span>
                      </p>
                      <p className="font-body text-[10px] text-muted-foreground mt-0.5">
                        {new Date(c.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-display text-sm font-semibold text-primary">{formatCurrency(c.quantus_cut)}</p>
                      <p className="font-body text-[9px] text-muted-foreground">10% cut</p>
                    </div>
                    <span className={`font-body text-[9px] tracking-wider px-2 py-1 rounded-full shrink-0 ${
                      c.payout_status === "Paid" ? "bg-emerald-400/10 text-emerald-400" : "bg-amber-400/10 text-amber-400"
                    }`}>
                      {c.payout_status}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </main>

        <footer className="hidden lg:flex px-6 py-3 border-t border-border/50 items-center justify-between">
          <p className="font-body text-[9px] tracking-[0.2em] uppercase text-muted-foreground/40">Quantus V2+ — The Vault</p>
          <p className="font-body text-[9px] text-muted-foreground/30">Phase 1</p>
        </footer>
      </div>

      <MobileBottomNav onAIOpen={() => {}} onMessagingOpen={() => {}} onTabChange={() => {}} activeTab="feed" />
    </div>
  );
};

export default SovereignVault;
