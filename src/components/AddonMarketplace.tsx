import { useState } from "react";
import { motion } from "framer-motion";
import { Package, Zap, Shield, Brain, Palette, BarChart3, Lock, Cpu, Check, Loader2, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

const categoryIcons: Record<string, any> = {
  credits: Zap,
  support: Shield,
  premium: Brain,
  analytics: BarChart3,
  compliance: Lock,
};

const categoryColors: Record<string, string> = {
  credits: "text-quantum-cyan",
  support: "text-green-400",
  premium: "text-primary",
  analytics: "text-purple-400",
  compliance: "text-blue-400",
};

const AddonMarketplace = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const { data: addons, isLoading } = useQuery({
    queryKey: ["addons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("addons")
        .select("*")
        .eq("is_active", true)
        .neq("category", "overage")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: purchases } = useQuery({
    queryKey: ["addon-purchases", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("addon_purchases")
        .select("*, addons(*)")
        .eq("user_id", user!.id)
        .eq("status", "active");
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const handlePurchase = async (addon: any) => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to purchase add-ons.", variant: "destructive" });
      return;
    }

    setPurchasing(addon.id);
    try {
      const { data, error } = await supabase.functions.invoke("purchase-addon", {
        body: { addon_id: addon.id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Add-on activated! 🎉", description: `${addon.name} has been added to your account.` });
    } catch (err: any) {
      toast({ title: "Purchase failed", description: err.message, variant: "destructive" });
    } finally {
      setPurchasing(null);
    }
  };

  const isPurchased = (addonId: string) => purchases?.some((p: any) => p.addon_id === addonId);

  const formatPrice = (cents: number) => {
    if (cents >= 100) return `£${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
    return `£${(cents / 100).toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <section className="py-24">
        <div className="container mx-auto px-6 text-center">
          <Loader2 className="animate-spin mx-auto text-primary" size={32} />
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 border-t border-border">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-primary font-display text-sm tracking-[0.3em] uppercase mb-4">Supercharge</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            Premium <span className="text-gold-gradient">Add-ons</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Extend your plan with powerful add-ons. Purchase credits, priority support, or cutting-edge features on demand.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {addons?.map((addon: any, i: number) => {
            const Icon = categoryIcons[addon.category] || Package;
            const colorClass = categoryColors[addon.category] || "text-muted-foreground";
            const features = addon.features || [];
            const owned = isPurchased(addon.id);

            return (
              <motion.div
                key={addon.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className={`glass-card rounded-2xl p-6 flex flex-col relative group hover:ring-1 hover:ring-primary/20 transition-all ${
                  owned ? "ring-1 ring-primary/30" : ""
                }`}
              >
                {owned && (
                  <div className="absolute -top-2.5 right-4 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold tracking-wider uppercase">
                    Active
                  </div>
                )}

                <div className={`mb-4 ${colorClass}`}>
                  <Icon size={28} />
                </div>

                <h3 className="font-display text-lg font-semibold text-foreground mb-1">{addon.name}</h3>
                <p className="text-sm text-muted-foreground mb-4 flex-1">{addon.description}</p>

                <ul className="space-y-2 mb-6">
                  {features.map((f: string, fi: number) => (
                    <li key={fi} className="flex items-center gap-2 text-xs text-foreground/70">
                      <Check size={12} className="text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="flex items-end justify-between mt-auto">
                  <div>
                    <span className="font-display text-2xl font-bold text-foreground">
                      {formatPrice(addon.price_cents)}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">
                      {addon.billing_type === "recurring" ? "/mo" : ""}
                    </span>
                  </div>

                  <button
                    onClick={() => handlePurchase(addon)}
                    disabled={purchasing === addon.id || owned}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                      owned
                        ? "bg-primary/10 text-primary cursor-default"
                        : "bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20"
                    } disabled:opacity-50`}
                  >
                    {purchasing === addon.id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : owned ? (
                      <>
                        <Check size={12} /> Owned
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={12} /> Get
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AddonMarketplace;
