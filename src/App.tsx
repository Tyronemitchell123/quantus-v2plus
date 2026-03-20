import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
const ConciergeWidget = lazy(() => import("@/components/ConciergeWidget"));
import ScrollProgress from "@/components/ScrollProgress";
import CursorGlow from "@/components/CursorGlow";
import PageTransition from "@/components/PageTransition";
import ProtectedRoute from "@/components/ProtectedRoute";
import TrialExpirationNotifier from "@/components/TrialExpirationNotifier";
import Index from "./pages/Index";

const About = lazy(() => import("./pages/About"));
const Services = lazy(() => import("./pages/Services"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Contact = lazy(() => import("./pages/Contact"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Chat = lazy(() => import("./pages/Chat"));
const Auth = lazy(() => import("./pages/Auth"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const QuantumComputing = lazy(() => import("./pages/QuantumComputing"));
const CaseStudies = lazy(() => import("./pages/CaseStudies"));
const Benefits = lazy(() => import("./pages/Benefits"));
const Settings = lazy(() => import("./pages/Settings"));
const SubscriptionManagement = lazy(() => import("./pages/SubscriptionManagement"));
const NLPTools = lazy(() => import("./pages/NLPTools"));
const UserGuide = lazy(() => import("./pages/UserGuide"));
const MarketingHub = lazy(() => import("./pages/MarketingHub"));
const Blog = lazy(() => import("./pages/Blog"));
const Enterprise = lazy(() => import("./pages/Enterprise"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Index /><Footer /></PageTransition>} />
          <Route path="/about" element={<PageTransition><About /><Footer /></PageTransition>} />
          <Route path="/services" element={<PageTransition><Services /><Footer /></PageTransition>} />
          <Route path="/pricing" element={<PageTransition><Pricing /><Footer /></PageTransition>} />
          <Route path="/quantum" element={<PageTransition><QuantumComputing /><Footer /></PageTransition>} />
          <Route path="/contact" element={<PageTransition><Contact /><Footer /></PageTransition>} />
          <Route path="/case-studies" element={<PageTransition><CaseStudies /><Footer /></PageTransition>} />
          <Route path="/benefits" element={<PageTransition><Benefits /><Footer /></PageTransition>} />
          <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
          <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredTier="starter">
                <PageTransition><Dashboard /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute requiredTier="professional">
                <PageTransition><Chat /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute requiredTier="starter">
                <PageTransition><Settings /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/account/subscription"
            element={
              <ProtectedRoute requiredTier="free">
                <PageTransition><SubscriptionManagement /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/nlp"
            element={
              <ProtectedRoute requiredTier="free">
                <PageTransition><NLPTools /><Footer /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketing"
            element={
              <ProtectedRoute requiredTier="enterprise">
                <PageTransition><MarketingHub /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route path="/enterprise" element={<PageTransition><Enterprise /><Footer /></PageTransition>} />
          <Route path="/blog" element={<PageTransition><Blog /><Footer /></PageTransition>} />
          <Route path="/blog/:slug" element={<PageTransition><Blog /><Footer /></PageTransition>} />
          <Route path="/guide" element={<PageTransition><UserGuide /><Footer /></PageTransition>} />
          <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <CursorGlow />
        <ScrollProgress />
        <Navbar />
        <AnimatedRoutes />
        <TrialExpirationNotifier />
        <Suspense fallback={null}><ConciergeWidget /></Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
