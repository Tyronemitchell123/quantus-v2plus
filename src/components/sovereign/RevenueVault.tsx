import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign, Bitcoin, FileText, RefreshCcw, Wallet, CreditCard,
  TrendingUp, Loader2, Zap, Send, ArrowUpRight, Shield, BookOpen,
  Plane, HeartPulse, Crown, CheckCircle2, AlertCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type BillingSummary = {
  retainer_cents: number;
  aviation_fees_cents: number;
  medical_fees_cents: number;
  total_revenue_cents: number;
  total_deal_value_cents: number;
  deals_count: number;
  month: string;
  crypto_enabled: boolean;
};

type AlphaReport = {
  client_name: string;
  month: string;
  report: string;
  financials: {
    aviation_revenue_cents: number;
    medical_revenue_cents: number;
    total_savings_cents: number;
    retainer_cents: number;
    deals_count: number;
  };
};

const formatCurrency = (cents: number) =>
  `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const RevenueVault = () => {
  const { user } = useAuth();
  const [billing, setBilling] = useState<BillingSummary | null>(null);
  const [alphaReport, setAlphaReport] = useState<AlphaReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [xeroStatus, setXeroStatus] = useState<"connected" | "disconnected">("disconnected");
  const [syncing, setSyncing] = useState(false);

  const fetchBilling = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("vanguard-billing", {
        body: { action: "get-billing-summary", user_id: user.id },
      });
      if (error) throw error;
      setBilling(data);
    } catch (e) {
      console.error("Billing fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    if (!user) return;
    setReportLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("vanguard-billing", {
        body: { action: "generate-alpha-report", user_id: user.id },
      });
      if (error) throw error;
      if (data?.error) {
        if (data.error.includes("Rate limited")) {
          toast.error("Rate limited. Please try again shortly.");
        } else {
          toast.error(data.error);
        }
        return;
      }
      setAlphaReport(data);
      toast.success("Monthly Alpha Report generated");
    } catch (e) {
      console.error("Report error:", e);
      toast.error("Failed to generate report");
    } finally {
      setReportLoading(false);
    }
  };

  const initiateRetainer = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase.functions.invoke("vanguard-billing", {
        body: { action: "create-retainer-subscription" },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (e) {
      console.error("Retainer error:", e);
      toast.error("Failed to create retainer session");
    }
  };

  const syncXero = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("xero-reconciliation", {
        body: { action: "sync-commissions", user_id: user?.id },
      });
      if (error) throw error;
      if (data?.manual_mode) {
        setXeroStatus("disconnected");
        toast.info("Xero not configured — connect your accounting to enable auto-sync");
      } else if (data?.success) {
        toast.success(`Synced ${data.synced} commissions to Xero`);
        setXeroStatus("connected");
      }
    } catch (e) {
      console.error("Xero sync error:", e);
      toast.error("Xero sync failed");
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchBilling();
  }, [user]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500/20 to-yellow-600/20 border border-amber-500/30">
            <Crown className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">Revenue Vault</h2>
            <p className="text-[10px] text-muted-foreground tracking-wider uppercase">
              Vanguard Tier — {billing?.month || "Loading..."}
            </p>
          </div>
        </div>
        <button
          onClick={fetchBilling}
          className="p-1.5 rounded-md hover:bg-muted/30 transition-colors"
        >
          <RefreshCcw className={`w-3.5 h-3.5 text-muted-foreground ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg bg-card/50 border border-border/50"
        >
          <div className="flex items-center gap-1.5 mb-1">
            <CreditCard className="w-3 h-3 text-violet-400" />
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Retainer</span>
          </div>
          <p className="font-display text-lg font-bold text-foreground">$20,000</p>
          <p className="text-[9px] text-muted-foreground">Monthly • Auto-billed</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="p-3 rounded-lg bg-card/50 border border-border/50"
        >
          <div className="flex items-center gap-1.5 mb-1">
            <Plane className="w-3 h-3 text-blue-400" />
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Aviation 5%</span>
          </div>
          <p className="font-display text-lg font-bold text-foreground">
            {billing ? formatCurrency(billing.aviation_fees_cents) : "—"}
          </p>
          <p className="text-[9px] text-muted-foreground">Success fees MTD</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-3 rounded-lg bg-card/50 border border-border/50"
        >
          <div className="flex items-center gap-1.5 mb-1">
            <HeartPulse className="w-3 h-3 text-rose-400" />
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Medical 10%</span>
          </div>
          <p className="font-display text-lg font-bold text-foreground">
            {billing ? formatCurrency(billing.medical_fees_cents) : "—"}
          </p>
          <p className="text-[9px] text-muted-foreground">Success fees MTD</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-3 rounded-lg bg-gradient-to-br from-amber-500/10 to-yellow-600/10 border border-amber-500/30"
        >
          <div className="flex items-center gap-1.5 mb-1">
            <DollarSign className="w-3 h-3 text-amber-400" />
            <span className="text-[9px] uppercase tracking-wider text-amber-400/80">Total Revenue</span>
          </div>
          <p className="font-display text-lg font-bold text-amber-400">
            {billing ? formatCurrency(billing.total_revenue_cents) : "—"}
          </p>
          <p className="text-[9px] text-muted-foreground">{billing?.deals_count || 0} deals this month</p>
        </motion.div>
      </div>

      <Tabs defaultValue="billing" className="w-full">
        <TabsList className="bg-muted/20 border border-border/30 w-full">
          <TabsTrigger value="billing" className="text-xs flex-1">Billing</TabsTrigger>
          <TabsTrigger value="report" className="text-xs flex-1">Alpha Report</TabsTrigger>
          <TabsTrigger value="accounting" className="text-xs flex-1">Xero Sync</TabsTrigger>
        </TabsList>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-4 mt-4">
          <div className="p-4 rounded-lg bg-card/30 border border-border/30 space-y-3">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-violet-400" />
              <span className="font-body text-sm font-medium text-foreground">Payment Rails</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-md bg-muted/10 border border-border/20">
                <div className="flex items-center gap-1.5 mb-2">
                  <CreditCard className="w-3 h-3 text-blue-400" />
                  <span className="text-[10px] font-medium text-foreground">Card / Bank</span>
                </div>
                <p className="text-[9px] text-muted-foreground">Standard Stripe Checkout</p>
                <div className="flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                  <span className="text-[8px] text-emerald-400">Active</span>
                </div>
              </div>

              <div className="p-3 rounded-md bg-muted/10 border border-amber-500/20">
                <div className="flex items-center gap-1.5 mb-2">
                  <Bitcoin className="w-3 h-3 text-amber-400" />
                  <span className="text-[10px] font-medium text-foreground">USDC Stablecoin</span>
                </div>
                <p className="text-[9px] text-muted-foreground">Stripe Crypto Rails</p>
                <div className="flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                  <span className="text-[8px] text-emerald-400">Enabled</span>
                </div>
              </div>
            </div>

            <button
              onClick={initiateRetainer}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-xs font-medium flex items-center justify-center gap-2 transition-all"
            >
              <Zap className="w-3.5 h-3.5" />
              Activate Vanguard Retainer — $20,000/mo
            </button>
            <p className="text-[8px] text-center text-muted-foreground">
              Supports card, bank transfer, and USDC stablecoin settlement
            </p>
          </div>

          {/* Success Fee Triggers */}
          <div className="p-4 rounded-lg bg-card/30 border border-border/30 space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="font-body text-sm font-medium text-foreground">Success Fee Triggers</span>
            </div>
            <div className="space-y-1.5">
              {[
                { event: "Flight Confirmed", rate: "5%", icon: Plane, color: "text-blue-400" },
                { event: "Clinic Booking", rate: "10%", icon: HeartPulse, color: "text-rose-400" },
              ].map((trigger) => (
                <div key={trigger.event} className="flex items-center justify-between py-1.5 px-2 rounded-md bg-muted/10">
                  <div className="flex items-center gap-2">
                    <trigger.icon className={`w-3 h-3 ${trigger.color}`} />
                    <span className="text-[10px] text-foreground">{trigger.event}</span>
                  </div>
                  <span className="text-[10px] font-mono font-semibold text-foreground">{trigger.rate}</span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Alpha Report Tab */}
        <TabsContent value="report" className="space-y-4 mt-4">
          <div className="p-4 rounded-lg bg-card/30 border border-border/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <span className="font-body text-sm font-medium text-foreground">Monthly Alpha Report</span>
              </div>
              <span className="text-[8px] uppercase tracking-widest text-muted-foreground">Ghost Invoice</span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              AI-generated savings ledger replaces traditional invoicing. Auto-sent on the 1st of each month.
            </p>

            <button
              onClick={generateReport}
              disabled={reportLoading}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white text-xs font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {reportLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  Generate Alpha Report Preview
                </>
              )}
            </button>

            <AnimatePresence>
              {alphaReport && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 p-4 rounded-lg bg-muted/5 border border-amber-500/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-medium text-amber-400 uppercase tracking-wider">
                        {alphaReport.month} — {alphaReport.client_name}
                      </span>
                      <Send className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <div className="text-[11px] text-foreground/90 leading-relaxed whitespace-pre-wrap">
                      {alphaReport.report}
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/20">
                      <div>
                        <p className="text-[8px] text-muted-foreground uppercase">Aviation</p>
                        <p className="text-[10px] font-mono font-semibold text-blue-400">
                          {formatCurrency(alphaReport.financials.aviation_revenue_cents)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[8px] text-muted-foreground uppercase">Medical</p>
                        <p className="text-[10px] font-mono font-semibold text-rose-400">
                          {formatCurrency(alphaReport.financials.medical_revenue_cents)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[8px] text-muted-foreground uppercase">Savings</p>
                        <p className="text-[10px] font-mono font-semibold text-emerald-400">
                          {formatCurrency(alphaReport.financials.total_savings_cents)}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </TabsContent>

        {/* Xero Sync Tab */}
        <TabsContent value="accounting" className="space-y-4 mt-4">
          <div className="p-4 rounded-lg bg-card/30 border border-border/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span className="font-body text-sm font-medium text-foreground">Xero Auto-Reconciliation</span>
              </div>
              <div className="flex items-center gap-1">
                {xeroStatus === "connected" ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-3 h-3 text-amber-400" />
                )}
                <span className={`text-[8px] uppercase tracking-wider ${xeroStatus === "connected" ? "text-emerald-400" : "text-amber-400"}`}>
                  {xeroStatus}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] text-muted-foreground">
                Auto-categorize commissions into Aviation (200) and Longevity (210) revenue streams in Xero.
              </p>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { code: "200", label: "Aviation Revenue", color: "text-blue-400" },
                  { code: "210", label: "Longevity Revenue", color: "text-rose-400" },
                  { code: "220", label: "Retainer Revenue", color: "text-violet-400" },
                  { code: "230", label: "Hospitality Revenue", color: "text-amber-400" },
                ].map((account) => (
                  <div key={account.code} className="flex items-center gap-2 py-1.5 px-2 rounded-md bg-muted/10">
                    <span className="text-[9px] font-mono text-muted-foreground">{account.code}</span>
                    <span className={`text-[9px] ${account.color}`}>{account.label}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={syncXero}
                disabled={syncing}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {syncing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCcw className="w-3.5 h-3.5" />
                    Sync Commissions to Xero
                  </>
                )}
              </button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RevenueVault;
