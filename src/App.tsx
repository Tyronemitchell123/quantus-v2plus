import { Suspense, lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, useLocation } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import PageLoader from "@/components/PageLoader";
import { publicRoutes } from "@/routes/public-routes";
import { dashboardRoutes, dashboardRoutePrefixes } from "@/routes/dashboard-routes";

const Toaster = lazy(() => import("@/components/ui/toaster").then(m => ({ default: m.Toaster })));
const Sonner = lazy(() => import("@/components/ui/sonner").then(m => ({ default: m.Toaster })));
const TooltipProvider = lazy(() => import("@/components/ui/tooltip").then(m => ({ default: m.TooltipProvider })));
const AnimatePresence = lazy(() => import("framer-motion").then(m => ({ default: m.AnimatePresence })));
const Navbar = lazy(() => import("@/components/Navbar"));
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
