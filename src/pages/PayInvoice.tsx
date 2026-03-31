import { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, Search, Loader2, ExternalLink, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import useDocumentHead from "@/hooks/use-document-head";

const PayInvoice = () => {
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invoiceInfo, setInvoiceInfo] = useState<{
    invoice_number: string;
    amount_cents: number;
    currency: string;
    status: string;
    recipient_name: string | null;
  } | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useDocumentHead({
    title: "Pay Invoice — QUANTUS",
    description: "Enter your invoice number to complete payment securely via Stripe.",
  });

  const lookupInvoice = async () => {
    if (!invoiceNumber.trim()) return;
    setLoading(true);
    setError(null);
    setInvoiceInfo(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("invoice-checkout", {
        body: { invoiceNumber: invoiceNumber.trim().toUpperCase() },
      });

      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);

      if (data?.invoice) {
        setInvoiceInfo(data.invoice);
      } else if (data?.url) {
        // Direct redirect
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      setError(err.message || "Invoice not found. Please check the number and try again.");
    } finally {
      setLoading(false);
    }
  };

  const proceedToPayment = async () => {
    setCheckoutLoading(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("invoice-checkout", {
        body: { invoiceNumber: invoiceNumber.trim().toUpperCase(), action: "checkout" },
      });

      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);

      if (data?.split && data?.urls) {
        // Open first split link
        window.open(data.urls[0], "_blank");
      } else if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create checkout session");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const fmtAmount = (cents: number, currency: string) => {
    const symbol = currency === "GBP" ? "£" : currency === "EUR" ? "€" : "$";
    return `${symbol}${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
            <CreditCard className="text-primary" size={24} />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Pay Invoice</h1>
          <p className="text-sm text-muted-foreground">
            Enter your invoice number (e.g. QAI-INV-E26E11F2) to view and pay securely via Stripe.
          </p>
        </div>

        <Card className="border-border">
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Invoice Number</label>
              <div className="flex gap-2">
                <Input
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value.toUpperCase())}
                  placeholder="QAI-INV-XXXXXXXX"
                  className="font-mono text-sm"
                  onKeyDown={(e) => e.key === "Enter" && lookupInvoice()}
                />
                <Button onClick={lookupInvoice} disabled={loading || !invoiceNumber.trim()} className="gap-2 shrink-0">
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                  Look Up
                </Button>
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertCircle size={14} className="text-destructive mt-0.5 shrink-0" />
                <p className="text-xs text-destructive">{error}</p>
              </motion.div>
            )}

            {invoiceInfo && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="p-4 rounded-lg border border-border bg-card space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Invoice</span>
                    <span className="text-sm font-mono text-foreground">{invoiceInfo.invoice_number}</span>
                  </div>
                  {invoiceInfo.recipient_name && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Customer</span>
                      <span className="text-sm text-foreground">{invoiceInfo.recipient_name}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Amount Due</span>
                    <span className="text-lg font-display font-bold text-primary">
                      {fmtAmount(invoiceInfo.amount_cents, invoiceInfo.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Status</span>
                    {invoiceInfo.status === "paid" ? (
                      <span className="flex items-center gap-1 text-xs text-green-400">
                        <CheckCircle2 size={12} /> Paid
                      </span>
                    ) : (
                      <span className="text-xs text-amber-400">Unpaid</span>
                    )}
                  </div>
                </div>

                {invoiceInfo.status !== "paid" && (
                  <Button onClick={proceedToPayment} disabled={checkoutLoading} className="w-full gap-2">
                    {checkoutLoading ? <Loader2 size={14} className="animate-spin" /> : <ExternalLink size={14} />}
                    Pay Now via Stripe
                  </Button>
                )}

                {invoiceInfo.status === "paid" && (
                  <p className="text-center text-xs text-green-400">This invoice has already been paid. Thank you!</p>
                )}
              </motion.div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-[10px] text-muted-foreground mt-6">
          Payments processed securely by Stripe. Your payment details are never stored on our servers.
        </p>
      </motion.div>
    </div>
  );
};

export default PayInvoice;
