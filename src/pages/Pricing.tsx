import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Check, ArrowRight, Sparkles, Zap, Crown, Loader2, Gift } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { useToast } from "@/hooks/use-toast";
import PricingFAQ from "@/components/PricingFAQ";
import ComparisonTable from "@/components/ComparisonTable";
import CompetitorComparison from "@/components/CompetitorComparison";
import UsagePricing from "@/components/UsagePricing";
import CurrencyConverter, { useCurrency } from "@/components/CurrencyConverter";
import useDocumentHead from "@/hooks/use-document-head";
import HeroVideoBackground from "@/components/HeroVideoBackground";
import PlatformBillingBanner from "@/components/PlatformBillingBanner";
import { useMobilePricing } from "@/hooks/use-mobile-pricing";

const tiers = [
  {
    name: "Free",
    key: "free" as const,
    monthly: 0,
    annual: 0,
    description: "Experience quantum AI with zero commitment.",
    icon: Gift,
    features: [
      "100 AI queries/month",
      "Basic analytics dashboard",
      "AI concierge (limited)",
      "10 quantum simulator jobs/month",
      "1 API integration",
      "Community support",
    ],
    cta: "Start Free",
    highlight: false,
  },
  {
    name: "Starter",
    key: "starter" as const,
    monthly: 29,
    annual: 23,
    description: "For individuals and small teams getting started with AI.",
    icon: Zap,
    features: [
      "14-day free trial — no card required",
      "Up to 5,000 AI queries/month",
      "Predictive analytics dashboard",
      "AI concierge access",
      "50 quantum jobs/month (sim + QPU)",
      "2 API integrations",
      "Standard API access",
      "Weekly performance reports",
    ],
    cta: "Start 14-Day Trial",
    highlight: false,
    trial: true,
  },
  {
    name: "Professional",
    key: "professional" as const,
    monthly: 99,
    annual: 79,
    description: "For teams demanding advanced intelligence and scale.",
    icon: Sparkles,
    features: [
      "Unlimited AI queries",
      "Advanced predictive analytics",
      "Anomaly detection alerts",
      "Unlimited quantum jobs (all devices)",
      "25 API integrations",
      "Full API + Webhooks",
      "Data export (CSV, JSON, PDF)",
      "API key management",
      "Priority AI concierge access",
    ],
    cta: "Start Free Trial",
    highlight: true,
  },
  {
    name: "Enterprise",
    key: "enterprise" as const,
    monthly: 0,
    annual: 0,
    description: "Bespoke AI solutions for global-scale operations.",
    icon: Crown,
    features: [
      "Everything in Professional",
      "Unlimited API integrations",
      "Custom SLA & uptime guarantee",
      "Webhook management",
      "Advanced anomaly detection",
      "Dedicated AI concierge",
      "Custom reporting & analytics",
      "Priority support & onboarding",
    ],
    cta: "Request Demo",
    highlight: false,
  },
];




