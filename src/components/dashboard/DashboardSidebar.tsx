import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Briefcase, Grid3X3, Bot, FileText, CreditCard, Settings,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/dashboard" },
  { icon: Briefcase, label: "Deals", to: "/intake" },
  { icon: Grid3X3, label: "Modules", to: "/dashboard/modules" },
  { icon: Bot, label: "AI Assistant", to: "/chat" },
  { icon: FileText, label: "Documents", to: "/documents" },
  { icon: CreditCard, label: "Billing", to: "/account/subscription" },
  { icon: Settings, label: "Settings", to: "/settings" },
];

const DashboardSidebar = () => {
  const { pathname } = useLocation();

  return (
    <aside className="hidden lg:flex flex-col w-16 hover:w-48 transition-all duration-500 group/sidebar border-r border-border bg-sidebar-background shrink-0 overflow-hidden">
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-border px-4">
        <span className="text-gold-gradient font-display text-lg font-semibold">Q</span>
      </div>

      <nav className="flex-1 py-4 flex flex-col gap-0.5 px-2">
        {navItems.map((item) => {
          const active = pathname === item.to || (item.to !== "/dashboard" && pathname.startsWith(item.to));
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-sm transition-all duration-300 ${
                active
                  ? "text-primary bg-primary/8"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
              }`}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-full"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <item.icon size={18} strokeWidth={1.5} className="shrink-0" />
              <span className="font-body text-xs tracking-wide whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mx-auto group-hover/sidebar:mx-0 transition-all">
          <span className="font-body text-[10px] font-medium text-primary">TM</span>
        </div>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
