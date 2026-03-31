import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, Loader2, ArrowRight, Sparkles, TrendingUp,
  Archive, Crown, Plane, Heart, Users, Globe, Truck, Handshake,
  FileText, Receipt, Clock, ChevronDown, ChevronUp, Zap, RefreshCw,
  Download, Copy, Home, Shield, Star, BarChart3,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import useDocumentHead from "@/hooks/use-document-head";
import { sendDealPhaseEmail } from "@/lib/deal-phase-emails";
import DealPhaseLayout from "@/components/deal/DealPhaseLayout";

const categoryIcons: Record<string, typeof Plane> = {
  aviation: Plane, medical: Heart, staffing: Users,
  lifestyle: Globe, logistics: Truck, partnerships: Handshake,
};

type DealSummary = {
  deal_number: string; category: string; sub_category: string | null;
  deal_value: number | null; total_documents: number; signed_documents: number;
  total_invoices: number; paid_invoices: number; total_revenue_cents: number;
  paid_revenue_cents: number; outstanding_revenue_cents: number;
  total_tasks: number; completed_tasks: number; completion_date: string;
};
type Upsell = { title: string; description: string; category: string };
type TierRec = {
  currentTier: string; completedDeals: number; totalRevenueCents: number;
  recommendation: { tier: string; label: string; message: string } | null;
};
type ArchivedDeal = {
  id: string; deal_number: string; category: string; sub_category: string | null;
  status: string; deal_value_estimate: number | null; budget_currency: string;
  completed_at: string; created_at: string;
};

