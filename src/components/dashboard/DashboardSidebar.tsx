import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Briefcase, Grid3X3, Bot, FileText, CreditCard, Settings, MessageSquare, Radar, FolderOpen,
  Wallet, CalendarDays, ShieldCheck, Users, DollarSign, Crown, Vault, Cpu, Dna, Globe,
} from "lucide-react";

const navSections = [
  {
    label: "Sovereign OS",
    items: [
      { icon: Cpu, label: "Core", to: "/core" },
      { icon: Dna, label: "Helix", to: "/helix" },
      { icon: Globe, label: "Forge", to: "/forge" },
      { icon: Crown, label: "Sovereign", to: "/sovereign" },
    ],
  },
  {
    label: "Command",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", to: "/dashboard" },
      { icon: Briefcase, label: "Deals", to: "/deals" },
      { icon: Grid3X3, label: "Modules", to: "/dashboard/modules" },
      { icon: MessageSquare, label: "Messages", to: "/chat" },
      { icon: Bot, label: "Autopilot", to: "/autopilot" },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { icon: Radar, label: "Intelligence", to: "/intelligence" },
      { icon: Wallet, label: "Wealth", to: "/wealth" },
      { icon: CalendarDays, label: "Calendar", to: "/calendar" },
      { icon: ShieldCheck, label: "Compliance", to: "/compliance" },
      { icon: Users, label: "Network", to: "/network" },
    ],
  },
  {
    label: "Operations",
    items: [
      { icon: FolderOpen, label: "Vault", to: "/vault" },
      { icon: Vault, label: "Financials", to: "/sovereign/vault" },
      { icon: FileText, label: "Documents", to: "/documents" },
      { icon: CreditCard, label: "Billing", to: "/account/subscription" },
      { icon: DollarSign, label: "Payouts", to: "/commission-payouts" },
      { icon: Settings, label: "Settings", to: "/settings" },
    ],
  },
];

const DashboardSidebar = () => {
  const { pathname } = useLocation();

  return (
    <aside className="hidden lg:flex flex-col w-[72px] hover:w-56 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group/sidebar glass-obsidian border-r border-border/30 shrink-0 overflow-hidden relative z-10">
      {/* Ambient gold edge */}
      <div className="absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/[0.08] to-transparent pointer-events-none" />

      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-border/20 px-4 relative">
        <span className="text-gold-gradient font-display text-xl font-semibold gold-glow-text">Q</span>
        <div className="absolute bottom-0 left-4 right-4 sovereign-line" />
      </div>

      <nav className="flex-1 py-4 flex flex-col gap-0.5 px-2 overflow-y-auto scrollbar-hide">
        {navSections.map((section, si) => (
          <div key={section.label} className={si > 0 ? "mt-3" : ""}>
            <p className="px-3 py-1.5 text-[7px] tracking-[0.4em] uppercase text-primary/30 font-body opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-500 whitespace-nowrap">
              {section.label}
            </p>
            {si > 0 && (
              <div className="mx-3 mb-1.5 h-px bg-gradient-to-r from-transparent via-border/30 to-transparent opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-500" />
            )}
            {section.items.map((item, i) => {
              const active = pathname === item.to || (item.to !== "/dashboard" && pathname.startsWith(item.to));
              return (
                <motion.div
                  key={item.to}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (si * 5 + i) * 0.03, duration: 0.4 }}
                >
                  <Link
                    to={item.to}
                    className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-500 group ${
                      active
                        ? "text-primary bg-primary/[0.06]"
                        : "text-muted-foreground hover:text-foreground hover:bg-primary/[0.03]"
                    }`}
                  >
                    {active && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                        style={{ background: "linear-gradient(180deg, hsl(var(--gold-light)), hsl(var(--gold-dark)))" }}
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                    <item.icon
                      size={17}
                      strokeWidth={1.4}
                      className={`shrink-0 transition-all duration-500 ${active ? "drop-shadow-[0_0_6px_hsl(var(--gold)/0.4)]" : "group-hover:scale-110"}`}
                    />
                    <span className="font-body text-[11px] tracking-wide whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-500">
                      {item.label}
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Profile */}
      <div className="p-4 border-t border-border/20 relative">
        <div className="absolute top-0 left-4 right-4 sovereign-line" />
        <div className="w-8 h-8 rounded-full bg-primary/[0.08] border border-primary/15 flex items-center justify-center mx-auto group-hover/sidebar:mx-0 transition-all duration-500 gold-glow-sm">
          <span className="font-body text-[9px] font-medium text-primary">TM</span>
        </div>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
