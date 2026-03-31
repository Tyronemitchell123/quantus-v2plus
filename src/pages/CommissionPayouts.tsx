import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, Filter, Search, ExternalLink, Loader2, Check, ArrowUpDown, Calendar, Download, RefreshCw, Bell, Mail, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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

  useDocumentHead({
    title: "Commission Payouts — QUANTUS V2+",
    description: "View your full commission history, filter by status, and manage Stripe payouts.",
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setLoading(false); return; }

    const [commRes, invRes] = await Promise.all([
      supabase
        .from("commission_logs")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("invoices")
        .select("id, invoice_number, amount_cents, status, metadata, created_at")
        .eq("user_id", session.user.id)
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
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

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
        // Send email reminder
        const { error: emailError } = await supabase.functions.invoke("send-transactional-email", {
          body: {
            templateName: "payment-reminder",
            recipientEmail: session.user.email,
            idempotencyKey: `payment-reminder-${commission.id}-${new Date().toISOString().slice(0, 10)}`,
            templateData: {
              customerName: commission.vendor_name || "Customer",
              dealCategory: commission.category,
              dealNumber: commission.deal_id.slice(0, 8).toUpperCase(),
              amountDue: `$${(commission.commission_cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0 })}`,
            },
          },
        });

        // Create in-app notification
        await supabase.from("notifications").insert({
          user_id: session.user.id,
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
              </CardContent>
            </Card>

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
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="expected">Expected</SelectItem>
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
