import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import useDocumentHead from "@/hooks/use-document-head";
import DashboardPageWrapper from "@/components/layouts/DashboardPageWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileText, DollarSign, Clock, CheckCircle, Loader2, Send,
  ExternalLink, Copy, Search, Filter, AlertCircle, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrencyCents, formatDateGB } from "@/lib/format-utils";

type Invoice = {
  id: string;
  invoice_number: string;
  deal_id: string;
  amount_cents: number;
  currency: string;
  status: string;
  recipient_name: string | null;
  recipient_email: string | null;
  due_date: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  metadata: any;
  notes: string | null;
  deals?: { deal_number: string; category: string } | null;
};

const STATUS_FILTERS = ["all", "draft", "sent", "paid", "overdue", "cancelled"] as const;

function invoiceStatusColor(status: string) {
  switch (status) {
    case "paid": return "bg-emerald-400/10 text-emerald-400";
    case "sent": return "bg-blue-400/10 text-blue-400";
    case "draft": return "bg-muted text-muted-foreground";
    case "overdue": return "bg-red-400/10 text-red-400";
    case "cancelled": return "bg-red-400/10 text-red-400";
    default: return "bg-amber-400/10 text-amber-400";
  }
}

function invoiceStatusIcon(status: string) {
  switch (status) {
    case "paid": return <CheckCircle size={14} />;
    case "sent": return <Send size={14} />;
    case "overdue": return <AlertCircle size={14} />;
    default: return <Clock size={14} />;
  }
}

