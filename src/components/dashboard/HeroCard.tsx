import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Eye, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

const greetings = [
  "Your world is calibrated and ready.",
  "Operations are running at sovereign precision.",
  "All systems orchestrated. Awaiting your command.",
  "The engine is primed. What shall we execute?",
];

const HeroCard = () => {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [greeting] = useState(() => greetings[Math.floor(Math.random() * greetings.length)]);

  useEffect(() => {
    if (!user) return;
    const metaName = user.user_metadata?.full_name?.split(" ")[0];
    if (metaName) {
      setDisplayName(metaName);
      return;
    }
    supabase
      .from("profiles")
      .select("display_name, onboarding_role")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.display_name) setDisplayName(data.display_name.split(" ")[0]);
      });
  }, [user]);

  const name = displayName || "there";

  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      className="glass-sovereign rounded-xl p-6 md:p-8 relative overflow-hidden group"
    >
      {/* Top gold line */}
      <div className="absolute top-0 left-0 right-0 sovereign-line" />

      {/* Ambient corner glow */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/[0.04] to-transparent pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-1">
          <div>
            <p className="text-[7px] tracking-[0.5em] uppercase text-primary/30 font-body mb-3">Command Centre</p>
            <p className="font-display text-xl md:text-2xl font-medium text-foreground">
              {timeGreeting}, <span className="text-gold-gradient gold-glow-text">{name}</span>.
            </p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-primary/[0.04] border border-primary/10 flex items-center justify-center gold-glow-sm">
            <Sparkles size={13} className="text-primary/40" />
          </div>
        </div>

        <p className="font-display text-sm italic text-primary/50 mb-8">
          {greeting}
        </p>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/intake"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-body text-[9px] tracking-[0.3em] uppercase hover:brightness-110 transition-all duration-500 rounded-lg gold-glow group/btn"
          >
            <Plus size={11} className="group-hover/btn:rotate-90 transition-transform duration-500" /> New Request
          </Link>
          <Link
            to="/deals"
            className="inline-flex items-center gap-2 px-6 py-3 border border-border/40 text-foreground/60 font-body text-[9px] tracking-[0.3em] uppercase hover:border-primary/20 hover:text-foreground hover:bg-primary/[0.02] transition-all duration-500 rounded-lg"
          >
            <Eye size={11} /> Active Deals
          </Link>
        </div>
      </div>

      {/* Bottom gold line */}
      <div className="absolute bottom-0 left-0 right-0 sovereign-line" />
    </motion.div>
  );
};

export default HeroCard;
