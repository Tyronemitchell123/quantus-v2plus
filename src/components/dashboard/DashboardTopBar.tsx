import { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, User, Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  title?: string;
  onMobileMenuToggle?: () => void;
  notifications?: { id: string; text: string; time: string }[];
}

const DashboardTopBar = ({ title = "Dashboard", onMobileMenuToggle, notifications = [] }: Props) => {
  const [notifOpen, setNotifOpen] = useState(false);
  const hasUnread = notifications.length > 0;

  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-4 md:px-6 bg-background/80 backdrop-blur-md shrink-0">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button onClick={onMobileMenuToggle} className="lg:hidden text-muted-foreground hover:text-foreground transition-colors">
          <Menu size={20} />
        </button>
        <Link to="/" className="font-display text-sm tracking-wider lg:hidden">
          <span className="text-gold-gradient font-semibold">Quantus</span>
          <span className="text-foreground/50 ml-1 font-light italic text-xs">A.I</span>
        </Link>
      </div>

      {/* Center */}
      <p className="font-body text-xs tracking-[0.25em] uppercase text-muted-foreground hidden sm:block">{title}</p>

      {/* Right */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Bell size={16} strokeWidth={1.5} />
            {hasUnread && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full" />
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="absolute right-0 top-full mt-2 w-72 border border-border bg-popover/95 backdrop-blur-xl shadow-xl z-50"
              >
                <div className="p-3 border-b border-border">
                  <p className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground">Notifications</p>
                </div>
                {notifications.length > 0 ? (
                  <div className="max-h-60 overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-3 border-b border-border/50 last:border-0">
                        <p className="font-body text-xs text-foreground">{n.text}</p>
                        <p className="font-body text-[10px] text-muted-foreground mt-1">{n.time}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <p className="font-body text-xs text-muted-foreground">No new notifications</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Link to="/settings" className="p-2 text-muted-foreground hover:text-foreground transition-colors">
          <User size={16} strokeWidth={1.5} />
        </Link>
      </div>
    </header>
  );
};

export default DashboardTopBar;
