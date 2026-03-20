import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  XCircle,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
  ArrowRight,
  Receipt,
  Gift,
  Zap,
  Sparkles,
  Crown,
} from "lucide-react";
import { useSubscription, SubscriptionTier } from "@/hooks/use-subscription";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import useDocumentHead from "@/hooks/use-document-head";
import CurrentPlanCard from "@/components/subscription/CurrentPlanCard";
import PlanSwitcher from "@/components/subscription/PlanSwitcher";
import BillingHistory from "@/components/subscription/BillingHistory";

const SubscriptionManagement = () => {
  useDocumentHead({
    title: "Manage Subscription — QUANTUS AI",
    description:
      "View your current plan, upgrade or downgrade, cancel, and review billing history.",
    canonical: "https://quantus-loom.lovable.app/account/subscription",
  });

  const { subscription, loading, isActive, tier, refresh } = useSubscription();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="pt-16 min-h-screen">
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-primary font-display text-sm tracking-[0.3em] uppercase mb-3">
              Account
            </p>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
              Subscription
            </h1>
            <p className="text-muted-foreground text-base mb-12">
              Manage your plan, billing, and payment history.
            </p>
          </motion.div>

          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <CurrentPlanCard
                subscription={subscription}
                isActive={isActive}
                tier={tier}
                onRefresh={refresh}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <PlanSwitcher currentTier={tier} isActive={isActive} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <BillingHistory />
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SubscriptionManagement;
