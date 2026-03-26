import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Briefcase, Grid3X3, Bot, User } from "lucide-react";
import { motion } from "framer-motion";

interface MobileBottomNavProps {
  onAIOpen: () => void;
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/dashboard" },
  { icon: Briefcase, label: "Deals", to: "/deals" },
  { icon: Grid3X3, label: "Modules", to: "/dashboard/modules" },
  { icon: Bot, label: "AI", action: true },
  { icon: User, label: "Profile", to: "/settings" },
];

const MobileBottomNav = ({ onAIOpen }: MobileBottomNavProps) => {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t border-border bg-background/95 backdrop-blur-xl safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isAction = "action" in item && item.action;
          const active = !isAction && pathname === item.to;

          if (isAction) {
            return (
              <button
                key={item.label}
                onClick={onAIOpen}
                className="flex flex-col items-center gap-1 px-3 py-1 relative"
              >
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center gold-glow">
                  <item.icon size={18} className="text-primary-foreground" />
                </div>
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              to={item.to!}
              className="flex flex-col items-center gap-1 px-3 py-1 relative"
            >
              <item.icon
                size={18}
                strokeWidth={1.5}
                className={active ? "text-primary" : "text-muted-foreground"}
              />
              <span
                className={`font-body text-[9px] tracking-wider ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </span>
              {active && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute -top-px left-2 right-2 h-0.5 bg-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
