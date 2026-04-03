import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import ErrorBoundary from "@/components/ErrorBoundary";
import PageLoader from "@/components/PageLoader";
import { publicRoutes } from "@/routes/public-routes";
import { dashboardRoutes, dashboardRoutePrefixes } from "@/routes/dashboard-routes";

const CookieConsent = lazy(() => import("@/components/CookieConsent"));
const WelcomeTooltips = lazy(() => import("@/components/onboarding/WelcomeTooltips"));
const OfflineIndicator = lazy(() => import("@/components/mobile/MobileEnhancements").then(m => ({ default: m.OfflineIndicator })));

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  const isDashboardRoute = dashboardRoutePrefixes.some((r) => location.pathname.startsWith(r));

  return (
    <>
      {!isDashboardRoute && <Navbar />}
      <AnimatePresence mode="wait">
        <Suspense fallback={<PageLoader />}>
          <Routes location={location} key={location.pathname}>
            {publicRoutes}
            {dashboardRoutes}
          </Routes>
        </Suspense>
      </AnimatePresence>
    </>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AnimatedRoutes />
          <Suspense fallback={null}>
            <OfflineIndicator />
            <WelcomeTooltips />
            <CookieConsent />
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
