import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Loader2, ArrowLeft, ArrowRight, CheckCircle2, Clock,
  AlertTriangle, DollarSign, Send, Eye, Zap, Receipt, Sparkles,
  Plane, Heart, Users, Globe, Truck, Handshake, PenTool, Bell,
  TrendingUp, BarChart3, Download, ChevronDown, ChevronUp,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import useDocumentHead from "@/hooks/use-document-head";

const categoryIcons: Record<string, typeof Plane> = {
  aviation: Plane, medical: Heart, staffing: Users,
  lifestyle: Globe, logistics: Truck, partnerships: Handshake,
};

type Deal = {
  id: string; deal_number: string; category: string;
  sub_category: string | null; status: string;
  budget_max: number | null; budget_currency: string;
  deal_value_estimate: number | null;
};

type Document = {
  id: string; deal_id: string; document_type: string; title: string;
  content: string | null; fields: Record<string, any>;
  status: string; signed_at: string | null; created_at: string;
};

type Invoice = {
  id: string; deal_id: string; invoice_number: string; invoice_type: string;
  amount_cents: number; currency: string; line_items: any[];
  due_date: string | null; paid_at: string | null; status: string;
  recipient_name: string | null; reminder_count: number; created_at: string;
};

type CommissionSummary = {
  total_expected: number; total_paid: number; total_outstanding: number;
  by_category: Record<string, { expected: number; paid: number; count: number }>;
};

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  draft: { label: "Draft", color: "text-muted-foreground", icon: FileText },
  generated: { label: "Generated", color: "text-blue-400", icon: Sparkles },
  issued: { label: "Issued", color: "text-amber-400", icon: Send },
  sent: { label: "Sent", color: "text-blue-400", icon: Send },
  signed: { label: "Signed", color: "text-emerald-400", icon: PenTool },
  paid: { label: "Paid", color: "text-emerald-400", icon: CheckCircle2 },
  overdue: { label: "Overdue", color: "text-destructive", icon: AlertTriangle },
};

