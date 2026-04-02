import { Link } from "react-router-dom";
import { User, Menu, Shield, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import NotificationCenter from "@/components/NotificationCenter";

interface Props {
  onMobileMenuToggle?: () => void;
  notifications?: { id: string; text: string; time: string }[];
}

const DashboardTopBar = ({ onMobileMenuToggle }: Props) => {
  const { user } = useAuth();
  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "there";

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <header className="h-16 border-b border-border/30 flex items-center justify-between px-4 md:px-6 lg:px-8 glass-obsidian shrink-0 relative z-10">
      {/* Ambient bottom line */}
      <div className="absolute bottom-0 left-0 right-0 sovereign-line" />

      {/* Left */}
      <div className="flex items-center gap-4">
        <button onClick={onMobileMenuToggle} className="lg:hidden text-muted-foreground hover:text-foreground transition-colors duration-300">
          <Menu size={20} />
        </button>
        <Link to="/" className="font-display text-sm tracking-wider lg:hidden">
          <span className="text-gold-gradient font-semibold">Quantus V2+</span>
          <span className="text-foreground/50 ml-1 font-light italic text-xs">A.I</span>
        </Link>

        {/* Desktop greeting */}
        <div className="hidden lg:block">
          <motion.p
            initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-lg font-medium text-foreground"
          >
            {getGreeting()}, <span className="text-gold-gradient gold-glow-text">{firstName}</span>.
          </motion.p>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.4, duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="w-16 h-px origin-left mt-1"
            style={{ background: "linear-gradient(90deg, hsl(var(--gold)/0.5), transparent)" }}
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Status indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full border border-success/20 bg-success/[0.04]">
          <div className="w-1.5 h-1.5 rounded-full bg-success animate-sovereign-breathe" />
          <span className="font-body text-[8px] tracking-[0.15em] uppercase text-success/70">Live</span>
        </div>

        {/* Membership badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/15 bg-primary/[0.03] gold-glow-sm">
          <Shield size={11} className="text-primary" strokeWidth={1.5} />
          <span className="font-body text-[8px] tracking-[0.25em] uppercase text-primary/70">Obsidian</span>
        </div>

        {/* Real-time Notification Center */}
        <NotificationCenter />

        {/* Profile */}
        <Link to="/settings" className="w-9 h-9 rounded-full bg-card/60 border border-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/25 hover:gold-glow-sm transition-all duration-500">
          <User size={14} strokeWidth={1.4} />
        </Link>
      </div>
    </header>
  );
};

export default DashboardTopBar;
