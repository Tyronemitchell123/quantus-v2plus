import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Loader2, ArrowRight, CheckCircle2, Clock,
  AlertTriangle, DollarSign, Send, Sparkles, Receipt,
  Plane, Heart, Users, Globe, Truck, Handshake, PenTool, Bell,
  TrendingUp, BarChart3, Download, ChevronDown, ChevronUp,
  FolderOpen, FileSignature, LayoutTemplate, ClipboardList, Settings2, Filter,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import useDocumentHead from "@/hooks/use-document-head";
import DocumentsAIPanel from "@/components/documents/DocumentsAIPanel";

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

type NavSection = "all" | "contracts" | "invoices" | "receipts" | "reports" | "templates" | "commissions" | "settings";

const navItems: { key: NavSection; icon: typeof FileText; label: string }[] = [
  { key: "all", icon: FolderOpen, label: "All Documents" },
  { key: "contracts", icon: FileSignature, label: "Contracts" },
  { key: "invoices", icon: Receipt, label: "Invoices" },
  { key: "receipts", icon: ClipboardList, label: "Receipts" },
  { key: "reports", icon: BarChart3, label: "Reports" },
  { key: "templates", icon: LayoutTemplate, label: "Templates" },
  { key: "commissions", icon: DollarSign, label: "Commissions" },
  { key: "settings", icon: Settings2, label: "Settings" },
];

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle2 }> = {
  draft: { label: "Draft", icon: FileText },
  generated: { label: "Generated", icon: Sparkles },
  issued: { label: "Issued", icon: Send },
  sent: { label: "Sent", icon: Send },
  signed: { label: "Signed", icon: PenTool },
  paid: { label: "Paid", icon: CheckCircle2 },
  overdue: { label: "Overdue", icon: AlertTriangle },
  archived: { label: "Archived", icon: FolderOpen },
};

const templateLibrary = [
  { title: "Letter of Intent", category: "LOI" },
  { title: "Service Agreement", category: "Contract" },
  { title: "Non-Disclosure Agreement", category: "NDA" },
  { title: "Commission Invoice", category: "Invoice" },
  { title: "Medical Consent Form", category: "Medical" },
  { title: "Staffing Placement Agreement", category: "Staffing" },
];

const aiPromptsBySection: Record<NavSection, string[]> = {
  all: ["Summarize all documents", "Find pending signatures", "Prepare closing package", "Generate revised version"],
  contracts: ["Summarize this contract", "Highlight key risks", "Prepare signature request", "Generate revised version"],
  invoices: ["Send payment reminder", "Generate commission invoice", "Prepare consolidated billing", "Calculate outstanding"],
  receipts: ["Generate receipt for payment", "Export receipts as PDF", "Summarize payment history"],
  reports: ["Generate deal report", "Prepare financial summary", "Vendor performance review", "Annual review"],
  templates: ["Customize template for deal", "Generate new template", "Compare template versions"],
  commissions: ["Aviation commission forecast", "Staffing margin analysis", "Outstanding commissions report", "Category breakdown"],
  settings: ["Update invoice branding", "Configure tax settings", "Set payment instructions"],
};

