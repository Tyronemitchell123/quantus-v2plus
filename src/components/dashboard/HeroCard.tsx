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
    // Try profile display_name, then user metadata
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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="glass-card p-6 md:p-8 relative overflow-hidden group"
    >
      {/* Top gold line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-1">
          <div>
            <p className="text-[8px] tracking-[0.4em] uppercase text-primary/40 font-body mb-2">Command Centre</p>
            <p className="font-display text-xl md:text-2xl font-medium text-foreground">
              {timeGreeting}, {name}.
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-primary/[0.06] flex items-center justify-center">
            <Sparkles size={14} className="text-primary/50" />
          </div>
        </div>

        <p className="font-display text-sm italic text-primary/60 mb-6">
          {greeting}
        </p>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/intake"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-body text-[10px] tracking-[0.2em] uppercase hover:brightness-110 transition-all duration-300 rounded-lg gold-glow"
          >
            <Plus size={12} /> New Request
          </Link>
          <Link
            to="/deals"
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-border text-foreground/70 font-body text-[10px] tracking-[0.2em] uppercase hover:border-primary/30 hover:text-foreground transition-all duration-300 rounded-lg"
          >
            <Eye size={12} /> Active Deals
          </Link>
        </div>
      </div>

      {/* Bottom gold line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
    </motion.div>
  );
};

export default HeroCard;
