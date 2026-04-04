import { forwardRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Briefcase, Grid3X3, Bot, User, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

interface MobileBottomNavProps {
  onAIOpen: () => void;
  onMessagingOpen?: () => void;
  onTabChange?: (tab: "feed" | "modules" | "profile") => void;
  activeTab?: string;
}

const MobileBottomNav = forwardRef<HTMLElement, MobileBottomNavProps>(({ onAIOpen, onMessagingOpen, onTabChange, activeTab }, ref) => {
  const { pathname } = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: "Home", tab: "feed" as const },
    { icon: Grid3X3, label: "Modules", tab: "modules" as const },
    { icon: Bot, label: "AI", action: "ai" as const },
    { icon: MessageSquare, label: "Messages", action: "msg" as const },
    { icon: User, label: "Profile", tab: "profile" as const },
  ];

  return (
    <nav ref={ref} className="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t border-border bg-background/95 backdrop-blur-xl safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isAction = "action" in item && item.action;
          const isAI = item.action === "ai";
          const active = !isAction && activeTab === item.tab;

          if (isAI) {
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

          if (isAction) {
            return (
              <button
                key={item.label}
                onClick={onMessagingOpen}
                className="flex flex-col items-center gap-1 px-3 py-1 relative"
              >
                <item.icon size={18} strokeWidth={1.5} className="text-muted-foreground" />
                <span className="font-body text-[9px] tracking-wider text-muted-foreground">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.label}
              onClick={() => onTabChange?.(item.tab!)}
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
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