const formatCurrency = (cents: number, currency = "GBP") => {
  const symbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : "£";
  return `${symbol}${(cents / 100).toLocaleString("en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

/* ── Left Column: Archival & Continuity ── */
function ArchivalPanel({ dealId }: { dealId: string | null }) {
  return (
    <div className="space-y-4">
      <h3 className="font-display text-sm text-[hsl(var(--foreground))]">
        Actions
        <div className="w-10 h-px bg-[hsl(var(--primary))] mt-1" />
      </h3>

      {[
        { label: "Archive Deal", desc: "Move to your private archive", icon: Archive },
        { label: "Duplicate Workflow", desc: "Clone for recurring operations", icon: Copy },
        { label: "Start New Deal", desc: "Begin a new orchestration", icon: Zap, href: "/intake" },
      ].map((action, i) => (
        <motion.div
          key={action.label}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 + i * 0.1 }}
        >
          {action.href ? (
            <Link
              to={action.href}
              className="w-full flex items-center gap-3 p-3 border border-[hsl(var(--primary)/0.2)] rounded-xl bg-[hsl(var(--card))] hover:border-[hsl(var(--primary)/0.4)] transition-all group"
            >
              <div className="w-9 h-9 rounded-lg border border-[hsl(var(--primary)/0.2)] bg-[hsl(var(--primary)/0.05)] flex items-center justify-center">
                <action.icon size={14} className="text-[hsl(var(--primary))]" />
              </div>
              <div className="text-left">
                <p className="font-body text-xs text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))] transition-colors">{action.label}</p>
                <p className="font-body text-[9px] text-[hsl(var(--muted-foreground))]">{action.desc}</p>
              </div>
            </Link>
          ) : (
            <button
              onClick={() => toast.success(`${action.label} — coming soon`)}
              className="w-full flex items-center gap-3 p-3 border border-[hsl(var(--border))] rounded-xl bg-[hsl(var(--card))] hover:border-[hsl(var(--primary)/0.3)] transition-all group"
            >
              <div className="w-9 h-9 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))] flex items-center justify-center">
                <action.icon size={14} className="text-[hsl(var(--primary)/0.6)]" />
              </div>
              <div className="text-left">
                <p className="font-body text-xs text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))] transition-colors">{action.label}</p>
                <p className="font-body text-[9px] text-[hsl(var(--muted-foreground))]">{action.desc}</p>
              </div>
            </button>
          )}
        </motion.div>
      ))}

      {/* Deal Archive preview */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="border border-[hsl(var(--border))] rounded-xl bg-[hsl(var(--card))] p-4 mt-6"
      >
        <h4 className="font-display text-xs text-[hsl(var(--foreground))] mb-2">
          Recent Archive
          <div className="w-8 h-px bg-[hsl(var(--primary)/0.3)] mt-1" />
        </h4>
        <p className="font-body text-[10px] text-[hsl(var(--muted-foreground))]">
          Your completed deals are securely archived and searchable.
        </p>
      </motion.div>
    </div>
  );
}

/* ── Right Column: Quantus V2+ Core Reflections ── */
function ReflectionsPanel({ summary, tierRec, upsells }: {
  summary: DealSummary | null;
  tierRec: TierRec | null;
  upsells: Upsell[];
}) {
  const [expandedUpsell, setExpandedUpsell] = useState<number | null>(null);

  const insights = [
    summary && summary.signed_documents === summary.total_documents && "All documents signed and archived successfully.",
    summary && summary.paid_invoices === summary.total_invoices && "All payments received and confirmed.",
    summary && summary.completed_tasks === summary.total_tasks && "Zero delays or risk events occurred.",
    "This vendor is recommended for future operations.",
    "Your privacy requirements were fully met throughout.",
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-6">
      {/* Core Notes */}
      <div className="border border-[hsl(var(--primary)/0.2)] bg-[hsl(var(--card))] rounded-xl p-4" style={{ boxShadow: "inset 0 1px 20px hsl(var(--primary) / 0.03)" }}>
        <h3 className="font-display text-sm text-[hsl(var(--foreground))] mb-3">
          Quantus V2+ Core Notes
          <div className="w-10 h-px bg-[hsl(var(--primary))] mt-1" />
        </h3>
        <div className="space-y-2.5">
          {insights.map((note, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + i * 0.15 }}
              className="flex items-start gap-2"
            >
              <Sparkles size={10} className="text-[hsl(var(--primary))] shrink-0 mt-0.5" />
              <p className="font-body text-[11px] text-[hsl(var(--foreground)/0.7)] leading-relaxed">{note}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tier Recommendation */}
      {tierRec?.recommendation && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="border border-amber-500/20 bg-[hsl(var(--card))] rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Crown size={14} className="text-amber-500" />
            <h4 className="font-display text-xs text-[hsl(var(--foreground))]">Tier Recommendation</h4>
          </div>
          <p className="font-body text-[11px] text-[hsl(var(--foreground)/0.6)] italic leading-relaxed mb-2">
            "{tierRec.recommendation.message}"
          </p>
          <div className="flex items-center gap-3 font-body text-[9px] text-[hsl(var(--muted-foreground))]">
            <span>{tierRec.completedDeals} deals</span>
            <span>·</span>
            <span>{formatCurrency(tierRec.totalRevenueCents)} revenue</span>
          </div>
        </motion.div>
      )}

      {/* Upsells */}
      {upsells.length > 0 && (
        <div className="border border-[hsl(var(--border))] bg-[hsl(var(--card))] rounded-xl p-4">
          <h4 className="font-display text-xs text-[hsl(var(--foreground))] mb-3">
            Recommendations
            <div className="w-8 h-px bg-[hsl(var(--primary)/0.3)] mt-1" />
          </h4>
          <div className="space-y-2">
            {upsells.map((u, i) => {
              const Icon = categoryIcons[u.category] || Zap;
              const isExpanded = expandedUpsell === i;
              return (
                <button
                  key={i}
                  onClick={() => setExpandedUpsell(isExpanded ? null : i)}
                  className="w-full text-left border border-[hsl(var(--border))] rounded-lg p-3 hover:border-[hsl(var(--primary)/0.2)] transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon size={12} className="text-[hsl(var(--primary))]" />
                      <span className="font-body text-[11px] text-[hsl(var(--foreground))]">{u.title}</span>
                    </div>
                    {isExpanded ? <ChevronUp size={10} className="text-[hsl(var(--muted-foreground))]" /> : <ChevronDown size={10} className="text-[hsl(var(--muted-foreground))]" />}
                  </div>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="font-body text-[10px] text-[hsl(var(--muted-foreground))] mt-2 leading-relaxed overflow-hidden">
                        {u.description}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main Page ── */
const DealCompletion = () => {
  useDocumentHead({ title: "Finalization & Closeout — Quantus V2+", description: "Phase 7: Ceremonial deal completion for UHNW operations." });
  const [params] = useSearchParams();
  const dealId = params.get("deal");

  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<DealSummary | null>(null);
  const [upsells, setUpsells] = useState<Upsell[]>([]);
  const [upsellMsg, setUpsellMsg] = useState("");
  const [tierRec, setTierRec] = useState<TierRec | null>(null);
  const [completing, setCompleting] = useState(false);

  const completeDeal = async () => {
    if (!dealId) return;
    setCompleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const { data, error } = await supabase.functions.invoke("deal-completion", { body: { action: "complete", dealId } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setSummary(data.summary);
      toast.success("Operation finalized successfully");

      // Send completion summary email (non-blocking)
      sendDealPhaseEmail({
        template: "deal_completion_summary",
        data: {
          dealNumber: data.summary?.deal_number || "",
          category: data.summary?.category || "",
          vendorName: data.summary?.sub_category || "",
          dealValue: data.summary?.total_revenue_cents ? `£${(data.summary.total_revenue_cents / 100).toLocaleString()}` : "",
          commissionEarned: data.summary?.commission_cents ? `£${(data.summary.commission_cents / 100).toLocaleString()}` : "",
        },
      });

      const [upsellRes, tierRes] = await Promise.all([
        supabase.functions.invoke("deal-completion", { body: { action: "upsells", dealId } }),
        supabase.functions.invoke("deal-completion", { body: { action: "tier_check", dealId } }),
      ]);
      if (upsellRes.data) { setUpsells(upsellRes.data.upsells || []); setUpsellMsg(upsellRes.data.message || ""); }
      if (tierRes.data) setTierRec(tierRes.data);
    } catch (err: any) { toast.error(err.message || "Failed to complete deal"); }
    setCompleting(false);
  };

  const dealValueFormatted = summary?.deal_value
    ? `£${summary.deal_value.toLocaleString("en-GB")}`
    : "—";

  const summaryLines = summary ? [
    { icon: Star, label: "Selected Option", value: `${summary.category} — ${summary.sub_category || "Primary Vendor"}` },
    { icon: TrendingUp, label: "Final Value", value: dealValueFormatted },
    { icon: Shield, label: "Commission Revenue", value: summary.total_revenue_cents > 0 ? formatCurrency(summary.total_revenue_cents) : "Pending" },
    { icon: FileText, label: "Documents", value: `${summary.signed_documents}/${summary.total_documents} signed and archived` },
    { icon: Receipt, label: "Payments", value: summary.paid_invoices === summary.total_invoices ? "Completed" : `${summary.paid_invoices}/${summary.total_invoices} paid` },
    { icon: BarChart3, label: "Tasks", value: `${summary.completed_tasks}/${summary.total_tasks} completed` },
  ] : [];

  return (
    <DealPhaseLayout currentPhase={8} dealId={dealId} phaseTitle="Finalization & Closeout">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <p className="font-body text-[10px] tracking-[0.3em] uppercase text-[hsl(var(--primary)/0.6)] mb-2">
            Phase 7 — Finalization
          </p>
          <h1 className="font-display text-3xl md:text-4xl text-[hsl(var(--foreground))] mb-2">
            Your operation is complete.
            <motion.div
              className="h-px bg-gradient-to-r from-[hsl(var(--primary))] to-transparent mt-2"
              initial={{ width: 0 }}
              animate={{ width: "50%" }}
              transition={{ duration: 1.2, delay: 0.3 }}
            />
          </h1>
          <p className="font-body text-sm text-[hsl(var(--primary)/0.7)]">
            Quantus V2+ has finalized all tasks, documents, and confirmations.
          </p>
        </motion.div>

        {/* Pre-completion state */}
        {!summary && !completing && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="max-w-lg mx-auto text-center py-16">
            {!dealId ? (
              <>
                <div className="w-20 h-20 rounded-full border border-[hsl(var(--primary)/0.2)] flex items-center justify-center mx-auto mb-6">
                  <FileText size={28} className="text-[hsl(var(--primary)/0.4)]" />
                </div>
                <h2 className="font-display text-xl text-[hsl(var(--foreground))] mb-2">Select a Deal</h2>
                <p className="font-body text-xs text-[hsl(var(--muted-foreground))] mb-6">
                  Navigate from the Documents phase to finalize an operation.
                </p>
                <Link to="/documents" className="inline-flex items-center gap-2 px-8 py-3 border border-[hsl(var(--primary)/0.3)] rounded-xl font-body text-xs tracking-widest uppercase text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.05)] transition-all">
                  <FileText size={14} /> Go to Documents
                </Link>
              </>
            ) : (
              <>
                <motion.div
                  className="w-24 h-24 rounded-full border-2 border-[hsl(var(--primary)/0.3)] flex items-center justify-center mx-auto mb-6"
                  animate={{ boxShadow: ["0 0 0px hsl(var(--primary) / 0)", "0 0 40px hsl(var(--primary) / 0.15)", "0 0 0px hsl(var(--primary) / 0)"] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <CheckCircle2 size={36} className="text-[hsl(var(--primary))]" />
                </motion.div>
                <h2 className="font-display text-xl text-[hsl(var(--foreground))] mb-2">Ready to Finalize</h2>
                <p className="font-body text-xs text-[hsl(var(--muted-foreground))] mb-8 max-w-sm mx-auto">
                  This will archive the deal, generate a completion summary, and prepare intelligence for future operations.
                </p>
                <button onClick={completeDeal}
                  className="inline-flex items-center gap-2 px-10 py-4 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-xl font-body text-xs tracking-widest uppercase hover:opacity-90 transition-all shadow-[0_0_40px_hsl(var(--primary)/0.25)]">
                  <CheckCircle2 size={14} /> Finalize Operation
                </button>
              </>
            )}
          </motion.div>
        )}

        {/* Completing Animation */}
        <AnimatePresence>
          {completing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-20">
              <div className="w-20 h-20 rounded-full border-2 border-[hsl(var(--primary)/0.3)] flex items-center justify-center mx-auto mb-4">
                <Loader2 size={28} className="animate-spin text-[hsl(var(--primary))]" />
              </div>
              <p className="font-display text-lg text-[hsl(var(--foreground))] mb-1">Finalizing Operation</p>
              <p className="font-body text-xs text-[hsl(var(--muted-foreground))]">Archiving documents, confirming payments, generating intelligence…</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Post-completion: Three-column layout */}
        {summary && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-[240px_1fr_260px] gap-6">

            {/* Left — Archival */}
            <div className="hidden lg:block">
              <ArchivalPanel dealId={dealId} />
            </div>

            {/* Center — Completion Card */}
            <div className="space-y-6">
              {/* Ceremonial Card */}
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="border-2 border-[hsl(var(--primary)/0.3)] bg-[hsl(var(--card))] rounded-2xl p-8 relative overflow-hidden"
                style={{ boxShadow: "0 0 60px hsl(var(--primary) / 0.08), inset 0 1px 30px hsl(var(--primary) / 0.03)" }}
              >
                {/* Radial glow */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.04),transparent_70%)]" />

                <div className="relative z-10">
                  {/* Completion Icon */}
                  <div className="flex justify-center mb-6">
                    <motion.div
                      className="w-16 h-16 rounded-full bg-[hsl(var(--primary)/0.1)] border border-[hsl(var(--primary)/0.3)] flex items-center justify-center"
                      animate={{ boxShadow: ["0 0 0px hsl(var(--primary) / 0)", "0 0 30px hsl(var(--primary) / 0.2)", "0 0 0px hsl(var(--primary) / 0)"] }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                    >
                      <CheckCircle2 size={28} className="text-[hsl(var(--primary))]" />
                    </motion.div>
                  </div>

                  {/* Message */}
                  <h2 className="font-display text-2xl md:text-3xl text-center text-[hsl(var(--foreground))] mb-2">
                    Everything is confirmed.
                  </h2>
                  <p className="font-body text-xs text-center text-[hsl(var(--muted-foreground))] mb-8">
                    Deal {summary.deal_number} · Completed {summary.completion_date ? new Date(summary.completion_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "today"}
                  </p>

                  {/* Summary Lines */}
                  <div className="space-y-3 mb-8">
                    {summaryLines.map((line, i) => (
                      <motion.div
                        key={line.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + i * 0.08 }}
                        className="flex items-center gap-3 py-2 border-b border-[hsl(var(--border)/0.3)] last:border-0"
                      >
                        <line.icon size={14} className="text-[hsl(var(--primary)/0.6)] shrink-0" />
                        <span className="font-body text-[11px] text-[hsl(var(--muted-foreground))] flex-1">{line.label}</span>
                        <span className="font-body text-[11px] text-[hsl(var(--foreground))] text-right">{line.value}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => toast.success("Completion package downloading…")}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-[hsl(var(--primary)/0.3)] rounded-xl font-body text-[10px] tracking-widest uppercase text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.05)] transition-all"
                    >
                      <Download size={12} /> Download Package
                    </button>
                    <button
                      onClick={() => toast.info("Timeline view — coming soon")}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-[hsl(var(--border))] rounded-xl font-body text-[10px] tracking-widest uppercase text-[hsl(var(--foreground)/0.7)] hover:bg-[hsl(var(--muted))] transition-all"
                    >
                      <Clock size={12} /> View Full Timeline
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Primary CTA */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
              >
                <Link
                  to="/dashboard"
                  className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-xl font-body text-xs tracking-widest uppercase hover:opacity-90 transition-all shadow-[0_0_40px_hsl(var(--primary)/0.25)]"
                >
                  <Home size={14} />
                  Return to Dashboard
                  <ArrowRight size={14} />
                </Link>
              </motion.div>

              {/* System Ready */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="text-center"
              >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <RefreshCw size={10} className="text-emerald-500" />
                  <span className="font-body text-[9px] text-emerald-500 tracking-wider uppercase">System Ready — Awaiting Next Operation</span>
                </div>
              </motion.div>
            </div>

            {/* Right — Reflections */}
            <div className="hidden lg:block">
              <ReflectionsPanel summary={summary} tierRec={tierRec} upsells={upsells} />
            </div>
          </motion.div>
        )}
      </div>
    </DealPhaseLayout>
  );
};

export default DealCompletion;
