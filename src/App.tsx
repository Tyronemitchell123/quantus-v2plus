import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";

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
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

// Routes that use the dashboard shell (no global navbar/footer)
const dashboardRoutes = ["/dashboard", "/deals", "/chat", "/intake", "/sourcing", "/outreach", "/shortlist", "/negotiation", "/workflow", "/documents", "/deal-completion", "/settings", "/account/subscription", "/partner", "/admin", "/marketing", "/nlp", "/quantum"];

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
            <Route path="/modules" element={<PageTransition><Index /><Footer /></PageTransition>} />
            <Route path="/pricing" element={<PageTransition><Pricing /><Footer /></PageTransition>} />
            <Route path="/contact" element={<PageTransition><Contact /><Footer /></PageTransition>} />
            <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
            <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
            <Route path="/onboarding" element={<ProtectedRoute><PageTransition><Onboarding /></PageTransition></ProtectedRoute>} />

            {/* Dashboard shell routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/modules" element={<ProtectedRoute><ModulesDashboard /></ProtectedRoute>} />
            <Route path="/deals" element={<ProtectedRoute><DealEngine /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
            <Route path="/intake" element={<ProtectedRoute><PageTransition><Intake /></PageTransition></ProtectedRoute>} />
            <Route path="/sourcing" element={<ProtectedRoute><PageTransition><Sourcing /></PageTransition></ProtectedRoute>} />
            <Route path="/outreach" element={<ProtectedRoute><PageTransition><VendorOutreach /></PageTransition></ProtectedRoute>} />
            <Route path="/shortlist" element={<ProtectedRoute><PageTransition><Shortlisting /></PageTransition></ProtectedRoute>} />
            <Route path="/negotiation" element={<ProtectedRoute><PageTransition><Negotiation /></PageTransition></ProtectedRoute>} />
            <Route path="/workflow" element={<ProtectedRoute><PageTransition><Workflow /></PageTransition></ProtectedRoute>} />
            <Route path="/documents" element={<ProtectedRoute><PageTransition><DocumentsBilling /></PageTransition></ProtectedRoute>} />
            <Route path="/deal-completion" element={<ProtectedRoute><PageTransition><DealCompletion /></PageTransition></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><PageTransition><Settings /></PageTransition></ProtectedRoute>} />
            <Route path="/account/subscription" element={<ProtectedRoute><PageTransition><SubscriptionManagement /></PageTransition></ProtectedRoute>} />

            <Route path="/partner" element={<ProtectedRoute><PartnerPortal /></ProtectedRoute>} />
            <Route path="/partner/onboarding" element={<ProtectedRoute><PageTransition><PartnerOnboarding /></PageTransition></ProtectedRoute>} />

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
