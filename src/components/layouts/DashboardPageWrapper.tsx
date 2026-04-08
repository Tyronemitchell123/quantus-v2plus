import { ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import MobileBottomNav from "@/components/mobile/MobileBottomNav";
import ParticleGrid from "@/components/ParticleGrid";

interface DashboardPageWrapperProps {
  children: ReactNode;
  showParticles?: boolean;
  footerLeft?: string;
  footerRight?: string;
}

const DashboardPageWrapper = ({
  children,
  showParticles = true,
  footerLeft = "Quantus V2+",
  footerRight = "Phase 1",
}: DashboardPageWrapperProps) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const tabRoutes: Record<string, string> = {
    feed: "/dashboard",
    modules: "/dashboard/modules",
    profile: "/settings",
  };

  return (
    <div className="min-h-screen bg-background flex relative">
      {showParticles && (
        <>
          <div className="fixed inset-0 pointer-events-none opacity-10 z-0">
            <ParticleGrid />
          </div>
          <div
            className="fixed inset-0 pointer-events-none z-0"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 60%, hsl(var(--background)) 100%)",
            }}
          />
        </>
      )}

      <DashboardSidebar />

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <DashboardTopBar
          onMobileMenuToggle={() => setSidebarOpen((v) => !v)}
          notifications={[]}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pb-24 lg:pb-8 space-y-6">
          {children}
        </main>

        <footer className="hidden lg:flex px-6 py-3 border-t border-border/50 items-center justify-between">
          <p className="font-body text-[9px] tracking-[0.2em] uppercase text-muted-foreground/40">
            {footerLeft}
          </p>
          <p className="font-body text-[9px] text-muted-foreground/30">
            {footerRight}
          </p>
        </footer>
      </div>

      <MobileBottomNav
        onAIOpen={() => navigate("/chat")}
        onMessagingOpen={() => navigate("/chat")}
        onTabChange={(tab) => {
          const route = tabRoutes[tab];
          if (route) navigate(route);
        }}
        activeTab="feed"
      />
    </div>
  );
};

export default DashboardPageWrapper;
