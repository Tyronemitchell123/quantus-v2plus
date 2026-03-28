import { useState } from "react";
import { motion } from "framer-motion";
import { Gift, Copy, Users, TrendingUp, Check, Loader2, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const ReferralProgram = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);

  const { data: referralCode, isLoading } = useQuery({
    queryKey: ["referral-code", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("referral_codes")
        .select("*")
        .eq("user_id", user!.id)
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: redemptions } = useQuery({
    queryKey: ["referral-redemptions", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("referral_redemptions")
        .select("*")
        .eq("referrer_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: credits } = useQuery({
    queryKey: ["user-credits", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_credits")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const generateCode = useMutation({
    mutationFn: async () => {
      const code = `QUANTUS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const { data, error } = await supabase
        .from("referral_codes")
        .insert({ user_id: user!.id, code, reward_credits: 500 })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["referral-code"] });
      toast({ title: "Referral code created! 🎉", description: "Share it with friends to earn credits." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const copyCode = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode.code);
    setCopied(true);
    toast({ title: "Copied!", description: "Referral code copied to clipboard." });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareCode = () => {
    if (!referralCode) return;
    const text = `Join QUANTUS V2+ with my referral code ${referralCode.code} and get 500 bonus credits! https://quantus-loom.lovable.app/auth?ref=${referralCode.code}`;
    if (navigator.share) {
      navigator.share({ title: "QUANTUS V2+ Referral", text });
    } else {
      navigator.clipboard.writeText(text);
      toast({ title: "Link copied!", description: "Share link copied to clipboard." });
    }
  };

  const totalEarned = redemptions?.reduce((acc: number, r: any) => acc + r.credits_awarded, 0) || 0;

  if (!user) {
    return (
      <section className="py-24 border-t border-border">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-2xl p-12 text-center max-w-3xl mx-auto"
          >
            <Gift size={40} className="text-primary mx-auto mb-4" />
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              Earn While You <span className="text-gold-gradient">Share</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-6">
              Sign in to get your unique referral code. Earn 500 credits for every friend who joins QUANTUS V2+.
            </p>
            <a href="/auth" className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
              Sign In to Start Referring
            </a>
          </motion.div>
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
          <p className="text-primary font-display text-sm tracking-[0.3em] uppercase mb-4">Referral Program</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            Earn While You <span className="text-gold-gradient">Share</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Invite friends to QUANTUS V2+. You both earn 500 credits — that's like a free month of AI queries.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-2xl p-6 text-center"
          >
            <Users size={24} className="text-primary mx-auto mb-3" />
            <p className="font-display text-3xl font-bold text-foreground">{redemptions?.length || 0}</p>
            <p className="text-sm text-muted-foreground">Friends Referred</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-6 text-center"
          >
            <TrendingUp size={24} className="text-quantum-cyan mx-auto mb-3" />
            <p className="font-display text-3xl font-bold text-foreground">{totalEarned.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Credits Earned</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-6 text-center"
          >
            <Gift size={24} className="text-green-400 mx-auto mb-3" />
            <p className="font-display text-3xl font-bold text-foreground">{credits?.balance?.toLocaleString() || 0}</p>
            <p className="text-sm text-muted-foreground">Credit Balance</p>
          </motion.div>
        </div>

        {/* Referral Code Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card rounded-2xl p-8 max-w-2xl mx-auto text-center gold-glow"
        >
          {referralCode ? (
            <>
              <p className="text-sm text-muted-foreground mb-2">Your referral code</p>
              <div className="flex items-center justify-center gap-3 mb-6">
                <span className="font-display text-2xl md:text-3xl font-bold text-primary tracking-widest">
                  {referralCode.code}
                </span>
                <button
                  onClick={copyCode}
                  className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
                  title="Copy code"
                >
                  {copied ? <Check size={18} className="text-primary" /> : <Copy size={18} className="text-primary" />}
                </button>
              </div>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={shareCode}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
                >
                  <Share2 size={14} /> Share & Earn 500 Credits
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Used {referralCode.uses_count} time{referralCode.uses_count !== 1 ? "s" : ""}
                {referralCode.max_uses ? ` of ${referralCode.max_uses}` : ""}
              </p>
            </>
          ) : (
            <>
              <Gift size={32} className="text-primary mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">Get your referral code</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Generate a unique code to share with friends and start earning credits.
              </p>
              <button
                onClick={() => generateCode.mutate()}
                disabled={generateCode.isPending}
                className="flex items-center gap-2 mx-auto px-8 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {generateCode.isPending ? <Loader2 size={16} className="animate-spin" /> : <Gift size={16} />}
                Generate Referral Code
              </button>
            </>
          )}
        </motion.div>

        {/* How it works */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-16">
          {[
            { step: "1", title: "Share Your Code", desc: "Send your unique referral code to friends and colleagues." },
            { step: "2", title: "They Sign Up", desc: "Your friend creates a QUANTUS V2+ account using your code." },
            { step: "3", title: "Both Earn Credits", desc: "You both get 500 credits instantly — that's free AI queries!" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="text-center"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-display font-bold text-lg flex items-center justify-center mx-auto mb-3">
                {item.step}
              </div>
              <h4 className="font-display font-semibold text-foreground mb-1">{item.title}</h4>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReferralProgram;
