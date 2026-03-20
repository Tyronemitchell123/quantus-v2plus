import { useState } from "react";
import { format } from "date-fns";
import {
  Gift,
  Zap,
  Sparkles,
  Crown,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Loader2,
} from "lucide-react";
import { Subscription, SubscriptionTier } from "@/hooks/use-subscription";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const TIER_META: Record<
  SubscriptionTier,
  { label: string; icon: React.ElementType; color: string; price: string }
> = {
  free: { label: "Free", icon: Gift, color: "text-muted-foreground", price: "$0" },
  starter: { label: "Starter", icon: Zap, color: "text-blue-400", price: "$29" },
  professional: { label: "Professional", icon: Sparkles, color: "text-primary", price: "$149" },
  teams: { label: "Teams", icon: Users, color: "text-quantum-cyan", price: "$49/user" },
  enterprise: { label: "Enterprise", icon: Crown, color: "text-amber-400", price: "Custom" },
};

const STATUS_META: Record<string, { icon: React.ElementType; label: string; class: string }> = {
  active: { icon: CheckCircle2, label: "Active", class: "text-emerald-400" },
  trialing: { icon: Clock, label: "Trial", class: "text-blue-400" },
  past_due: { icon: AlertTriangle, label: "Past Due", class: "text-amber-400" },
  canceled: { icon: XCircle, label: "Canceled", class: "text-destructive" },
  inactive: { icon: XCircle, label: "Inactive", class: "text-muted-foreground" },
};

interface Props {
  subscription: Subscription | null;
  isActive: boolean;
  tier: SubscriptionTier;
  onRefresh: () => void;
}

const CurrentPlanCard = ({ subscription, isActive, tier, onRefresh }: Props) => {
  const [canceling, setCanceling] = useState(false);
  const { toast } = useToast();

  const meta = TIER_META[tier];
  const Icon = meta.icon;
  const status = subscription?.status ?? "inactive";
  const sMeta = STATUS_META[status] ?? STATUS_META.inactive;
  const StatusIcon = sMeta.icon;

  const callManage = async (action: "cancel" | "reactivate") => {
    if (!subscription) return;
    setCanceling(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/manage-subscription`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ action }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");

      toast({
        title: action === "cancel" ? "Subscription will cancel" : "Subscription reactivated",
        description: action === "cancel"
          ? "Your plan stays active until the end of the current billing period."
          : "Your plan will continue as normal.",
      });
      onRefresh();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setCanceling(false);
    }
  };

  const handleCancel = () => callManage("cancel");
  const handleReactivate = () => callManage("reactivate");

  return (
    <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-6 md:p-8">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-6">
        Current Plan
      </h2>

      <div className="flex flex-col sm:flex-row sm:items-center gap-6">
        {/* Plan info */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className={`p-3 rounded-xl bg-secondary/60 ${meta.color}`}>
            <Icon size={28} />
          </div>
          <div>
            <h3 className="font-display text-2xl font-bold text-foreground">{meta.label}</h3>
            <div className="flex items-center gap-2 mt-1">
              <StatusIcon size={14} className={sMeta.class} />
              <span className={`text-sm font-medium ${sMeta.class}`}>{sMeta.label}</span>
              {subscription?.billing_cycle && tier !== "free" && (
                <span className="text-xs text-muted-foreground">
                  · {subscription.billing_cycle}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Price */}
        <div className="text-right">
          <p className="font-display text-3xl font-bold text-foreground tabular-nums">
            {meta.price}
          </p>
          {tier !== "free" && tier !== "enterprise" && (
            <p className="text-xs text-muted-foreground">/month</p>
          )}
        </div>
      </div>

      {/* Period info */}
      {subscription?.current_period_end && (
        <div className="mt-6 pt-6 border-t border-border/50 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 space-y-1">
            {subscription.current_period_start && (
              <p className="text-sm text-muted-foreground">
                Period:{" "}
                <span className="text-foreground/80 tabular-nums">
                  {format(new Date(subscription.current_period_start), "MMM d, yyyy")}
                </span>
                {" — "}
                <span className="text-foreground/80 tabular-nums">
                  {format(new Date(subscription.current_period_end), "MMM d, yyyy")}
                </span>
              </p>
            )}
            {subscription.cancel_at_period_end && (
              <p className="text-sm text-amber-400 flex items-center gap-1.5">
                <AlertTriangle size={13} />
                Cancels at end of period
              </p>
            )}
          </div>

          {/* Cancel / Reactivate */}
          {tier !== "free" && tier !== "enterprise" && (
            <div>
              {subscription.cancel_at_period_end ? (
                <button
                  onClick={handleReactivate}
                  disabled={canceling}
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {canceling && <Loader2 size={14} className="animate-spin" />}
                  Reactivate
                </button>
              ) : (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="text-sm font-medium text-destructive hover:text-destructive/80 transition-colors">
                      Cancel Plan
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel subscription?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Your {meta.label} plan will remain active until the end of the current
                        billing period. After that, you'll be moved to the Free tier.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Plan</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleCancel}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {canceling ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          "Confirm Cancellation"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CurrentPlanCard;
