import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import RouteErrorBoundary from "@/components/RouteErrorBoundary";
import PageLoader from "@/components/PageLoader";
import CookieConsent from "@/components/CookieConsent";
import { OfflineIndicator } from "@/components/mobile/MobileEnhancements";
import WelcomeTooltips from "@/components/onboarding/WelcomeTooltips";
import Index from "./pages/Index";
import { useAuth } from "@/hooks/use-auth";

const ModulesRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader message="Checking session…" />;
  if (user) return <Navigate to="/dashboard/modules" replace />;
  return <PageTransition><Index /><Footer /></PageTransition>;
};

const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Auth = lazy(() => import("./pages/Auth"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Settings = lazy(() => import("./pages/Settings"));
const SubscriptionManagement = lazy(() => import("./pages/SubscriptionManagement"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ModulesDashboard = lazy(() => import("./pages/ModulesDashboard"));
const Chat = lazy(() => import("./pages/Chat"));
const Intake = lazy(() => import("./pages/Intake"));
const Sourcing = lazy(() => import("./pages/Sourcing"));
const VendorOutreach = lazy(() => import("./pages/VendorOutreach"));
const Negotiation = lazy(() => import("./pages/Negotiation"));
const Workflow = lazy(() => import("./pages/Workflow"));
const DocumentsBilling = lazy(() => import("./pages/DocumentsBilling"));
const DealCompletion = lazy(() => import("./pages/DealCompletion"));
const DealEngine = lazy(() => import("./pages/DealEngine"));
const Shortlisting = lazy(() => import("./pages/Shortlisting"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const PartnerPortal = lazy(() => import("./pages/PartnerPortal"));
const PartnerOnboarding = lazy(() => import("./pages/PartnerOnboarding"));
const Services = lazy(() => import("./pages/Services"));
const Blog = lazy(() => import("./pages/Blog"));
const Benefits = lazy(() => import("./pages/Benefits"));
const Enterprise = lazy(() => import("./pages/Enterprise"));
const CaseStudies = lazy(() => import("./pages/CaseStudies"));
const UserGuide = lazy(() => import("./pages/UserGuide"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const MarketingHub = lazy(() => import("./pages/MarketingHub"));
const NLPTools = lazy(() => import("./pages/NLPTools"));
const QuantumComputing = lazy(() => import("./pages/QuantumComputing"));
const RecommendationEngine = lazy(() => import("./pages/RecommendationEngine"));
const DealAutopilot = lazy(() => import("./pages/DealAutopilot"));
const MarketIntelligence = lazy(() => import("./pages/MarketIntelligence"));
const DocumentVault = lazy(() => import("./pages/DocumentVault"));
const Documentation = lazy(() => import("./pages/Documentation"));
const WealthDashboard = lazy(() => import("./pages/WealthDashboard"));
const ConciergeCalendar = lazy(() => import("./pages/ConciergeCalendar"));
const RiskCompliance = lazy(() => import("./pages/RiskCompliance"));
const PrivateNetwork = lazy(() => import("./pages/PrivateNetwork"));
const ConnectOnboarding = lazy(() => import("./pages/ConnectOnboarding"));
const ConnectProducts = lazy(() => import("./pages/ConnectProducts"));
const ConnectStorefront = lazy(() => import("./pages/ConnectStorefront"));
const CommissionPayouts = lazy(() => import("./pages/CommissionPayouts"));
const PayInvoice = lazy(() => import("./pages/PayInvoice"));
const VendorRegister = lazy(() => import("./pages/VendorRegister"));
const WaitingList = lazy(() => import("./pages/WaitingList"));
const PartnerWithUs = lazy(() => import("./pages/PartnerWithUs"));
const SovereignDashboard = lazy(() => import("./pages/SovereignDashboard"));
const SovereignVault = lazy(() => import("./pages/SovereignVault"));
const ProvingGround = lazy(() => import("./pages/ProvingGround"));
const MarketplacePage = lazy(() => import("./pages/Marketplace"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Unsubscribe = lazy(() => import("./pages/Unsubscribe"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

// Helper: wraps a lazy page in its own error boundary
const R = ({ name, children }: { name: string; children: React.ReactNode }) => (
  <RouteErrorBoundary routeName={name}>{children}</RouteErrorBoundary>
);

// Routes that use the dashboard shell (no global navbar/footer)
const dashboardRoutes = ["/dashboard", "/sovereign", "/core", "/helix", "/forge", "/deals", "/chat", "/intake", "/sourcing", "/outreach", "/shortlist", "/negotiation", "/workflow", "/documents", "/deal-completion", "/settings", "/account/subscription", "/partner", "/admin", "/marketing", "/nlp", "/quantum", "/recommendations", "/autopilot", "/intelligence", "/vault", "/wealth", "/calendar", "/compliance", "/network", "/connect", "/commission-payouts"];

const AnimatedRoutes = () => {
  const location = useLocation();
  const isDashboardRoute = dashboardRoutes.some((r) => location.pathname.startsWith(r));

  return (
    <>
      {!isDashboardRoute && <Navbar />}
      <AnimatePresence mode="wait">
        <Suspense fallback={<PageLoader />}>
          <Routes location={location} key={location.pathname}>
            {/* Public */}
            <Route path="/" element={<R name="Home"><PageTransition><Index /><Footer /></PageTransition></R>} />
            <Route path="/about" element={<R name="About"><PageTransition><About /><Footer /></PageTransition></R>} />
            <Route path="/modules" element={<ModulesRedirect />} />
            <Route path="/pricing" element={<R name="Pricing"><PageTransition><Pricing /><Footer /></PageTransition></R>} />
            <Route path="/contact" element={<R name="Contact"><PageTransition><Contact /><Footer /></PageTransition></R>} />
            <Route path="/services" element={<R name="Services"><PageTransition><Services /><Footer /></PageTransition></R>} />
            <Route path="/blog" element={<R name="Blog"><PageTransition><Blog /><Footer /></PageTransition></R>} />
            <Route path="/benefits" element={<R name="Benefits"><PageTransition><Benefits /><Footer /></PageTransition></R>} />
            <Route path="/enterprise" element={<R name="Enterprise"><PageTransition><Enterprise /><Footer /></PageTransition></R>} />
            <Route path="/case-studies" element={<R name="Case Studies"><PageTransition><CaseStudies /><Footer /></PageTransition></R>} />
            <Route path="/guide" element={<R name="User Guide"><PageTransition><UserGuide /><Footer /></PageTransition></R>} />
            <Route path="/docs" element={<R name="Documentation"><PageTransition><Documentation /><Footer /></PageTransition></R>} />
            <Route path="/auth" element={<R name="Auth"><PageTransition><Auth /></PageTransition></R>} />
            <Route path="/reset-password" element={<R name="Reset Password"><PageTransition><ResetPassword /></PageTransition></R>} />
            <Route path="/unsubscribe" element={<R name="Unsubscribe"><PageTransition><Unsubscribe /></PageTransition></R>} />
            <Route path="/pay" element={<R name="Pay Invoice"><PageTransition><PayInvoice /></PageTransition></R>} />
            <Route path="/vendor-register" element={<R name="Vendor Register"><PageTransition><VendorRegister /></PageTransition></R>} />
            <Route path="/waiting-list" element={<R name="Waiting List"><PageTransition><WaitingList /><Footer /></PageTransition></R>} />
            <Route path="/partner-with-us" element={<R name="Partner With Us"><PageTransition><PartnerWithUs /><Footer /></PageTransition></R>} />
            <Route path="/marketplace" element={<R name="Marketplace"><PageTransition><MarketplacePage /><Footer /></PageTransition></R>} />
            <Route path="/onboarding" element={<ProtectedRoute skipOnboardingCheck><R name="Onboarding"><PageTransition><Onboarding /></PageTransition></R></ProtectedRoute>} />

            {/* Dashboard shell routes */}
            <Route path="/core" element={<ProtectedRoute><R name="Core"><QuantusCore /></R></ProtectedRoute>} />
            <Route path="/helix" element={<ProtectedRoute><R name="Helix"><QuantusHelix /></R></ProtectedRoute>} />
            <Route path="/forge" element={<ProtectedRoute><R name="Forge"><QuantusForge /></R></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><R name="Dashboard"><Dashboard /></R></ProtectedRoute>} />
            <Route path="/dashboard/modules" element={<ProtectedRoute><R name="Modules"><ModulesDashboard /></R></ProtectedRoute>} />
            <Route path="/dashboard/intake" element={<Navigate to="/intake" replace />} />
            <Route path="/dashboard/deals" element={<Navigate to="/deals" replace />} />
            <Route path="/dashboard/chat" element={<Navigate to="/chat" replace />} />
            <Route path="/dashboard/sourcing" element={<Navigate to="/sourcing" replace />} />
            <Route path="/dashboard/outreach" element={<Navigate to="/outreach" replace />} />
            <Route path="/dashboard/settings" element={<Navigate to="/settings" replace />} />
            <Route path="/deals" element={<ProtectedRoute><R name="Deal Engine"><DealEngine /></R></ProtectedRoute>} />
            <Route path="/deals/:id" element={<Navigate to="/deals" replace />} />
            <Route path="/chat" element={<ProtectedRoute><R name="Chat"><Chat /></R></ProtectedRoute>} />
            <Route path="/intake" element={<ProtectedRoute><R name="Intake"><PageTransition><Intake /></PageTransition></R></ProtectedRoute>} />
            <Route path="/sourcing" element={<ProtectedRoute><R name="Sourcing"><PageTransition><Sourcing /></PageTransition></R></ProtectedRoute>} />
            <Route path="/outreach" element={<ProtectedRoute><R name="Outreach"><PageTransition><VendorOutreach /></PageTransition></R></ProtectedRoute>} />
            <Route path="/shortlist" element={<ProtectedRoute><R name="Shortlist"><PageTransition><Shortlisting /></PageTransition></R></ProtectedRoute>} />
            <Route path="/negotiation" element={<ProtectedRoute><R name="Negotiation"><PageTransition><Negotiation /></PageTransition></R></ProtectedRoute>} />
            <Route path="/workflow" element={<ProtectedRoute><R name="Workflow"><PageTransition><Workflow /></PageTransition></R></ProtectedRoute>} />
            <Route path="/documents" element={<ProtectedRoute><R name="Documents"><PageTransition><DocumentsBilling /></PageTransition></R></ProtectedRoute>} />
            <Route path="/deal-completion" element={<ProtectedRoute><R name="Deal Completion"><PageTransition><DealCompletion /></PageTransition></R></ProtectedRoute>} />
            <Route path="/deal-engine" element={<Navigate to="/deals" replace />} />
            <Route path="/settings" element={<ProtectedRoute><R name="Settings"><PageTransition><Settings /></PageTransition></R></ProtectedRoute>} />
            <Route path="/account/subscription" element={<ProtectedRoute><R name="Subscription"><PageTransition><SubscriptionManagement /></PageTransition></R></ProtectedRoute>} />

            <Route path="/partner" element={<ProtectedRoute><R name="Partner Portal"><PartnerPortal /></R></ProtectedRoute>} />
            <Route path="/partner/onboarding" element={<ProtectedRoute><R name="Partner Onboarding"><PageTransition><PartnerOnboarding /></PageTransition></R></ProtectedRoute>} />

            <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><R name="Admin"><PageTransition><AdminDashboard /></PageTransition></R></ProtectedRoute>} />
            <Route path="/marketing" element={<ProtectedRoute><R name="Marketing"><PageTransition><MarketingHub /></PageTransition></R></ProtectedRoute>} />
            <Route path="/nlp" element={<ProtectedRoute><R name="NLP Tools"><PageTransition><NLPTools /></PageTransition></R></ProtectedRoute>} />
            <Route path="/quantum" element={<ProtectedRoute><R name="Quantum"><PageTransition><QuantumComputing /></PageTransition></R></ProtectedRoute>} />
            <Route path="/recommendations" element={<ProtectedRoute><R name="Recommendations"><RecommendationEngine /></R></ProtectedRoute>} />
            <Route path="/autopilot" element={<ProtectedRoute><R name="Autopilot"><DealAutopilot /></R></ProtectedRoute>} />
            <Route path="/intelligence" element={<ProtectedRoute><R name="Intelligence"><MarketIntelligence /></R></ProtectedRoute>} />
            <Route path="/vault" element={<ProtectedRoute><R name="Vault"><DocumentVault /></R></ProtectedRoute>} />
            <Route path="/wealth" element={<ProtectedRoute><R name="Wealth"><WealthDashboard /></R></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute><R name="Calendar"><ConciergeCalendar /></R></ProtectedRoute>} />
            <Route path="/compliance" element={<ProtectedRoute><R name="Compliance"><RiskCompliance /></R></ProtectedRoute>} />
            <Route path="/network" element={<ProtectedRoute><R name="Network"><PrivateNetwork /></R></ProtectedRoute>} />

            <Route path="/connect/onboarding" element={<ProtectedRoute><R name="Connect Onboarding"><ConnectOnboarding /></R></ProtectedRoute>} />
            <Route path="/connect/products" element={<ProtectedRoute><R name="Connect Products"><ConnectProducts /></R></ProtectedRoute>} />
            <Route path="/connect/storefront" element={<ProtectedRoute><R name="Connect Storefront"><ConnectStorefront /></R></ProtectedRoute>} />
            <Route path="/commission-payouts" element={<ProtectedRoute><R name="Commission Payouts"><CommissionPayouts /></R></ProtectedRoute>} />
            <Route path="/sovereign" element={<ProtectedRoute><R name="Sovereign"><SovereignDashboard /></R></ProtectedRoute>} />
            <Route path="/sovereign/vault" element={<ProtectedRoute><R name="Sovereign Vault"><SovereignVault /></R></ProtectedRoute>} />
            <Route path="/sovereign/proving-ground" element={<ProtectedRoute><R name="Proving Ground"><ProvingGround /></R></ProtectedRoute>} />

            <Route path="/privacy" element={<R name="Privacy"><PageTransition><Privacy /><Footer /></PageTransition></R>} />
            <Route path="/terms" element={<R name="Terms"><PageTransition><Terms /><Footer /></PageTransition></R>} />
            <Route path="*" element={<R name="Not Found"><PageTransition><NotFound /></PageTransition></R>} />
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
        <OfflineIndicator />
        <BrowserRouter>
          <AnimatedRoutes />
          <WelcomeTooltips />
          <CookieConsent />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
