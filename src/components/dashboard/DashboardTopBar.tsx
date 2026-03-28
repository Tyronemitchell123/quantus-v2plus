import { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, User, Menu, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";

interface Props {
  onMobileMenuToggle?: () => void;
  notifications?: { id: string; text: string; time: string }[];
}

const DashboardTopBar = ({ onMobileMenuToggle, notifications = [] }: Props) => {
  const [notifOpen, setNotifOpen] = useState(false);
  const { user } = useAuth();
  const hasUnread = notifications.length > 0;
  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "there";

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <header className="h-16 border-b border-border/50 flex items-center justify-between px-4 md:px-6 lg:px-8 bg-background/60 backdrop-blur-xl shrink-0 relative z-10">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button onClick={onMobileMenuToggle} className="lg:hidden text-muted-foreground hover:text-foreground transition-colors">
          <Menu size={20} />
        </button>
        <Link to="/" className="font-display text-sm tracking-wider lg:hidden">
          <span className="text-gold-gradient font-semibold">Quantus V2+</span>
          <span className="text-foreground/50 ml-1 font-light italic text-xs">A.I</span>
        </Link>

        {/* Desktop greeting */}
        <div className="hidden lg:block">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-lg font-medium text-foreground"
          >
            {getGreeting()}, <span className="text-gold-gradient">{firstName}</span>.
          </motion.p>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="w-12 h-px bg-primary/40 origin-left mt-1"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Membership badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/20 bg-primary/[0.04]">
          <Shield size={12} className="text-primary" strokeWidth={1.5} />
          <span className="font-body text-[9px] tracking-[0.2em] uppercase text-primary/80">Obsidian</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/30 transition-all duration-300"
          >
            <Bell size={16} strokeWidth={1.5} />
            {hasUnread && (
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full" />
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl z-50 overflow-hidden"
              >
                <div className="p-4 border-b border-border/50">
                  <p className="font-body text-[10px] tracking-[0.25em] uppercase text-gold-soft/50">Notifications</p>
                </div>
                {notifications.length > 0 ? (
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-4 border-b border-border/30 last:border-0 hover:bg-secondary/20 transition-colors">
                        <p className="font-body text-xs text-foreground leading-relaxed">{n.text}</p>
                        <p className="font-body text-[10px] text-primary/50 mt-1.5">{n.time}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <p className="font-body text-xs text-muted-foreground">No new notifications</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <Link to="/settings" className="w-9 h-9 rounded-full bg-card border border-gold-soft/15 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-gold-soft/30 transition-all duration-300">
          <User size={15} strokeWidth={1.5} />
        </Link>
      </div>
    </header>
  );
};

export default DashboardTopBar;