const InvoiceManagement = () => {
  useDocumentHead({ title: "Invoices — Quantus V2+", description: "Manage invoices and payment links." });

  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [sending, setSending] = useState<string | null>(null);

  const fetchInvoices = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("invoices")
      .select("*, deals(deal_number, category)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load invoices");
      console.error(error);
    }
    setInvoices((data as Invoice[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchInvoices();
  }, [user]);

  const filtered = invoices.filter((inv) => {
    if (filter !== "all" && inv.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        inv.invoice_number.toLowerCase().includes(q) ||
        (inv.recipient_name || "").toLowerCase().includes(q) ||
        (inv.recipient_email || "").toLowerCase().includes(q) ||
        (inv.deals?.deal_number || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalAmount = invoices.reduce((s, i) => s + i.amount_cents, 0);
  const paidAmount = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.amount_cents, 0);
  const pendingAmount = invoices.filter(i => i.status === "sent").reduce((s, i) => s + i.amount_cents, 0);
  const draftCount = invoices.filter(i => i.status === "draft").length;

  const handleCopyLink = (inv: Invoice) => {
    const url = inv.metadata?.checkout_url;
    if (!url) {
      toast.error("No payment link available for this invoice");
      return;
    }
    navigator.clipboard.writeText(url);
    toast.success("Payment link copied to clipboard");
  };

  const handleOpenLink = (inv: Invoice) => {
    const url = inv.metadata?.checkout_url;
    if (!url) {
      toast.error("No payment link available");
      return;
    }
    window.open(url, "_blank");
  };

  const handleSendReminder = async (inv: Invoice) => {
    if (!inv.recipient_email) {
      toast.error("No recipient email on this invoice");
      return;
    }
    setSending(inv.id);
    try {
      const amountFormatted = new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: inv.currency || "GBP",
      }).format(inv.amount_cents / 100);

      const { error } = await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "payment-reminder",
          recipientEmail: inv.recipient_email,
          idempotencyKey: `invoice-reminder-${inv.id}-${Date.now()}`,
          templateData: {
            recipientName: inv.recipient_name || "Customer",
            invoiceNumber: inv.invoice_number,
            amount: amountFormatted,
            checkoutUrl: inv.metadata?.checkout_url || "",
            dealLabel: inv.deals ? `${inv.deals.deal_number} (${inv.deals.category})` : inv.invoice_number,
          },
        },
      });

      if (error) throw error;
      toast.success(`Reminder sent to ${inv.recipient_email}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to send reminder");
    } finally {
      setSending(null);
    }
  };

  const handleActivateDrafts = async () => {
    const drafts = invoices.filter(i => i.status === "draft");
    if (drafts.length === 0) {
      toast.info("No draft invoices to activate");
      return;
    }
    setSending("bulk");
    try {
      const { data, error } = await supabase.functions.invoke("activate-invoices");
      if (error) throw error;
      toast.success(`Activated ${data?.activated || 0} invoices`);
      await fetchInvoices();
    } catch (err: any) {
      toast.error(err.message || "Failed to activate invoices");
    } finally {
      setSending(null);
    }
  };

  return (
    <DashboardPageWrapper footerLeft="Quantus V2+ — Invoice Management">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
            <FileText size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="font-display text-lg font-semibold text-foreground">Invoice Management</h1>
            <p className="font-body text-[10px] text-muted-foreground tracking-wider">
              Track, send & manage all invoices
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={fetchInvoices} variant="outline" size="sm" className="gap-2" disabled={loading}>
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </Button>
          {draftCount > 0 && (
            <Button onClick={handleActivateDrafts} size="sm" className="gap-2" disabled={sending === "bulk"}>
              {sending === "bulk" ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Activate {draftCount} Draft{draftCount > 1 ? "s" : ""}
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Invoiced", value: formatCurrencyCents(totalAmount, "GBP"), icon: DollarSign, accent: "text-primary" },
          { label: "Paid", value: formatCurrencyCents(paidAmount, "GBP"), icon: CheckCircle, accent: "text-emerald-400" },
          { label: "Pending", value: formatCurrencyCents(pendingAmount, "GBP"), icon: Clock, accent: "text-amber-400" },
          { label: "Drafts", value: String(draftCount), icon: FileText, accent: "text-muted-foreground" },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="glass-card p-4"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <card.icon size={14} className={card.accent} />
              <span className="font-body text-[9px] tracking-[0.2em] uppercase text-muted-foreground">{card.label}</span>
            </div>
            <p className="font-display text-xl font-semibold text-foreground">{card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Filter size={14} className="text-muted-foreground" />
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-body tracking-wider transition-colors capitalize ${
                filter === s
                  ? "bg-primary/20 text-primary"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Invoice List */}
      <div className="space-y-2">
        {loading ? (
          <div className="glass-card p-8 flex items-center justify-center">
            <Loader2 size={18} className="animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card p-6 text-center">
            <p className="font-body text-xs text-muted-foreground">
              {search || filter !== "all" ? "No invoices match your filters." : "No invoices yet."}
            </p>
          </div>
        ) : (
          filtered.map((inv, i) => (
            <motion.div
              key={inv.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="glass-card p-4 flex items-center gap-4"
            >
              {/* Status icon */}
              <div className={`p-2 rounded-lg ${invoiceStatusColor(inv.status)}`}>
                {invoiceStatusIcon(inv.status)}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-body text-xs font-medium text-foreground truncate">
                    {inv.invoice_number}
                  </p>
                  {inv.deals && (
                    <span className="font-body text-[9px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                      {inv.deals.deal_number}
                    </span>
                  )}
                </div>
                <p className="font-body text-[10px] text-muted-foreground mt-0.5 truncate">
                  {inv.recipient_name || "No recipient"}{inv.recipient_email ? ` · ${inv.recipient_email}` : ""}
                </p>
                <p className="font-body text-[9px] text-muted-foreground mt-0.5">
                  {formatDateGB(inv.created_at)}
                  {inv.due_date && ` · Due ${formatDateGB(inv.due_date)}`}
                </p>
              </div>

              {/* Amount */}
              <div className="text-right shrink-0">
                <p className="font-display text-sm font-semibold text-primary">
                  {formatCurrencyCents(inv.amount_cents, inv.currency as any || "GBP")}
                </p>
                {inv.paid_at && (
                  <p className="font-body text-[9px] text-emerald-400 mt-0.5">
                    Paid {formatDateGB(inv.paid_at)}
                  </p>
                )}
              </div>

              {/* Status badge */}
              <span className={`font-body text-[9px] tracking-wider px-2 py-1 rounded-full shrink-0 capitalize ${invoiceStatusColor(inv.status)}`}>
                {inv.status}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                {inv.metadata?.checkout_url && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => handleCopyLink(inv)}
                      title="Copy payment link"
                    >
                      <Copy size={12} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => handleOpenLink(inv)}
                      title="Open payment link"
                    >
                      <ExternalLink size={12} />
                    </Button>
                  </>
                )}
                {inv.status === "sent" && inv.recipient_email && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => handleSendReminder(inv)}
                    disabled={sending === inv.id}
                    title="Send reminder"
                  >
                    {sending === inv.id ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                  </Button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </DashboardPageWrapper>
  );
};

export default InvoiceManagement;
