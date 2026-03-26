import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Briefcase, Grid3X3, Bot, FileText, CreditCard, Settings, MessageSquare,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/dashboard" },
  { icon: Briefcase, label: "Deals", to: "/deals" },
  { icon: Grid3X3, label: "Modules", to: "/dashboard/modules" },
  { icon: MessageSquare, label: "Messages", to: "/chat" },
  { icon: FileText, label: "Documents", to: "/documents" },
  { icon: CreditCard, label: "Billing", to: "/account/subscription" },
  { icon: Settings, label: "Settings", to: "/settings" },
];

const DashboardSidebar = () => {
  const { pathname } = useLocation();

  return (
    <aside className="hidden lg:flex flex-col w-[80px] hover:w-52 transition-all duration-500 group/sidebar border-r border-border/50 bg-card/30 backdrop-blur-sm shrink-0 overflow-hidden relative z-10">
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-border/50 px-4">
        <span className="text-gold-gradient font-display text-xl font-semibold">Q</span>
      </div>

      <nav className="flex-1 py-6 flex flex-col gap-1 px-3">
        {navItems.map((item, i) => {
          const active = pathname === item.to || (item.to !== "/dashboard" && pathname.startsWith(item.to));
          return (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={item.to}
                className={`relative flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-300 group ${
                  active
                    ? "text-primary bg-primary/[0.08]"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/30"
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <item.icon
                  size={18}
                  strokeWidth={1.5}
                  className={`shrink-0 transition-transform duration-300 ${active ? "" : "group-hover:scale-110"}`}
                />
                <span className="font-body text-xs tracking-wide whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">
                  {item.label}
                </span>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Profile */}
      <div className="p-4 border-t border-border/50">
        <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto group-hover/sidebar:mx-0 transition-all duration-300">
          <span className="font-body text-[10px] font-medium text-primary">TM</span>
        </div>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
