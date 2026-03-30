import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Briefcase, Grid3X3, Bot, FileText, CreditCard, Settings, X,
  Search, Plus, Upload, MessageSquare, Headphones, Wallet, CalendarDays, ShieldCheck, Users,
} from "lucide-react";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardFeed from "@/components/dashboard/DashboardFeed";
import AIAssistantPanel from "@/components/dashboard/AIAssistantPanel";
import MobileBottomNav from "@/components/mobile/MobileBottomNav";
import MobileAIAssistant from "@/components/mobile/MobileAIAssistant";
import MobileModuleCards from "@/components/mobile/MobileModuleCards";
import MobileMessaging from "@/components/mobile/MobileMessaging";
import MobileNotificationBanner from "@/components/mobile/MobileNotificationBanner";
import MobileProfile from "@/components/mobile/MobileProfile";
import ParticleGrid from "@/components/ParticleGrid";
import UpsellBanner from "@/components/UpsellBanner";
import { useSubscription } from "@/hooks/use-subscription";
import { useUsageTracking } from "@/hooks/use-usage-tracking";
import useDocumentHead from "@/hooks/use-document-head";

const mobileNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/dashboard" },
  { icon: Briefcase, label: "Deals", to: "/intake" },
  { icon: Grid3X3, label: "Modules", to: "/dashboard/modules" },
  { icon: Bot, label: "AI Assistant", to: "/chat" },
  { icon: Wallet, label: "Wealth", to: "/wealth" },
  { icon: CalendarDays, label: "Calendar", to: "/calendar" },
  { icon: ShieldCheck, label: "Compliance", to: "/compliance" },
  { icon: Users, label: "Network", to: "/network" },
  { icon: FileText, label: "Documents", to: "/documents" },
  { icon: CreditCard, label: "Billing", to: "/account/subscription" },
  { icon: Settings, label: "Settings", to: "/settings" },
];

const sampleNotifications = [
  { id: "1", text: "Vendor response received — Gulfstream G700", time: "12 min ago" },
  { id: "2", text: "Document signed — Dr. Nazari Service Agreement", time: "1 hour ago" },
  { id: "3", text: "AI recommendation: Consider charter optimization", time: "3 hours ago" },
];

const quickActions = [
  { icon: Plus, label: "New Request", to: "/intake" },
  { icon: Upload, label: "Upload Document", to: "/documents" },
  { icon: Briefcase, label: "Start Deal", to: "/deals" },
  { icon: Headphones, label: "Contact Support", to: "/contact" },
];

const Dashboard = () => {
  useDocumentHead({ title: "Dashboard — Quantus V2+", description: "Your private intelligence command centre." });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileAIOpen, setMobileAIOpen] = useState(false);
  const [mobileMessagingOpen, setMobileMessagingOpen] = useState(false);
  const [aiPanelOpen, setAiPanelOpen] = useState(true);
  const [mobileTab, setMobileTab] = useState<"feed" | "modules" | "profile">("feed");
  const { pathname } = useLocation();
  const { tier, limits } = useSubscription();
  const { totalUsage } = useUsageTracking();
  const usagePercent = useMemo(() => {
    if (limits.queries === Infinity) return 0;
    return Math.min(100, Math.round((totalUsage / limits.queries) * 100));
  }, [totalUsage, limits.queries]);

  return (
    <div className="min-h-screen bg-background flex relative">
      {/* Atmospheric background */}
      <div className="fixed inset-0 pointer-events-none opacity-20 z-0">
        <ParticleGrid />
      </div>
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        background: "radial-gradient(ellipse at center, transparent 60%, hsl(var(--background)) 100%)"
      }} />

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
              className="fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-50 lg:hidden"
            >
              <div className="h-16 flex items-center justify-between px-4 border-b border-border">
                <span className="font-display text-sm">
                  <span className="text-gold-gradient font-semibold">Quantus V2+</span>
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
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-sm transition-colors ${
                        active ? "text-primary bg-primary/[0.08]" : "text-muted-foreground hover:text-foreground"
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
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <DashboardTopBar
          onMobileMenuToggle={() => setMobileMenuOpen(true)}
          notifications={sampleNotifications}
        />

        {/* Quick Actions strip */}
        <div className="hidden sm:flex items-center gap-2 px-6 lg:px-8 py-3 border-b border-border/50">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              to={action.to}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gold-soft/15 text-muted-foreground hover:border-gold-soft/30 hover:text-foreground font-body text-[11px] tracking-[0.15em] uppercase transition-all duration-300"
            >
              <action.icon size={13} strokeWidth={1.5} />
              {action.label}
            </Link>
          ))}

          {/* Global search */}
          <div className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg border border-gold-soft/15 text-muted-foreground cursor-pointer hover:border-gold-soft/30 transition-all duration-300">
            <Search size={13} strokeWidth={1.5} />
            <span className="font-body text-[11px] tracking-wider">Search everything…</span>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pb-24 lg:pb-8">
          {/* Desktop always shows feed */}
          <div className="hidden lg:block">
            <DashboardFeed />
          </div>

          {/* Mobile tab content */}
          <div className="lg:hidden">
            {mobileTab === "feed" && <DashboardFeed />}
            {mobileTab === "modules" && <MobileModuleCards />}
            {mobileTab === "profile" && <MobileProfile />}
          </div>
        </main>

        {/* Footer */}
        <footer className="hidden lg:flex px-6 py-3 border-t border-border/50 items-center justify-between">
          <p className="font-body text-[9px] tracking-[0.2em] uppercase text-muted-foreground/40">
            Quantus V2+ — The Obsidian Standard
          </p>
          <p className="font-body text-[9px] text-muted-foreground/30">v1.0.0</p>
        </footer>
      </div>

      {/* AI Assistant — desktop panel */}
      <div className="hidden lg:block">
        <AIAssistantPanel open={aiPanelOpen} onToggle={() => setAiPanelOpen(!aiPanelOpen)} />
      </div>

      {/* Mobile systems */}
      <MobileBottomNav
        onAIOpen={() => setMobileAIOpen(true)}
        onMessagingOpen={() => setMobileMessagingOpen(true)}
        onTabChange={setMobileTab}
        activeTab={mobileTab}
      />
      <MobileAIAssistant open={mobileAIOpen} onClose={() => setMobileAIOpen(false)} />
      <MobileMessaging open={mobileMessagingOpen} onClose={() => setMobileMessagingOpen(false)} />
      <MobileNotificationBanner />
    </div>
  );
};

export default Dashboard;