const Pricing = () => {
  const [annual, setAnnual] = useState(false);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const { currency, setCurrency, currencies, formatPrice } = useCurrency();
  const { user } = useAuth();
  const { subscription, createPayment, isActive, tier: currentTier } = useSubscription();
  const { getPrice, isStoreBilling } = useMobilePricing(tiers, annual);
  const navigate = useNavigate();
  useDocumentHead({
    title: "Pricing — Free to Enterprise | QUANTUS AI",
    description: "Start free with 100 AI queries/mo. Scale to Starter ($29/mo), Professional ($99/mo), or Enterprise custom. Every plan includes our quantum AI engine.",
    canonical: "https://quantus-loom.lovable.app/pricing",
  });

  const { toast } = useToast();

  const handlePurchase = async (tierKey: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (tierKey === "enterprise") {
      navigate("/enterprise");
      return;
    }

    if (tierKey === "free") {
      toast({ title: "Welcome to QUANTUS AI!", description: "Your free plan is active with 100 AI queries/month." });
      return;
    }

    if (tierKey === "starter" && !isActive) {
      // Activate 14-day trial
      setPurchasing(tierKey);
      try {
        const result = await createPayment(tierKey as any, annual ? "annual" : "monthly");
        if (result.demo) {
          toast({ title: "🎉 Trial activated!", description: "Your 14-day Starter trial is live — no card required. Explore the full power of QUANTUS AI." });
        } else if (result.hosted_payment_page) {
          window.location.href = result.hosted_payment_page;
        }
      } catch (err: any) {
        toast({ title: "Activation error", description: err.message, variant: "destructive" });
      } finally {
        setPurchasing(null);
      }
      return;
    }

    setPurchasing(tierKey);
    try {
      const result = await createPayment(tierKey as any, annual ? "annual" : "monthly");
      if (result.demo) {
        toast({ title: "Subscription activated!", description: `You're now on the ${tierKey} plan.` });
      } else if (result.hosted_payment_page) {
        window.location.href = result.hosted_payment_page;
      }
    } catch (err: any) {
      toast({ title: "Payment error", description: err.message, variant: "destructive" });
    } finally {
      setPurchasing(null);
    }
  };

  const getButtonLabel = (tier: typeof tiers[0]) => {
    if (isActive && currentTier === tier.key) return "Current Plan";
    if (tier.key === "enterprise") return "Request Demo";
    if (tier.key === "free") return user ? "Current Plan" : "Start Free";
    return tier.cta;
  };

  return (
    <div className="pt-16 min-h-screen">
      {/* Header */}
      <section className="py-24 relative overflow-hidden">
        <HeroVideoBackground />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/[0.04] rounded-full blur-[120px]" />
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto"
          >
            <p className="text-primary font-display text-sm tracking-[0.3em] uppercase mb-4">Pricing</p>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-6">
              Invest in <span className="text-gold-gradient gold-glow-text">Intelligence</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed mb-10">
              Transparent pricing built for scale. Every plan includes our core AI engine — choose the tier that matches your ambition.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4">
              <span className={`text-sm font-medium transition-colors ${!annual ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
              <button
                onClick={() => setAnnual((v) => !v)}
                className="relative w-14 h-7 rounded-full bg-secondary border border-border transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30"
                aria-label="Toggle annual billing"
              >
                <motion.div
                  layout
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="absolute top-0.5 w-6 h-6 rounded-full bg-primary shadow-lg shadow-primary/30"
                  style={{ left: annual ? "calc(100% - 1.625rem)" : "0.125rem" }}
                />
              </button>
              <span className={`text-sm font-medium transition-colors ${annual ? "text-foreground" : "text-muted-foreground"}`}>Annual</span>
              <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">Save 20%</span>
            </div>
            <div className="mt-4 flex justify-center">
              <CurrencyConverter currency={currency} setCurrency={setCurrency} currencies={currencies} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-24">
        <div className="container mx-auto px-6">
          <PlatformBillingBanner className="max-w-7xl mx-auto mb-8" />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto items-stretch">
            {tiers.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.6 }}
                className={`relative rounded-2xl p-8 flex flex-col ${
                  tier.highlight ? "glass-card gold-glow ring-1 ring-primary/30" : "glass-card"
                }`}
              >
                {tier.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold tracking-wider uppercase">
                    Most Popular
                  </div>
                )}
                {"trial" in tier && tier.trial && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-quantum-cyan/90 text-background text-xs font-semibold tracking-wider uppercase whitespace-nowrap">
                    14-Day Free Trial
                  </div>
                )}

                <div className="mb-6">
                  <tier.icon size={24} className={tier.highlight ? "text-primary" : "text-muted-foreground"} />
                </div>

                <h3 className="font-display text-xl font-semibold text-foreground mb-1">{tier.name}</h3>
                <p className="text-sm text-muted-foreground mb-6">{tier.description}</p>

                <div className="mb-8">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={`${annual ? "annual" : "monthly"}-${currency.code}`}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="font-display text-4xl font-bold text-foreground inline-block"
                    >
                      {tier.key === "free" ? "Free" : tier.key === "enterprise" ? "Custom" : formatPrice(getPrice(tier.key))}
                    </motion.span>
                  </AnimatePresence>
                  <span className="text-muted-foreground text-sm">
                    {tier.key === "free" ? "forever" : tier.key === "enterprise" ? "" : annual ? "/mo, billed yearly" : "/month"}
                  </span>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm">
                      <Check size={16} className="text-primary shrink-0 mt-0.5" />
                      <span className="text-foreground/80">{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePurchase(tier.key)}
                  disabled={purchasing === tier.key || (isActive && currentTier === tier.key)}
                  className={`w-full text-center py-3 rounded-full font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
                    tier.highlight
                      ? "bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20"
                      : "border border-border text-foreground hover:border-primary/50"
                  }`}
                >
                  {purchasing === tier.key ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    getButtonLabel(tier)
                  )}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <UsagePricing />

      <ComparisonTable />

      <CompetitorComparison />

      <PricingFAQ />

      {/* CTA */}
      <section className="py-24 border-t border-border">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-2xl p-12 md:p-20 text-center max-w-4xl mx-auto gold-glow"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Need a Custom <span className="text-gold-gradient">Solution</span>?
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
              Our AI platform will architect a bespoke intelligence strategy tailored to your organization's unique requirements.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
            >
              Get Started
              <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
