import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Receipt, Loader2, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Payment {
  id: string;
  amount_cents: number;
  currency: string;
  status: string;
  created_at: string;
  metadata: any;
}

const STATUS_STYLES: Record<string, string> = {
  settled: "bg-emerald-500/10 text-emerald-400",
  executed: "bg-emerald-500/10 text-emerald-400",
  authorized: "bg-blue-500/10 text-blue-400",
  pending: "bg-amber-500/10 text-amber-400",
  failed: "bg-destructive/10 text-destructive",
  canceled: "bg-muted text-muted-foreground",
};

const BillingHistory = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("payments")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      setPayments((data as Payment[]) ?? []);
      setLoading(false);
    };
    fetch();
  }, []);

  const formatAmount = (cents: number, currency: string) => {
    const amount = cents / 100;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Billing History
        </h2>
        <Receipt size={16} className="text-muted-foreground" />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={20} className="animate-spin text-muted-foreground" />
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-12">
          <Receipt size={32} className="mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">No payments yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Payments will appear here once you subscribe to a paid plan.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-6 md:-mx-8">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-6 md:px-8 pb-3">
                  Date
                </th>
                <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground pb-3">
                  Amount
                </th>
                <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground pb-3">
                  Status
                </th>
                <th className="text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-6 md:px-8 pb-3">
                  ID
                </th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-border/30 last:border-0 hover:bg-secondary/20 transition-colors"
                >
                  <td className="px-6 md:px-8 py-3.5 text-sm text-foreground/80 tabular-nums">
                    {format(new Date(p.created_at), "MMM d, yyyy")}
                  </td>
                  <td className="py-3.5 text-sm font-semibold text-foreground tabular-nums">
                    {formatAmount(p.amount_cents, p.currency)}
                  </td>
                  <td className="py-3.5">
                    <span
                      className={`inline-block text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        STATUS_STYLES[p.status] ?? STATUS_STYLES.pending
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 md:px-8 py-3.5 text-right text-xs text-muted-foreground font-mono">
                    {p.id.slice(0, 8)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BillingHistory;
