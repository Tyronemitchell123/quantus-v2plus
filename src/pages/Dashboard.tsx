import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Briefcase, Grid3X3, Bot, FileText, CreditCard, Settings, X,
} from "lucide-react";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import HeroCard from "@/components/dashboard/HeroCard";
import DealsOverview from "@/components/dashboard/DealsOverview";
import ModuleShortcuts from "@/components/dashboard/ModuleShortcuts";
import DealEngineStrip from "@/components/dashboard/DealEngineStrip";
import DocumentsSnapshot from "@/components/dashboard/DocumentsSnapshot";
import FinancialOverview from "@/components/dashboard/FinancialOverview";
import AIAssistantPanel from "@/components/dashboard/AIAssistantPanel";
import MobileBottomNav from "@/components/mobile/MobileBottomNav";
import MobileAIAssistant from "@/components/mobile/MobileAIAssistant";
import MobileQuickActions from "@/components/mobile/MobileQuickActions";

const mobileNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/dashboard" },
  { icon: Briefcase, label: "Deals", to: "/intake" },
  { icon: Grid3X3, label: "Modules", to: "/dashboard/modules" },
  { icon: Bot, label: "AI Assistant", to: "/chat" },
  { icon: FileText, label: "Documents", to: "/documents" },
  { icon: CreditCard, label: "Billing", to: "/account/subscription" },
  { icon: Settings, label: "Settings", to: "/settings" },
];

const sampleNotifications = [
  { id: "1", text: "Vendor response received — Gulfstream G700", time: "12 min ago" },
  { id: "2", text: "Document signed — Dr. Nazari Service Agreement", time: "1 hour ago" },
  { id: "3", text: "AI recommendation: Consider charter optimization", time: "3 hours ago" },
];

const Dashboard = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileAIOpen, setMobileAIOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-background flex pt-16">
      {/* Desktop sidebar */}
      <DashboardSidebar />

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 h-full w-64 bg-sidebar-background border-r border-border z-50 lg:hidden"
            >
              <div className="h-16 flex items-center justify-between px-4 border-b border-border">
                <span className="font-display text-sm">
                  <span className="text-gold-gradient font-semibold">Quantus</span>
                  <span className="text-foreground/50 ml-1 font-light italic text-xs">A.I</span>
                </span>
                <button onClick={() => setMobileMenuOpen(false)} className="text-muted-foreground">
                  <X size={18} />
                </button>
              </div>
              <nav className="p-3 space-y-0.5">
                {mobileNavItems.map((item) => {
                  const active = pathname === item.to;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 font-body text-sm transition-colors ${
                        active ? "text-primary bg-primary/8" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <item.icon size={16} strokeWidth={1.5} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardTopBar
          title="Dashboard"
          onMobileMenuToggle={() => setMobileMenuOpen(true)}
          notifications={sampleNotifications}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6">
          <HeroCard />
          <DealsOverview />
          <DealEngineStrip />
          <ModuleShortcuts />
          <DocumentsSnapshot />
          <FinancialOverview />
        </main>

        {/* Footer */}
        <footer className="px-6 py-3 border-t border-border flex items-center justify-between">
          <p className="font-body text-[9px] tracking-[0.2em] uppercase text-muted-foreground/40">
            Quantus A.I — The Obsidian Standard
          </p>
          <p className="font-body text-[9px] text-muted-foreground/30">v1.0.0</p>
        </footer>
      </div>

      {/* AI Assistant */}
      <AIAssistantPanel />
    </div>
  );
};

export default Dashboard;