const DocumentsBilling = () => {
  useDocumentHead({
    title: "Documents & Billing — Quantus V2+",
    description: "Automated contracts, invoices, commission tracking, and closing packages.",
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
  const [activeSection, setActiveSection] = useState<NavSection>("all");
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

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
  const formatCurrency = (cents: number, currency: string = "GBP") =>
    new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(cents / 100);

  const filteredDocs = documents.filter(d => {
    if (activeSection === "contracts") return ["LOI", "contract", "nda", "agreement"].some(t => d.document_type.toLowerCase().includes(t));
    if (activeSection === "receipts") return d.document_type.toLowerCase().includes("receipt");
    if (activeSection === "reports") return d.document_type.toLowerCase().includes("report");
    return true;
  }).filter(d => statusFilter === "all" || d.status === statusFilter);

  if (loading) return (
    <div className="pt-16 min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <p className="font-body text-xs tracking-[0.35em] uppercase text-primary/70 mb-2">Private Office</p>
          <h1 className="font-display text-2xl sm:text-3xl font-medium">Documents & Billing</h1>
          <p className="font-body text-sm text-muted-foreground mt-1">Contracts, invoices, signatures, and financial intelligence.</p>
        </div>

        {/* Deal selector chips */}
        {deals.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {deals.map(d => {
              const Icon = categoryIcons[d.category] || Globe;
              return (
                <button key={d.id} onClick={() => setSelectedDeal(d.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 font-body text-xs transition-all ${d.id === selectedDeal ? "border border-primary/30 bg-primary/10 text-primary" : "border border-border text-muted-foreground hover:border-primary/20"}`}>
                  <Icon size={12} />{d.deal_number}
                </button>
              );
            })}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Navigation Rail */}
          <div className="lg:w-48 shrink-0">
            <div className="glass-card p-2 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible">
              {navItems.map((item) => {
                const active = activeSection === item.key;
                return (
                  <button key={item.key} onClick={() => setActiveSection(item.key)}
                    className={`flex items-center gap-3 px-4 py-2.5 text-left font-body text-xs transition-all duration-300 whitespace-nowrap shrink-0 ${active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary/30"}`}>
                    <item.icon size={14} strokeWidth={1.5} />
                    <span className="hidden lg:inline">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Canvas */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div key={activeSection} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
                <div className="flex flex-col xl:flex-row gap-6">
                  <div className="flex-1 min-w-0 space-y-6">

                    {/* === ALL DOCUMENTS / CONTRACTS / RECEIPTS / REPORTS === */}
                    {["all", "contracts", "receipts", "reports"].includes(activeSection) && (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <h2 className="font-display text-lg font-medium capitalize">
                              {activeSection === "all" ? "All Documents" : activeSection}
                            </h2>
                            <span className="font-body text-[10px] text-muted-foreground">{filteredDocs.length} items</span>
                          </div>
                          <div className="flex gap-2">
                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                              className="bg-secondary/50 border border-border px-3 py-1.5 font-body text-xs text-foreground focus:outline-none focus:border-primary/30">
                              <option value="all">All Status</option>
                              <option value="draft">Draft</option>
                              <option value="generated">Generated</option>
                              <option value="signed">Signed</option>
                              <option value="archived">Archived</option>
                            </select>
                            <button onClick={generateDocuments} disabled={generating || !selectedDeal}
                              className="flex items-center gap-2 px-4 py-1.5 bg-primary text-primary-foreground font-body text-xs tracking-wider hover:bg-primary/90 transition-colors disabled:opacity-50">
                              {generating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                              Generate
                            </button>
                          </div>
                        </div>

                        {filteredDocs.length === 0 ? (
                          <div className="glass-card p-12 text-center">
                            <FileText size={36} className="mx-auto text-muted-foreground/20 mb-3" />
                            <p className="font-body text-sm text-muted-foreground">No documents found. Generate to create the full package.</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {filteredDocs.map((doc, i) => {
                              const cfg = statusConfig[doc.status] || statusConfig.draft;
                              const isExpanded = expandedDoc === doc.id;
                              return (
                                <motion.div key={doc.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                                  className="glass-card overflow-hidden">
                                  <button onClick={() => setExpandedDoc(isExpanded ? null : doc.id)}
                                    className="w-full flex items-center justify-between p-4 hover:bg-secondary/20 transition-colors text-left">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 border border-border flex items-center justify-center">
                                        <cfg.icon size={12} className="text-primary" />
                                      </div>
                                      <div>
                                        <p className="font-body text-xs font-medium text-foreground">{doc.document_type}</p>
                                        <p className="font-body text-[10px] text-muted-foreground">{doc.title} · {deal?.deal_number}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <span className="font-body text-[9px] tracking-[0.15em] uppercase text-primary/60">{cfg.label}</span>
                                      {isExpanded ? <ChevronUp size={12} className="text-muted-foreground" /> : <ChevronDown size={12} className="text-muted-foreground" />}
                                    </div>
                                  </button>
                                  <AnimatePresence>
                                    {isExpanded && (
                                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                        <div className="px-4 pb-4 border-t border-border/50">
                                          {/* Action bar */}
                                          <div className="flex gap-2 mt-3 mb-3">
                                            {["Download", "Request Signature", "Archive", "Share"].map(action => (
                                              <button key={action} className="px-3 py-1 border border-border font-body text-[10px] text-muted-foreground hover:text-foreground hover:border-primary/20 transition-colors">
                                                {action}
                                              </button>
                                            ))}
                                          </div>
                                          <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed max-h-48 overflow-y-auto">{doc.content}</pre>
                                          {doc.fields && Object.keys(doc.fields).length > 0 && (
                                            <div className="mt-3 flex flex-wrap gap-2">
                                              {Object.entries(doc.fields).map(([k, v]) => (
                                                <span key={k} className="text-[10px] bg-secondary px-2 py-1 text-muted-foreground">
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
                      </>
                    )}

                    {/* === INVOICES === */}
                    {activeSection === "invoices" && (
                      <>
                        <div className="flex items-center justify-between">
                          <h2 className="font-display text-lg font-medium">Invoice Center</h2>
                          <button onClick={generateInvoice} disabled={generating || !selectedDeal}
                            className="flex items-center gap-2 px-4 py-1.5 bg-primary text-primary-foreground font-body text-xs tracking-wider hover:bg-primary/90 transition-colors disabled:opacity-50">
                            {generating ? <Loader2 size={12} className="animate-spin" /> : <Receipt size={12} />}
                            Create Invoice
                          </button>
                        </div>

                        {/* Invoice filter pills */}
                        <div className="flex gap-2">
                          {["All", "Unpaid", "Paid", "Overdue"].map(f => (
                            <button key={f} className="px-3 py-1 border border-border font-body text-[10px] tracking-wider uppercase text-muted-foreground hover:text-primary hover:border-primary/20 transition-colors">
                              {f}
                            </button>
                          ))}
                        </div>

                        {invoices.length === 0 ? (
                          <div className="glass-card p-12 text-center">
                            <Receipt size={36} className="mx-auto text-muted-foreground/20 mb-3" />
                            <p className="font-body text-sm text-muted-foreground">No invoices yet. Generate one for this deal.</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {invoices.map((inv, i) => {
                              const isOverdue = inv.due_date && new Date(inv.due_date) < new Date() && inv.status !== "paid";
                              return (
                                <motion.div key={inv.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                                  className={`glass-card p-5 ${isOverdue ? "border-destructive/30" : ""}`}>
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <div className="flex items-center gap-2 mb-1">
                                        <p className="font-body text-xs font-medium text-foreground font-mono">{inv.invoice_number}</p>
                                        <span className={`font-body text-[9px] tracking-[0.15em] uppercase px-2 py-0.5 ${isOverdue ? "bg-destructive/10 text-destructive" : "text-primary/60"}`}>
                                          {isOverdue ? "Overdue" : inv.status}
                                        </span>
                                      </div>
                                      <p className="font-body text-[10px] text-muted-foreground">{inv.recipient_name || "—"} · {inv.invoice_type}</p>
                                      {inv.due_date && <p className="font-body text-[10px] text-muted-foreground mt-1">Due: {new Date(inv.due_date).toLocaleDateString()}</p>}
                                    </div>
                                    <p className="font-display text-lg font-medium text-foreground tabular-nums">{formatCurrency(inv.amount_cents, inv.currency)}</p>
                                  </div>

                                  {inv.status !== "paid" && (
                                    <div className="flex gap-2 mt-4">
                                      <button onClick={() => sendReminder(inv.id)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 border border-border font-body text-[10px] text-muted-foreground hover:text-foreground hover:border-primary/20 transition-colors">
                                        <Bell size={10} />Remind ({inv.reminder_count})
                                      </button>
                                      <button onClick={() => markPaid(inv.id)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary font-body text-[10px] hover:bg-primary/20 transition-colors">
                                        <CheckCircle2 size={10} />Mark Paid
                                      </button>
                                    </div>
                                  )}
                                </motion.div>
                              );
                            })}
                          </div>
                        )}
                      </>
                    )}

                    {/* === COMMISSIONS === */}
                    {activeSection === "commissions" && (
                      <>
                        <h2 className="font-display text-lg font-medium">Commission Dashboard</h2>

                        {/* Summary cards */}
                        {commissionSummary && (
                          <div className="grid sm:grid-cols-3 gap-4">
                            {[
                              { label: "Total Earned", value: commissionSummary.total_expected, icon: TrendingUp },
                              { label: "Paid", value: commissionSummary.total_paid, icon: CheckCircle2 },
                              { label: "Outstanding", value: commissionSummary.total_outstanding, icon: Clock },
                            ].map(({ label, value, icon: Icon }) => (
                              <div key={label} className="glass-card p-5 text-center">
                                <Icon size={14} className="text-primary mx-auto mb-2" />
                                <p className="font-display text-xl font-medium text-primary mb-1">{formatCurrency(value)}</p>
                                <p className="font-body text-[9px] tracking-[0.15em] uppercase text-muted-foreground">{label}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Category breakdown */}
                        {commissionSummary && Object.keys(commissionSummary.by_category).length > 0 ? (
                          <div className="space-y-3">
                            {Object.entries(commissionSummary.by_category).map(([cat, data], i) => {
                              const Icon = categoryIcons[cat] || Globe;
                              const paidPercent = data.expected > 0 ? Math.round((data.paid / data.expected) * 100) : 0;
                              return (
                                <motion.div key={cat} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                  className="glass-card p-5">
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                      <Icon size={14} className="text-primary" />
                                      <p className="font-body text-xs font-medium text-foreground capitalize">{cat}</p>
                                      <span className="font-body text-[10px] text-muted-foreground">({data.count} deal{data.count !== 1 ? "s" : ""})</span>
                                    </div>
                                    <p className="font-body text-sm font-medium text-foreground tabular-nums">{formatCurrency(data.expected)}</p>
                                  </div>
                                  <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${paidPercent}%` }} transition={{ duration: 1 }}
                                      className="h-full rounded-full bg-primary" />
                                  </div>
                                  <div className="flex justify-between mt-2">
                                    <span className="font-body text-[10px] text-primary">Paid: {formatCurrency(data.paid)}</span>
                                    <span className="font-body text-[10px] text-muted-foreground">{paidPercent}%</span>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="glass-card p-12 text-center">
                            <BarChart3 size={36} className="mx-auto text-muted-foreground/20 mb-3" />
                            <p className="font-body text-sm text-muted-foreground">No commission data yet.</p>
                          </div>
                        )}
                      </>
                    )}

                    {/* === TEMPLATES === */}
                    {activeSection === "templates" && (
                      <>
                        <h2 className="font-display text-lg font-medium">Templates Library</h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                          {templateLibrary.map((tpl, i) => (
                            <motion.div key={tpl.title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                              className="glass-card p-5 group hover:border-primary/20 transition-all cursor-pointer">
                              <LayoutTemplate size={14} className="text-primary mb-3" />
                              <p className="font-body text-xs font-medium text-foreground mb-1">{tpl.title}</p>
                              <p className="font-body text-[10px] text-muted-foreground mb-3">{tpl.category}</p>
                              <button className="font-body text-[10px] tracking-[0.15em] uppercase text-primary/60 group-hover:text-primary transition-colors">
                                Use Template →
                              </button>
                            </motion.div>
                          ))}
                        </div>
                      </>
                    )}

                    {/* === SETTINGS === */}
                    {activeSection === "settings" && (
                      <>
                        <h2 className="font-display text-lg font-medium">Document & Billing Settings</h2>
                        <div className="space-y-3">
                          {["Default Templates", "Signature Methods", "Invoice Branding", "Tax Settings", "Payment Instructions", "Document Retention"].map((setting) => (
                            <div key={setting} className="glass-card p-4 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Settings2 size={12} className="text-primary" />
                                <p className="font-body text-xs text-foreground">{setting}</p>
                              </div>
                              <button className="font-body text-[10px] text-primary/60 hover:text-primary transition-colors">Configure</button>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {/* Phase 7 Handoff */}
                    {deal && (
                      <Link to={`/deal-completion?deal=${deal.id}`}>
                        <div className="mt-8 glass-card p-6 flex items-center justify-between hover:border-primary/20 transition-colors cursor-pointer">
                          <div>
                            <p className="font-body text-[10px] tracking-[0.2em] uppercase text-primary/60 mb-1">Next Phase</p>
                            <p className="font-display text-sm font-medium">Phase 7 — Deal Completion</p>
                            <p className="font-body text-[10px] text-muted-foreground mt-1">Close the deal, generate final reports, and trigger upsell opportunities.</p>
                          </div>
                          <ArrowRight size={16} className="text-primary" />
                        </div>
                      </Link>
                    )}
                  </div>

                  {/* Right AI Panel */}
                  <div className="xl:w-72 shrink-0">
                    <DocumentsAIPanel prompts={aiPromptsBySection[activeSection]} />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentsBilling;
