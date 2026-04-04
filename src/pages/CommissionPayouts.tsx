import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, Filter, Search, ExternalLink, Loader2, Check, ArrowUpDown, Calendar, Download, RefreshCw, Bell, Mail, Send, CreditCard, Copy, Link, MapPin, Save, QrCode, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import useDocumentHead from "@/hooks/use-document-head";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type CommissionLog = {
  id: string;
  deal_id: string;
  category: string;
  status: string;
  deal_value_cents: number | null;
  commission_rate: number | null;
  commission_cents: number;
  vendor_name: string | null;
  invoice_id: string | null;
  paid_at: string | null;
  created_at: string;
  notes: string | null;
};

type InvoiceRecord = {
  id: string;
  invoice_number: string;
  amount_cents: number;
  status: string;
  metadata: any;
  created_at: string;
  recipient_email: string | null;
  recipient_name: string | null;
  recipient_address: string | null;
  deal_id: string;
};

type SortKey = "created_at" | "commission_cents" | "category" | "status";

const CommissionPayouts = () => {
  const [commissions, setCommissions] = useState<CommissionLog[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortAsc, setSortAsc] = useState(false);
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [payoutPreview, setPayoutPreview] = useState<any>(null);
  const [payoutResult, setPayoutResult] = useState<any>(null);
  const [reminderLoading, setReminderLoading] = useState(false);
  const [remindersSent, setRemindersSent] = useState<string[]>([]);
  const [collectingDealId, setCollectingDealId] = useState<string | null>(null);
  const [sendingDealId, setSendingDealId] = useState<string | null>(null);
  const [editingContact, setEditingContact] = useState<Record<string, { email: string; address: string }>>({});
  const [savingContact, setSavingContact] = useState<string | null>(null);
  const [qrDealId, setQrDealId] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState<string | null>(null);
  const [bulkResendLoading, setBulkResendLoading] = useState(false);
  const [backfillLoading, setBackfillLoading] = useState(false);

  useDocumentHead({
    title: "Commission Payouts — QUANTUS V2+",
    description: "View your full commission history, filter by status, and manage Stripe payouts.",
  });

  const { user } = useAuth();

  useEffect(() => { fetchData(); }, [user]);

  const fetchData = async () => {
    setLoading(true);
    if (!user) { setLoading(false); return; }

    const [commRes, invRes] = await Promise.all([
      supabase
        .from("commission_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("invoices")
        .select("id, invoice_number, amount_cents, status, metadata, created_at, recipient_email, recipient_name, recipient_address, deal_id")
        .eq("user_id", user.id)
        .eq("invoice_type", "commission")
        .order("created_at", { ascending: false }),
    ]);

    if (commRes.data) setCommissions(commRes.data as CommissionLog[]);
    if (invRes.data) setInvoices(invRes.data as InvoiceRecord[]);
    setLoading(false);
  };

  const previewPayout = async () => {
    setPayoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("process-commission-payouts", {
        body: { action: "preview" },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      if (!data?.payouts?.length) {
        toast.info("No pending commissions to pay out");
        setPayoutLoading(false);
        return;
      }
      setPayoutPreview(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load payout preview");
    }
    setPayoutLoading(false);
  };

  const executePayout = async () => {
    setPayoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("process-commission-payouts", {
        body: { action: "execute" },
      });
      // Parse error response — could be in data or error
      const errorBody = data?.error || error?.message;
      if (errorBody) {
        // Check for insufficient balance specifically
        if (typeof errorBody === "string" && errorBody.includes("Insufficient")) {
          toast.error("Insufficient Stripe balance — customers must pay their invoices before you can withdraw. Use 'Collect Payment' or 'Send Reminders' to request payment.");
        } else {
          try {
            const parsed = typeof errorBody === "string" ? JSON.parse(errorBody) : errorBody;
            toast.error(parsed?.error || parsed?.guidance || "Payout failed");
          } catch {
            toast.error(typeof errorBody === "string" ? errorBody : "Payout failed");
          }
        }
        setPayoutLoading(false);
        return;
      }
      setPayoutResult(data);
      setPayoutPreview(null);
      toast.success(`Commission payout of ${data.total} processed via Stripe`);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Payout failed");
    }
    setPayoutLoading(false);
  };

  const sendReminders = async () => {
    setReminderLoading(true);
    try {
      if (!user) throw new Error("Not authenticated");

      // Get pending commissions that haven't been reminded yet
      const pendingDeals = commissions.filter(
        c => (c.status === "pending" || c.status === "expected") && !remindersSent.includes(c.id)
      );

      if (pendingDeals.length === 0) {
        toast.info("No pending commissions to send reminders for");
        setReminderLoading(false);
        return;
      }

      let sentCount = 0;
      const newRemindersSent: string[] = [];

      for (const commission of pendingDeals) {
        // Find the invoice/vendor email for this commission's deal
        const inv = invoices.find(i => i.deal_id === commission.deal_id);
        const recipientEmail = inv?.recipient_email;
        if (!recipientEmail) {
          // Skip if no customer email on file
          continue;
        }

        // Send email reminder to the customer, not to ourselves
        const { error: emailError } = await supabase.functions.invoke("send-transactional-email", {
          body: {
            templateName: "payment-reminder",
            recipientEmail,
            idempotencyKey: `payment-reminder-${commission.id}-${new Date().toISOString().slice(0, 10)}`,
            templateData: {
              customerName: inv?.recipient_name || commission.vendor_name || "Customer",
              dealCategory: commission.category,
              dealNumber: commission.deal_id.slice(0, 8).toUpperCase(),
              amountDue: `$${(commission.commission_cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0 })}`,
            },
          },
        });

        // Create in-app notification
        await supabase.from("notifications").insert({
          user_id: user.id,
          title: "Payment Reminder Sent",
          body: `Reminder sent for ${commission.category} deal — ${commission.vendor_name || "vendor"} — $${(commission.commission_cents / 100).toLocaleString()}`,
          category: "billing",
          severity: "info",
          action_url: "/commission-payouts",
        });

        if (!emailError) {
          sentCount++;
          newRemindersSent.push(commission.id);
        }
      }

      setRemindersSent(prev => [...prev, ...newRemindersSent]);
      toast.success(`Sent ${sentCount} payment reminder${sentCount !== 1 ? "s" : ""} (email + notification)`);
    } catch (err: any) {
      toast.error(err.message || "Failed to send reminders");
    }
    setReminderLoading(false);
  };

  const eligibleResendInvoices = useMemo(() => {
    return invoices.filter(
      i => i.status === "sent" && i.recipient_email && i.metadata?.checkout_url
    );
  }, [invoices]);

  const invoicesWithLinks = useMemo(() => {
    return invoices.filter(i => (i.metadata as any)?.checkout_url);
  }, [invoices]);

  const bulkResendReminders = async () => {
    setBulkResendLoading(true);
    try {
      if (!user) throw new Error("Not authenticated");
      let success = 0;
      let failed = 0;
      const today = new Date().toISOString().slice(0, 10);

      for (const inv of eligibleResendInvoices) {
        const amountStr = new Intl.NumberFormat("en-GB", {
          style: "currency",
          currency: inv.metadata?.currency || "GBP",
          minimumFractionDigits: 0,
        }).format(inv.amount_cents / 100);

        const commission = commissions.find(c => c.deal_id === inv.deal_id);

        const { error } = await supabase.functions.invoke("send-transactional-email", {
          body: {
            templateName: "payment-reminder",
            recipientEmail: inv.recipient_email,
            idempotencyKey: `resend-${inv.id}-${today}`,
            templateData: {
              customerName: inv.recipient_name || commission?.vendor_name || "Customer",
              dealCategory: commission?.category || "deal",
              dealNumber: inv.invoice_number,
              amountDue: amountStr,
              paymentUrl: inv.metadata.checkout_url,
            },
          },
        });

        if (error) { failed++; } else { success++; }
      }

      if (success > 0) toast.success(`Resent ${success} payment link${success !== 1 ? "s" : ""}`);
      if (failed > 0) toast.error(`${failed} email${failed !== 1 ? "s" : ""} failed to send`);
      if (success === 0 && failed === 0) toast.info("No eligible invoices to resend");
    } catch (err: any) {
      toast.error(err.message || "Failed to resend payment links");
    }
    setBulkResendLoading(false);
  };

  const invoicesMissingEmail = useMemo(() => {
    return invoices.filter(i => i.status === "sent" && !i.recipient_email);
  }, [invoices]);

  const backfillAndSend = async () => {
    setBackfillLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("backfill-invoice-emails", {
        body: {},
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      const { updated = 0, emails_sent = 0, unresolved = 0, results = [] } = data || {};

      if (updated > 0) {
        toast.success(`${updated} invoice${updated !== 1 ? "s" : ""} updated with emails, ${emails_sent} reminder${emails_sent !== 1 ? "s" : ""} sent`);
      }
      if (unresolved > 0) {
        toast.info(`${unresolved} invoice${unresolved !== 1 ? "s" : ""} still need manual email entry — no vendor email found`);
      }
      if (updated === 0 && unresolved === 0) {
        toast.info("No invoices need email backfill");
      }

      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Backfill failed");
    }
    setBackfillLoading(false);
  };


  const categories = useMemo(() => {
    const cats = new Set(commissions.map(c => c.category));
    return Array.from(cats).sort();
  }, [commissions]);

  const filtered = useMemo(() => {
    let items = [...commissions];
    if (search) {
      const s = search.toLowerCase();
      items = items.filter(c =>
        c.category.toLowerCase().includes(s) ||
        (c.vendor_name || "").toLowerCase().includes(s) ||
        c.deal_id.toLowerCase().includes(s)
      );
    }
    if (statusFilter !== "all") items = items.filter(c => c.status === statusFilter);
    if (categoryFilter !== "all") items = items.filter(c => c.category === categoryFilter);
    items.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "created_at") cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      else if (sortKey === "commission_cents") cmp = a.commission_cents - b.commission_cents;
      else if (sortKey === "category") cmp = a.category.localeCompare(b.category);
      else if (sortKey === "status") cmp = a.status.localeCompare(b.status);
      return sortAsc ? cmp : -cmp;
    });
    return items;
  }, [commissions, search, statusFilter, categoryFilter, sortKey, sortAsc]);

  const totals = useMemo(() => ({
    total: commissions.reduce((s, c) => s + c.commission_cents, 0),
    paid: commissions.filter(c => c.status === "paid").reduce((s, c) => s + c.commission_cents, 0),
    pending: commissions.filter(c => c.status === "expected").reduce((s, c) => s + c.commission_cents, 0),
    invoiced: commissions.filter(c => c.invoice_id).reduce((s, c) => s + c.commission_cents, 0),
  }), [commissions]);

  const fmt = (cents: number) => `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
  const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const getInvoiceUrl = (invoiceId: string | null) => {
    if (!invoiceId) return null;
    const inv = invoices.find(i => i.id === invoiceId);
    return inv?.metadata?.stripe_invoice_url || null;
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-500/10 text-green-400 border-green-500/20";
      case "processing": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "pending": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "expected": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col">
        <DashboardTopBar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-20 md:pt-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-3 mb-1">
                <DollarSign className="text-primary" size={22} />
                <p className="text-primary font-display text-xs tracking-[0.3em] uppercase">Revenue</p>
              </div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Commission Payouts</h1>
            </motion.div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Total Earned", value: fmt(totals.total), color: "text-foreground" },
                { label: "Paid Out", value: fmt(totals.paid), color: "text-green-400" },
                { label: "Pending", value: fmt(totals.pending), color: "text-amber-400" },
                { label: "Invoiced", value: fmt(totals.invoiced), color: "text-primary" },
              ].map((s) => (
                <Card key={s.label} className="border-border">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                    <p className={`text-xl font-display font-bold ${s.color}`}>{s.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Payout Action */}
            <Card className="border-primary/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-display flex items-center gap-2">
                  <DollarSign size={16} className="text-primary" />
                  Stripe Payout
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!payoutPreview && !payoutResult && (
                  <Button onClick={previewPayout} disabled={payoutLoading} className="gap-2">
                    {payoutLoading ? <Loader2 size={14} className="animate-spin" /> : <DollarSign size={14} />}
                    Preview Payout
                  </Button>
                )}

                <AnimatePresence mode="wait">
                  {payoutPreview && (
                    <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Category</TableHead>
                            <TableHead>Deal Value</TableHead>
                            <TableHead>Rate</TableHead>
                            <TableHead className="text-right">Commission</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {payoutPreview.payouts.map((p: any) => (
                            <TableRow key={p.id}>
                              <TableCell className="capitalize">{p.category}</TableCell>
                              <TableCell className="text-muted-foreground">{p.deal_value}</TableCell>
                              <TableCell className="text-muted-foreground">{p.commission_rate}</TableCell>
                              <TableCell className="text-right font-medium text-primary">{p.commission}</TableCell>
                            </TableRow>
                          ))}
                          <TableRow className="border-t-2 border-primary/30">
                            <TableCell colSpan={3} className="font-display font-bold">Total</TableCell>
                            <TableCell className="text-right font-display text-lg text-primary">{payoutPreview.total}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                      <div className="flex gap-2">
                        <Button onClick={executePayout} disabled={payoutLoading} className="gap-2">
                          {payoutLoading ? <Loader2 size={14} className="animate-spin" /> : <DollarSign size={14} />}
                          Send to Stripe
                        </Button>
                        <Button variant="outline" onClick={() => setPayoutPreview(null)}>Cancel</Button>
                      </div>
                    </motion.div>
                  )}

                  {payoutResult && (
                    <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                      <div className="flex items-center gap-2 text-primary">
                        <Check size={16} />
                        <span className="font-medium text-sm">Payout of {payoutResult.total} sent to Stripe</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Invoice: {payoutResult.stripe_invoice_id} · {payoutResult.count} commissions
                      </p>
                      {payoutResult.stripe_invoice_url && (
                        <a href={payoutResult.stripe_invoice_url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline">
                          <ExternalLink size={12} /> View Stripe Invoice
                        </a>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => setPayoutResult(null)}>Dismiss</Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* Payment Reminders */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-display flex items-center gap-2">
                  <Bell size={16} className="text-primary" />
                  Customer Payment Reminders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-3">
                  Send email and in-app reminders to follow up on outstanding payments for pending commissions.
                </p>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={sendReminders}
                      disabled={reminderLoading || commissions.filter(c => (c.status === "pending" || c.status === "expected") && !remindersSent.includes(c.id)).length === 0}
                      variant="outline"
                      className="gap-2"
                    >
                      {reminderLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                      Send Reminders
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      {commissions.filter(c => (c.status === "pending" || c.status === "expected") && !remindersSent.includes(c.id)).length} pending
                      {remindersSent.length > 0 && ` · ${remindersSent.length} sent this session`}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={bulkResendReminders}
                      disabled={bulkResendLoading || eligibleResendInvoices.length === 0}
                      variant="outline"
                      className="gap-2"
                    >
                      {bulkResendLoading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                      Resend All Payment Links
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      {eligibleResendInvoices.length} invoice{eligibleResendInvoices.length !== 1 ? "s" : ""} with payment links
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Links Directory */}
            {invoicesWithLinks.length > 0 && (
              <Card className="border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-display flex items-center gap-2">
                      <Link size={16} className="text-primary" />
                      Payment Links Directory
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs"
                      onClick={() => {
                        const text = invoicesWithLinks
                          .map(i => `${i.recipient_name || i.invoice_number}: ${(i.metadata as any)?.checkout_url}`)
                          .join("\n");
                        navigator.clipboard.writeText(text);
                        toast.success(`${invoicesWithLinks.length} payment link(s) copied`);
                      }}
                    >
                      <Copy size={12} /> Copy All Links
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {invoicesWithLinks.map(inv => {
                    const url = (inv.metadata as any)?.checkout_url as string;
                    return (
                      <div key={inv.id} className="flex items-center justify-between gap-2 rounded-md border border-border p-2 text-xs">
                        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                          <span className="font-medium truncate">{inv.recipient_name || inv.invoice_number}</span>
                          <span className="text-muted-foreground">
                            {inv.recipient_email || "No email"} · £{(inv.amount_cents / 100).toLocaleString()}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 shrink-0 text-xs"
                          onClick={() => {
                            navigator.clipboard.writeText(url);
                            toast.success(`Link copied for ${inv.recipient_name || inv.invoice_number}`);
                          }}
                        >
                          <Copy size={12} /> Copy
                        </Button>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Collect Payment */}
            {commissions.filter(c => c.status === "pending" || c.status === "expected").length > 0 && (
              <Card className="border-emerald-500/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-display flex items-center gap-2">
                    <CreditCard size={16} className="text-emerald-500" />
                    Collect Payment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Generate a Stripe Checkout link for pending deals. Share with the customer or open to complete payment.
                  </p>
                  {(() => {
                    const pendingByDeal = commissions
                      .filter(c => c.status === "pending" || c.status === "expected")
                      .reduce((acc, c) => {
                        if (!acc[c.deal_id]) {
                          const inv = invoices.find(i => i.deal_id === c.deal_id);
                          acc[c.deal_id] = {
                            totalCents: 0,
                            category: c.category,
                            vendor: c.vendor_name,
                            recipientEmail: inv?.recipient_email || null,
                            recipientName: inv?.recipient_name || null,
                            recipientAddress: (inv as any)?.recipient_address || null,
                            invoiceId: inv?.id || null,
                          };
                        }
                        acc[c.deal_id].totalCents += c.commission_cents;
                        return acc;
                      }, {} as Record<string, { totalCents: number; category: string; vendor: string | null; recipientEmail: string | null; recipientName: string | null; recipientAddress: string | null; invoiceId: string | null }>);

                    const saveContact = async (dealId: string, invoiceId: string | null) => {
                      const edit = editingContact[dealId];
                      if (!edit) return;
                      setSavingContact(dealId);
                      try {
                        if (invoiceId) {
                          const { error } = await supabase
                            .from("invoices")
                            .update({
                              recipient_email: edit.email || null,
                              recipient_address: edit.address || null,
                            } as any)
                            .eq("id", invoiceId);
                          if (error) throw error;
                        }
                        toast.success("Contact details saved");
                        fetchData();
                        setEditingContact(prev => {
                          const next = { ...prev };
                          delete next[dealId];
                          return next;
                        });
                      } catch (err: any) {
                        toast.error(err.message || "Failed to save");
                      } finally {
                        setSavingContact(null);
                      }
                    };

                    return (
                      <div className="space-y-3">
                        {Object.entries(pendingByDeal).map(([dealId, info]) => {
                          const isEditing = !!editingContact[dealId];
                          const editValues = editingContact[dealId] || { email: info.recipientEmail || "", address: info.recipientAddress || "" };

                          return (
                            <div key={dealId} className="flex flex-col gap-2 p-3 rounded-lg border border-border bg-card">
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-foreground capitalize">{info.category} — {info.vendor || "Vendor"}</p>
                                  <p className="text-[10px] text-muted-foreground">Deal {dealId.slice(0, 8).toUpperCase()}</p>
                                </div>
                                <p className="text-sm font-bold text-foreground ml-3">£{(info.totalCents / 100).toLocaleString()}</p>
                              </div>

                              {/* Contact details - display or edit */}
                              {!isEditing ? (
                                <div
                                  className="space-y-0.5 cursor-pointer rounded p-1.5 -mx-1.5 hover:bg-muted/50 transition-colors"
                                  onClick={() => setEditingContact(prev => ({
                                    ...prev,
                                    [dealId]: { email: info.recipientEmail || "", address: info.recipientAddress || "" },
                                  }))}
                                >
                                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <Mail size={10} />
                                    {info.recipientEmail ? (
                                      <span>{info.recipientName ? `${info.recipientName} — ` : ""}{info.recipientEmail}</span>
                                    ) : (
                                      <span className="italic">Click to add email</span>
                                    )}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <MapPin size={10} />
                                    {info.recipientAddress || <span className="italic">Click to add address</span>}
                                  </p>
                                </div>
                              ) : (
                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-1.5">
                                    <Mail size={10} className="text-muted-foreground shrink-0" />
                                    <input
                                      type="email"
                                      value={editValues.email}
                                      onChange={e => setEditingContact(prev => ({ ...prev, [dealId]: { ...editValues, email: e.target.value } }))}
                                      placeholder="customer@example.com"
                                      className="flex-1 text-xs px-2 py-1 rounded border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <MapPin size={10} className="text-muted-foreground shrink-0" />
                                    <input
                                      type="text"
                                      value={editValues.address}
                                      onChange={e => setEditingContact(prev => ({ ...prev, [dealId]: { ...editValues, address: e.target.value } }))}
                                      placeholder="123 Main St, London, UK"
                                      className="flex-1 text-xs px-2 py-1 rounded border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="gap-1 text-xs h-7"
                                      disabled={savingContact === dealId}
                                      onClick={() => saveContact(dealId, info.invoiceId)}
                                    >
                                      {savingContact === dealId ? <Loader2 size={10} className="animate-spin" /> : <Save size={10} />}
                                      Save
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-xs h-7"
                                      onClick={() => setEditingContact(prev => {
                                        const next = { ...prev };
                                        delete next[dealId];
                                        return next;
                                      })}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              )}

                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={async () => {
                                    setCollectingDealId(dealId);
                                    try {
                                      const { data, error } = await supabase.functions.invoke("invoice-checkout", {
                                        body: { dealId },
                                      });
                                      if (error) throw error;
                                      if (data?.error) throw new Error(data.error);
                                      if (data?.split && data?.urls) {
                                        await navigator.clipboard.writeText(data.urls.join("\n"));
                                        toast.success(`${data.urls.length} split payment links copied!`);
                                      } else if (data?.url) {
                                        await navigator.clipboard.writeText(data.url);
                                        toast.success("Payment link copied to clipboard!");
                                      }
                                    } catch (err: any) {
                                      toast.error(err.message || "Failed to create payment link");
                                    } finally {
                                      setCollectingDealId(null);
                                    }
                                  }}
                                  disabled={collectingDealId === dealId}
                                  className="gap-1.5 text-xs"
                                >
                                  {collectingDealId === dealId ? <Loader2 size={12} className="animate-spin" /> : <Copy size={12} />}
                                  Copy Link
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={async () => {
                                    setSendingDealId(dealId);
                                    try {
                                      const { data, error } = await supabase.functions.invoke("invoice-checkout", {
                                        body: { dealId },
                                      });
                                      if (error) throw error;
                                      if (data?.error) throw new Error(data.error);
                                      const paymentUrl = data?.split ? data.urls.join("\n") : data?.url;
                                      if (paymentUrl) {
                                        const email = info.recipientEmail;
                                        if (!email) {
                                          toast.error("No customer email on file — add one above first.");
                                          return;
                                        }
                                        await supabase.functions.invoke("send-transactional-email", {
                                          body: {
                                            templateName: "payment-reminder",
                                            recipientEmail: email,
                                            idempotencyKey: `payment-link-${dealId}-${Date.now()}`,
                                            templateData: {
                                              name: info.recipientName || "Customer",
                                              amount: `£${(info.totalCents / 100).toLocaleString()}`,
                                              category: info.category,
                                              paymentUrl,
                                              splitPayment: data?.split || false,
                                              partCount: data?.parts?.length || 1,
                                            },
                                          },
                                        });
                                        toast.success(`Payment link emailed to ${email}`);
                                      }
                                    } catch (err: any) {
                                      toast.error(err.message || "Failed to send payment email");
                                    } finally {
                                      setSendingDealId(null);
                                    }
                                  }}
                                  disabled={sendingDealId === dealId || !info.recipientEmail}
                                  className="gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground"
                                >
                                  {sendingDealId === dealId ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                                  Email Link {info.recipientEmail ? "" : "(no email)"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={async () => {
                                    setQrLoading(dealId);
                                    try {
                                      const { data, error } = await supabase.functions.invoke("invoice-checkout", {
                                        body: { dealId },
                                      });
                                      if (error) throw error;
                                      if (data?.error) throw new Error(data.error);
                                      const url = data?.split ? data.urls[0] : data?.url;
                                      if (url) {
                                        setQrUrl(url);
                                        setQrDealId(dealId);
                                      }
                                    } catch (err: any) {
                                      toast.error(err.message || "Failed to generate QR code");
                                    } finally {
                                      setQrLoading(null);
                                    }
                                  }}
                                  disabled={qrLoading === dealId}
                                  className="gap-1.5 text-xs"
                                >
                                  {qrLoading === dealId ? <Loader2 size={12} className="animate-spin" /> : <QrCode size={12} />}
                                  QR Code
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            )}

            {/* Public Payment Portal Link */}
            <Card className="border-border">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Public Payment Portal</p>
                  <p className="text-xs text-muted-foreground">Share this link with vendors — they can pay by entering their invoice number.</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs shrink-0"
                  onClick={() => {
                    const url = `${window.location.origin}/pay`;
                    navigator.clipboard.writeText(url);
                    toast.success("Payment portal link copied!");
                  }}
                >
                  <Copy size={12} /> Copy Portal Link
                </Button>
              </CardContent>
            </Card>

            {/* QR Code Modal */}
            <AnimatePresence>
              {qrDealId && qrUrl && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
                  onClick={() => { setQrDealId(null); setQrUrl(null); }}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-card border border-border rounded-xl p-6 max-w-sm w-full space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-sm font-bold text-foreground">Payment QR Code</h3>
                      <button onClick={() => { setQrDealId(null); setQrUrl(null); }} className="text-muted-foreground hover:text-foreground">
                        <X size={16} />
                      </button>
                    </div>
                    <div className="flex justify-center p-4 bg-white rounded-lg">
                      <QRCodeSVG value={qrUrl} size={200} level="H" />
                    </div>
                    <p className="text-[10px] text-muted-foreground text-center break-all">{qrUrl}</p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 gap-1.5 text-xs"
                        onClick={() => {
                          navigator.clipboard.writeText(qrUrl);
                          toast.success("Link copied!");
                        }}
                      >
                        <Copy size={12} /> Copy Link
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 gap-1.5 text-xs"
                        onClick={() => window.open(qrUrl, "_blank")}
                      >
                        <ExternalLink size={12} /> Open
                      </Button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by category, vendor, or deal ID…"
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[140px]"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(c => (
                    <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={fetchData} title="Refresh">
                <RefreshCw size={14} />
              </Button>
            </div>

            {/* Commission History Table */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-primary" size={24} />
              </div>
            ) : filtered.length === 0 ? (
              <Card className="border-border">
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground text-sm">No commission records found.</p>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("created_at")}>
                          <span className="flex items-center gap-1">Date <ArrowUpDown size={12} /></span>
                        </TableHead>
                        <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("category")}>
                          <span className="flex items-center gap-1">Category <ArrowUpDown size={12} /></span>
                        </TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead className="text-right">Deal Value</TableHead>
                        <TableHead className="text-right">Rate</TableHead>
                        <TableHead className="text-right cursor-pointer select-none" onClick={() => toggleSort("commission_cents")}>
                          <span className="flex items-center gap-1 justify-end">Commission <ArrowUpDown size={12} /></span>
                        </TableHead>
                        <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("status")}>
                          <span className="flex items-center gap-1">Status <ArrowUpDown size={12} /></span>
                        </TableHead>
                        <TableHead>Invoice</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((c) => {
                        const invoiceUrl = getInvoiceUrl(c.invoice_id);
                        return (
                          <TableRow key={c.id}>
                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                              <span className="flex items-center gap-1"><Calendar size={12} /> {fmtDate(c.created_at)}</span>
                            </TableCell>
                            <TableCell className="capitalize text-foreground">{c.category}</TableCell>
                            <TableCell className="text-muted-foreground text-sm">{c.vendor_name || "—"}</TableCell>
                            <TableCell className="text-right text-foreground">
                              {c.deal_value_cents ? fmt(c.deal_value_cents) : "—"}
                            </TableCell>
                            <TableCell className="text-right text-foreground">
                              {c.commission_rate ? `${(c.commission_rate * 100).toFixed(1)}%` : "—"}
                            </TableCell>
                            <TableCell className="text-right font-medium text-primary">
                              {fmt(c.commission_cents)}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={`text-xs ${statusColor(c.status)}`}>
                                {c.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {invoiceUrl ? (
                                <a href={invoiceUrl} target="_blank" rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                                  <ExternalLink size={12} /> View
                                </a>
                              ) : c.invoice_id ? (
                                <span className="text-xs text-muted-foreground">Linked</span>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            )}

            {/* Stripe Invoices History */}
            {invoices.length > 0 && (
              <Card className="border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-display flex items-center gap-2">
                    <ExternalLink size={14} className="text-primary" />
                    Stripe Invoice History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Invoice #</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Link</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoices.map((inv) => (
                          <TableRow key={inv.id}>
                            <TableCell className="font-mono text-xs">{inv.invoice_number}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{fmtDate(inv.created_at)}</TableCell>
                            <TableCell className="text-right font-medium text-primary">{fmt(inv.amount_cents)}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={`text-xs ${
                                inv.status === "paid" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                inv.status === "sent" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                "bg-muted text-muted-foreground border-border"
                              }`}>
                                {inv.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {inv.metadata?.stripe_invoice_url ? (
                                <a href={inv.metadata.stripe_invoice_url} target="_blank" rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                                  <ExternalLink size={12} /> Open in Stripe
                                </a>
                              ) : "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CommissionPayouts;
