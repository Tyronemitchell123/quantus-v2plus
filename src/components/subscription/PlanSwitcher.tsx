import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, ArrowDownRight, Gift, Zap, Sparkles, Crown, Users, Loader2, Check } from "lucide-react";
import { SubscriptionTier, useSubscription } from "@/hooks/use-subscription";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const PLANS: {
  key: SubscriptionTier;
  name: string;
  monthly: number;
  annual: number;
  icon: React.ElementType;
  features: string[];
  perUser?: boolean;
}[] = [
  {
    key: "free",
    name: "Free",
    monthly: 0,
    annual: 0,
    icon: Gift,
    features: ["100 AI queries/mo", "10 quantum sim jobs", "1 integration"],
  },
  {
    key: "starter",
    name: "Starter",
    monthly: 29,
    annual: 23,
    icon: Zap,
    features: ["5,000 AI queries/mo", "50 quantum jobs", "2 integrations"],
  },
  {
    key: "professional",
    name: "Professional",
    monthly: 149,
    annual: 119,
    icon: Sparkles,
    features: ["Unlimited queries", "Unlimited quantum jobs", "25 integrations"],
  },
  {
    key: "teams",
    name: "Teams",
    monthly: 49,
    annual: 39,
    perUser: true,
    icon: Users,
    features: ["Everything in Pro", "Per-user billing", "Shared dashboards"],
  },
  {
    key: "enterprise",
    name: "Enterprise",
    monthly: 0,
    annual: 0,
    icon: Crown,
    features: ["Custom limits", "Dedicated support", "SLA guarantee"],
  },
];

const TIER_ORDER: SubscriptionTier[] = ["free", "starter", "professional", "teams", "enterprise"];

interface Props {
  currentTier: SubscriptionTier;
  isActive: boolean;
}

const PlanSwitcher = ({ currentTier, isActive }: Props) => {
  const [switching, setSwitching] = useState<string | null>(null);
  const [annual, setAnnual] = useState(false);
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
      await createPayment(targetTier, annual ? "annual" : "monthly");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSwitching(null);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Change Plan
        </h2>

        {/* Billing toggle */}
        <div className="flex items-center gap-3">
          <span className={`text-xs font-medium transition-colors ${!annual ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
          <button
            onClick={() => setAnnual((v) => !v)}
            className="relative w-11 h-6 rounded-full bg-secondary border border-border transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30"
            aria-label="Toggle annual billing"
          >
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute top-0.5 w-5 h-5 rounded-full bg-primary shadow-lg shadow-primary/30"
              style={{ left: annual ? "calc(100% - 1.375rem)" : "0.125rem" }}
            />
          </button>
          <span className={`text-xs font-medium transition-colors ${annual ? "text-foreground" : "text-muted-foreground"}`}>Annual</span>
          {annual && (
            <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              Save 20%
            </span>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {PLANS.map((plan) => {
          const planIdx = TIER_ORDER.indexOf(plan.key);
          const isCurrent = plan.key === currentTier && isActive;
          const isUpgrade = planIdx > currentIdx;
          const isDowngrade = planIdx < currentIdx;
          const PlanIcon = plan.icon;
          const price = annual ? plan.annual : plan.monthly;

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
                {price === 0 && plan.key === "free"
                  ? "Free"
                  : plan.key === "enterprise"
                  ? "Custom"
                  : plan.perUser
                  ? `$${price}/user/mo`
                  : `$${price}/mo`}
              </p>
              {annual && price > 0 && plan.key !== "enterprise" && (
                <p className="text-[10px] text-muted-foreground -mt-2 mb-3">
                  Billed ${price * 12}/year
                </p>
              )}

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