const DocumentsBilling = () => {
  useDocumentHead({
    title: "Documents & Billing — QUANTUS AI",
    description: "Automated document generation, invoicing, and commission tracking.",
  });

  const [searchParams] = useSearchParams();
  const dealIdParam = searchParams.get("deal");
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selectedDeal, setSelectedDeal] = useState<string | null>(dealIdParam);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [commissionSummary, setCommissionSummary] = useState<CommissionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<"documents" | "invoices" | "commissions">("documents");
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);

  useEffect(() => { fetchDeals(); fetchCommissions(); }, []);
  useEffect(() => { if (selectedDeal) { fetchDocuments(); fetchInvoices(); } }, [selectedDeal]);

  const fetchDeals = async () => {
    const { data } = await supabase.from("deals").select("id, deal_number, category, sub_category, status, budget_max, budget_currency, deal_value_estimate")
      .in("status", ["negotiation", "execution", "completed"]).order("updated_at", { ascending: false });
    setDeals((data as Deal[]) || []);
    if (!selectedDeal && data?.length) setSelectedDeal(data[0].id);
    setLoading(false);
  };

  const fetchDocuments = async () => {
    if (!selectedDeal) return;
    const { data } = await supabase.from("deal_documents").select("*").eq("deal_id", selectedDeal).order("created_at", { ascending: true });
    setDocuments((data as Document[]) || []);
  };

  const fetchInvoices = async () => {
    if (!selectedDeal) return;
    const { data } = await supabase.from("invoices").select("*").eq("deal_id", selectedDeal).order("created_at", { ascending: false });
    setInvoices((data as Invoice[]) || []);
  };

  const fetchCommissions = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const res = await supabase.functions.invoke("document-billing", {
      body: {},
      headers: { "Content-Type": "application/json" },
    });
    // Use direct fetch for query params
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/document-billing?action=commission_summary`;
    const r = await fetch(url, { headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } });
    const result = await r.json();
    if (result.summary) setCommissionSummary(result.summary);
  };

  const generateDocuments = async () => {
    if (!selectedDeal) return;
    setGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/document-billing?action=generate_documents`;
      const r = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${session!.access_token}`, "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        body: JSON.stringify({ deal_id: selectedDeal }),
      });
      const result = await r.json();
      if (result.success) { toast.success("Documents generated"); fetchDocuments(); }
      else toast.error(result.error || "Generation failed");
    } catch { toast.error("Failed to generate documents"); }
    setGenerating(false);
  };

  const generateInvoice = async () => {
    if (!selectedDeal) return;
    setGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/document-billing?action=generate_invoice`;
      const r = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${session!.access_token}`, "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        body: JSON.stringify({ deal_id: selectedDeal }),
      });
      const result = await r.json();
      if (result.success) { toast.success("Invoice generated"); fetchInvoices(); fetchCommissions(); }
      else toast.error(result.error || "Invoice generation failed");
    } catch { toast.error("Failed to generate invoice"); }
    setGenerating(false);
  };

  const sendReminder = async (invoiceId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/document-billing?action=send_reminder`;
      const r = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${session!.access_token}`, "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        body: JSON.stringify({ invoice_id: invoiceId }),
      });
      const result = await r.json();
      if (result.success) { toast.success(`${result.tone} reminder sent`); fetchInvoices(); }
    } catch { toast.error("Failed to send reminder"); }
  };

  const markPaid = async (invoiceId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/document-billing?action=mark_paid`;
      const r = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${session!.access_token}`, "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        body: JSON.stringify({ invoice_id: invoiceId }),
      });
      const result = await r.json();
      if (result.success) { toast.success("Invoice marked as paid"); fetchInvoices(); fetchCommissions(); }
    } catch { toast.error("Failed to update invoice"); }
  };

  const deal = deals.find(d => d.id === selectedDeal);
  const DealIcon = deal ? (categoryIcons[deal.category] || Globe) : Globe;

  const formatCurrency = (cents: number, currency: string = "GBP") =>
    new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(cents / 100);

  if (loading) return (
    <div className="pt-16 min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={32} />
    </div>
  );

  return (
    <div className="pt-16 min-h-screen">
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6 max-w-6xl">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
            <div className="flex items-center gap-3 mb-2">
              <Link to="/workflow" className="text-muted-foreground hover:text-primary transition-colors"><ArrowLeft size={18} /></Link>
              <p className="text-primary font-display text-sm tracking-[0.3em] uppercase">Phase 6</p>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">Documents & Billing</h1>
            <p className="text-muted-foreground text-base mb-8">Automated contracts, invoices, commission tracking, and closing packages.</p>
          </motion.div>

          {/* Deal Selector */}
          {deals.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-12 text-center">
              <FileText size={48} className="mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">No deals in negotiation or execution phase.</p>
              <Link to="/intake" className="text-primary text-sm mt-2 inline-block hover:underline">Start a new deal →</Link>
            </motion.div>
          ) : (
            <>
              {/* Deal chips */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-wrap gap-2 mb-8">
                {deals.map(d => {
                  const Icon = categoryIcons[d.category] || Globe;
                  return (
                    <button key={d.id} onClick={() => setSelectedDeal(d.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm border transition-all ${d.id === selectedDeal ? "border-primary bg-primary/10 text-primary" : "border-border bg-card/40 text-muted-foreground hover:border-primary/40"}`}>
                      <Icon size={14} />{d.deal_number}
                    </button>
                  );
                })}
              </motion.div>

              {/* Commission Dashboard */}
              {commissionSummary && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  {[
                    { label: "Expected Revenue", value: commissionSummary.total_expected, icon: TrendingUp, color: "text-primary" },
                    { label: "Paid", value: commissionSummary.total_paid, icon: CheckCircle2, color: "text-emerald-400" },
                    { label: "Outstanding", value: commissionSummary.total_outstanding, icon: Clock, color: "text-amber-400" },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="rounded-xl border border-border bg-card/60 backdrop-blur-sm p-5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
                        <Icon size={14} className={color} />
                      </div>
                      <p className={`text-2xl font-display font-bold ${color} tabular-nums`}>{formatCurrency(value)}</p>
                    </div>
                  ))}
                </motion.div>
              )}

              {/* Tabs */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex gap-1 mb-6 p-1 rounded-xl bg-secondary/40 w-fit">
                {(["documents", "invoices", "commissions"] as const).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${activeTab === tab ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                    {tab}
                  </button>
                ))}
              </motion.div>

              {/* Documents Tab */}
              {activeTab === "documents" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">{documents.length} document{documents.length !== 1 ? "s" : ""}</p>
                    <button onClick={generateDocuments} disabled={generating}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
                      {generating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                      Generate Documents
                    </button>
                  </div>

                  {documents.length === 0 ? (
                    <div className="rounded-xl border border-border bg-card/60 p-12 text-center">
                      <FileText size={40} className="mx-auto text-muted-foreground/30 mb-3" />
                      <p className="text-muted-foreground text-sm">No documents yet. Click "Generate Documents" to create the full package.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {documents.map((doc, i) => {
                        const config = statusConfig[doc.status] || statusConfig.draft;
                        const isExpanded = expandedDoc === doc.id;
                        return (
                          <motion.div key={doc.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                            className="rounded-xl border border-border bg-card/60 backdrop-blur-sm overflow-hidden">
                            <button onClick={() => setExpandedDoc(isExpanded ? null : doc.id)}
                              className="w-full flex items-center justify-between p-4 hover:bg-secondary/20 transition-colors text-left">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg bg-secondary flex items-center justify-center`}>
                                  <config.icon size={14} className={config.color} />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-foreground">{doc.document_type}</p>
                                  <p className="text-xs text-muted-foreground">{doc.title}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className={`text-[10px] uppercase tracking-wider font-semibold ${config.color}`}>{config.label}</span>
                                {isExpanded ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
                              </div>
                            </button>
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                  <div className="px-4 pb-4 border-t border-border/50">
                                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap mt-3 font-sans leading-relaxed max-h-60 overflow-y-auto">{doc.content}</pre>
                                    {doc.fields && Object.keys(doc.fields).length > 0 && (
                                      <div className="mt-3 flex flex-wrap gap-2">
                                        {Object.entries(doc.fields).map(([k, v]) => (
                                          <span key={k} className="text-[10px] bg-secondary px-2 py-1 rounded text-muted-foreground">
                                            {k}: <span className="text-foreground">{String(v)}</span>
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Invoices Tab */}
              {activeTab === "invoices" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">{invoices.length} invoice{invoices.length !== 1 ? "s" : ""}</p>
                    <button onClick={generateInvoice} disabled={generating}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
                      {generating ? <Loader2 size={14} className="animate-spin" /> : <Receipt size={14} />}
                      Generate Invoice
                    </button>
                  </div>

                  {invoices.length === 0 ? (
                    <div className="rounded-xl border border-border bg-card/60 p-12 text-center">
                      <Receipt size={40} className="mx-auto text-muted-foreground/30 mb-3" />
                      <p className="text-muted-foreground text-sm">No invoices yet. Generate one for this deal.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {invoices.map((inv, i) => {
                        const config = statusConfig[inv.status] || statusConfig.draft;
                        const isOverdue = inv.due_date && new Date(inv.due_date) < new Date() && inv.status !== "paid";
                        return (
                          <motion.div key={inv.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                            className={`rounded-xl border bg-card/60 backdrop-blur-sm p-5 ${isOverdue ? "border-destructive/40" : "border-border"}`}>
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="text-sm font-semibold text-foreground font-mono">{inv.invoice_number}</p>
                                  <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${isOverdue ? "bg-destructive/10 text-destructive" : `${config.color}`}`}>
                                    {isOverdue ? "Overdue" : config.label}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground">{inv.recipient_name || "—"} · {inv.invoice_type}</p>
                                {inv.due_date && <p className="text-xs text-muted-foreground mt-1">Due: {new Date(inv.due_date).toLocaleDateString()}</p>}
                              </div>
                              <p className="text-xl font-display font-bold text-foreground tabular-nums">{formatCurrency(inv.amount_cents, inv.currency)}</p>
                            </div>

                            {inv.status !== "paid" && (
                              <div className="flex gap-2 mt-4">
                                <button onClick={() => sendReminder(inv.id)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors">
                                  <Bell size={12} />Remind ({inv.reminder_count})
                                </button>
                                <button onClick={() => markPaid(inv.id)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs hover:bg-emerald-500/20 transition-colors">
                                  <CheckCircle2 size={12} />Mark Paid
                                </button>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Commissions Tab */}
              {activeTab === "commissions" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  {commissionSummary && Object.keys(commissionSummary.by_category).length > 0 ? (
                    <div className="space-y-3">
                      {Object.entries(commissionSummary.by_category).map(([cat, data], i) => {
                        const Icon = categoryIcons[cat] || Globe;
                        const paidPercent = data.expected > 0 ? Math.round((data.paid / data.expected) * 100) : 0;
                        return (
                          <motion.div key={cat} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                            className="rounded-xl border border-border bg-card/60 backdrop-blur-sm p-5">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Icon size={16} className="text-primary" />
                                <p className="text-sm font-medium text-foreground capitalize">{cat}</p>
                                <span className="text-xs text-muted-foreground">({data.count} deal{data.count !== 1 ? "s" : ""})</span>
                              </div>
                              <p className="text-sm font-semibold text-foreground tabular-nums">{formatCurrency(data.expected)}</p>
                            </div>
                            <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${paidPercent}%` }} transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full rounded-full bg-emerald-500" />
                            </div>
                            <div className="flex justify-between mt-2">
                              <span className="text-[10px] text-emerald-400">Paid: {formatCurrency(data.paid)}</span>
                              <span className="text-[10px] text-muted-foreground">{paidPercent}% collected</span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-border bg-card/60 p-12 text-center">
                      <BarChart3 size={40} className="mx-auto text-muted-foreground/30 mb-3" />
                      <p className="text-muted-foreground text-sm">No commission data yet. Generate invoices to start tracking.</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Phase 7 Handoff */}
              {deal && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                  className="mt-12 rounded-2xl border border-primary/20 bg-primary/5 p-6 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-primary mb-1">Next Phase</p>
                    <p className="text-foreground font-display font-semibold">Phase 7 — Deal Completion & Post-Deal</p>
                    <p className="text-xs text-muted-foreground mt-1">Close the deal, generate final reports, and trigger upsell opportunities.</p>
                  </div>
                  <ArrowRight size={20} className="text-primary" />
                </motion.div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default DocumentsBilling;
