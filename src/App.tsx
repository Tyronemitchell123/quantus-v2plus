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
import Index from "./pages/Index";
import { useAuth } from "@/hooks/use-auth";

const ModulesRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-background" />;
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
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

// Routes that use the dashboard shell (no global navbar/footer)
const dashboardRoutes = ["/dashboard", "/deals", "/chat", "/intake", "/sourcing", "/outreach", "/shortlist", "/negotiation", "/workflow", "/documents", "/deal-completion", "/settings", "/account/subscription", "/partner", "/admin", "/marketing", "/nlp", "/quantum", "/recommendations"];

const AnimatedRoutes = () => {
  const location = useLocation();
  const isDashboardRoute = dashboardRoutes.some((r) => location.pathname.startsWith(r));

  return (
    <>
      {!isDashboardRoute && <Navbar />}
      <AnimatePresence mode="wait">
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
          <Routes location={location} key={location.pathname}>
            {/* Public */}
            <Route path="/" element={<PageTransition><Index /><Footer /></PageTransition>} />
            <Route path="/about" element={<PageTransition><About /><Footer /></PageTransition>} />
            <Route path="/modules" element={<ModulesRedirect />} />
            <Route path="/pricing" element={<PageTransition><Pricing /><Footer /></PageTransition>} />
            <Route path="/contact" element={<PageTransition><Contact /><Footer /></PageTransition>} />
            <Route path="/services" element={<PageTransition><Services /><Footer /></PageTransition>} />
            <Route path="/blog" element={<PageTransition><Blog /><Footer /></PageTransition>} />
            <Route path="/benefits" element={<PageTransition><Benefits /><Footer /></PageTransition>} />
            <Route path="/enterprise" element={<PageTransition><Enterprise /><Footer /></PageTransition>} />
            <Route path="/case-studies" element={<PageTransition><CaseStudies /><Footer /></PageTransition>} />
            <Route path="/guide" element={<PageTransition><UserGuide /><Footer /></PageTransition>} />
            <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
            <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
            <Route path="/onboarding" element={<ProtectedRoute><PageTransition><Onboarding /></PageTransition></ProtectedRoute>} />

            {/* Dashboard shell routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/modules" element={<ProtectedRoute><ModulesDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/intake" element={<Navigate to="/intake" replace />} />
            <Route path="/dashboard/deals" element={<Navigate to="/deals" replace />} />
            <Route path="/dashboard/chat" element={<Navigate to="/chat" replace />} />
            <Route path="/dashboard/sourcing" element={<Navigate to="/sourcing" replace />} />
            <Route path="/dashboard/outreach" element={<Navigate to="/outreach" replace />} />
            <Route path="/dashboard/settings" element={<Navigate to="/settings" replace />} />
            <Route path="/deals" element={<ProtectedRoute><DealEngine /></ProtectedRoute>} />
            <Route path="/deals/:id" element={<Navigate to="/deals" replace />} />
            <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
            <Route path="/intake" element={<ProtectedRoute><PageTransition><Intake /></PageTransition></ProtectedRoute>} />
            <Route path="/sourcing" element={<ProtectedRoute><PageTransition><Sourcing /></PageTransition></ProtectedRoute>} />
            <Route path="/outreach" element={<ProtectedRoute><PageTransition><VendorOutreach /></PageTransition></ProtectedRoute>} />
            <Route path="/shortlist" element={<ProtectedRoute><PageTransition><Shortlisting /></PageTransition></ProtectedRoute>} />
            <Route path="/negotiation" element={<ProtectedRoute><PageTransition><Negotiation /></PageTransition></ProtectedRoute>} />
            <Route path="/workflow" element={<ProtectedRoute><PageTransition><Workflow /></PageTransition></ProtectedRoute>} />
            <Route path="/documents" element={<ProtectedRoute><PageTransition><DocumentsBilling /></PageTransition></ProtectedRoute>} />
            <Route path="/deal-completion" element={<ProtectedRoute><PageTransition><DealCompletion /></PageTransition></ProtectedRoute>} />
            <Route path="/deal-engine" element={<Navigate to="/deals" replace />} />
            <Route path="/settings" element={<ProtectedRoute><PageTransition><Settings /></PageTransition></ProtectedRoute>} />
            <Route path="/account/subscription" element={<ProtectedRoute><PageTransition><SubscriptionManagement /></PageTransition></ProtectedRoute>} />

            <Route path="/partner" element={<ProtectedRoute><PartnerPortal /></ProtectedRoute>} />
            <Route path="/partner/onboarding" element={<ProtectedRoute><PageTransition><PartnerOnboarding /></PageTransition></ProtectedRoute>} />

            <Route path="/admin" element={<ProtectedRoute><PageTransition><AdminDashboard /></PageTransition></ProtectedRoute>} />
            <Route path="/marketing" element={<ProtectedRoute><PageTransition><MarketingHub /></PageTransition></ProtectedRoute>} />
            <Route path="/nlp" element={<ProtectedRoute><PageTransition><NLPTools /></PageTransition></ProtectedRoute>} />
            <Route path="/quantum" element={<ProtectedRoute><PageTransition><QuantumComputing /></PageTransition></ProtectedRoute>} />
            <Route path="/recommendations" element={<ProtectedRoute><RecommendationEngine /></ProtectedRoute>} />

            <Route path="/privacy" element={<PageTransition><div className="min-h-screen bg-background pt-24 px-6"><div className="max-w-3xl mx-auto"><h1 className="font-display text-3xl mb-6">Privacy Policy</h1><p className="font-body text-muted-foreground">Privacy policy content coming soon.</p></div></div><Footer /></PageTransition>} />
            <Route path="/terms" element={<PageTransition><div className="min-h-screen bg-background pt-24 px-6"><div className="max-w-3xl mx-auto"><h1 className="font-display text-3xl mb-6">Terms of Service</h1><p className="font-body text-muted-foreground">Terms of service content coming soon.</p></div></div><Footer /></PageTransition>} />
            <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
          </Routes>
        </Suspense>
      </AnimatePresence>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
