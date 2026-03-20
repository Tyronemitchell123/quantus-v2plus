import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, ArrowDownRight, Gift, Zap, Sparkles, Crown, Users, Loader2, Check } from "lucide-react";
import { SubscriptionTier, useSubscription } from "@/hooks/use-subscription";
import { useToast } from "@/hooks/use-toast";

const PLANS: {
  key: SubscriptionTier;
  name: string;
  price: number;
  icon: React.ElementType;
  features: string[];
}[] = [
  {
    key: "free",
    name: "Free",
    price: 0,
    icon: Gift,
    features: ["100 AI queries/mo", "10 quantum sim jobs", "1 integration"],
  },
  {
    key: "starter",
    name: "Starter",
    price: 29,
    icon: Zap,
    features: ["5,000 AI queries/mo", "50 quantum jobs", "2 integrations"],
  },
  {
    key: "professional",
    name: "Professional",
    price: 149,
    icon: Sparkles,
    features: ["Unlimited queries", "Unlimited quantum jobs", "25 integrations"],
  },
  {
    key: "teams",
    name: "Teams",
    price: 49,
    icon: Users,
    features: ["Everything in Pro", "Per-user billing", "Shared dashboards"],
  },
  {
    key: "enterprise",
    name: "Enterprise",
    price: 0,
    icon: Crown,
    features: ["Custom limits", "Dedicated support", "SLA guarantee"],
  },
];

const TIER_ORDER: SubscriptionTier[] = ["free", "starter", "professional", "enterprise"];

interface Props {
  currentTier: SubscriptionTier;
  isActive: boolean;
}

const PlanSwitcher = ({ currentTier, isActive }: Props) => {
  const [switching, setSwitching] = useState<string | null>(null);
  const { createPayment, refresh } = useSubscription();
  const { toast } = useToast();
  const navigate = useNavigate();

  const currentIdx = TIER_ORDER.indexOf(currentTier);

  const handleSwitch = async (targetTier: SubscriptionTier) => {
    if (targetTier === "enterprise") {
      navigate("/contact");
      return;
    }

    setSwitching(targetTier);
    try {
      const result = await createPayment(targetTier, "monthly");
      if (result.demo) {
        toast({
          title: "Plan updated!",
          description: `You're now on the ${targetTier} plan.`,
        });
        await refresh();
      } else if (result.hosted_payment_page) {
        window.location.href = result.hosted_payment_page;
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSwitching(null);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-6 md:p-8">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-6">
        Change Plan
      </h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLANS.map((plan) => {
          const planIdx = TIER_ORDER.indexOf(plan.key);
          const isCurrent = plan.key === currentTier && isActive;
          const isUpgrade = planIdx > currentIdx;
          const isDowngrade = planIdx < currentIdx;
          const PlanIcon = plan.icon;

          return (
            <div
              key={plan.key}
              className={`relative rounded-xl border p-5 flex flex-col transition-all duration-200 ${
                isCurrent
                  ? "border-primary/40 bg-primary/[0.04]"
                  : "border-border/60 hover:border-border"
              }`}
            >
              {isCurrent && (
                <div className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold uppercase tracking-wider">
                  Current
                </div>
              )}

              <PlanIcon
                size={20}
                className={isCurrent ? "text-primary" : "text-muted-foreground"}
              />
              <h3 className="font-display text-base font-semibold text-foreground mt-3 mb-1">
                {plan.name}
              </h3>
              <p className="font-display text-xl font-bold text-foreground tabular-nums mb-3">
                {plan.price === 0 && plan.key === "free"
                  ? "Free"
                  : plan.key === "enterprise"
                  ? "Custom"
                  : `$${plan.price}/mo`}
              </p>

              <ul className="space-y-1.5 mb-5 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-foreground/70">
                    <Check size={12} className="text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <div className="text-center text-xs text-muted-foreground py-2">Active</div>
              ) : (
                <button
                  onClick={() => handleSwitch(plan.key)}
                  disabled={switching !== null}
                  className={`w-full py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 ${
                    isUpgrade
                      ? "bg-primary text-primary-foreground hover:opacity-90"
                      : "border border-border text-foreground hover:border-primary/40"
                  }`}
                >
                  {switching === plan.key ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <>
                      {isUpgrade && <ArrowUpRight size={13} />}
                      {isDowngrade && <ArrowDownRight size={13} />}
                      {plan.key === "enterprise"
                        ? "Contact Sales"
                        : isUpgrade
                        ? "Upgrade"
                        : "Downgrade"}
                    </>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlanSwitcher;
