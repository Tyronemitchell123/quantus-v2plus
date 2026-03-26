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
const ModulesDashboard = lazy(() => import("./pages/ModulesDashboard"));
const Chat = lazy(() => import("./pages/Chat"));
const Intake = lazy(() => import("./pages/Intake"));
const Sourcing = lazy(() => import("./pages/Sourcing"));
const VendorOutreach = lazy(() => import("./pages/VendorOutreach"));
const Negotiation = lazy(() => import("./pages/Negotiation"));
const Workflow = lazy(() => import("./pages/Workflow"));
const DocumentsBilling = lazy(() => import("./pages/DocumentsBilling"));
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
          <Route path="/modules" element={<PageTransition><Index /><Footer /></PageTransition>} />
          <Route path="/pricing" element={<PageTransition><Pricing /><Footer /></PageTransition>} />
          <Route path="/contact" element={<PageTransition><Contact /><Footer /></PageTransition>} />
          <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
          <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <PageTransition><ModulesDashboard /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <PageTransition><Chat /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/intake"
            element={
              <ProtectedRoute>
                <PageTransition><Intake /><Footer /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/sourcing"
            element={
              <ProtectedRoute>
                <PageTransition><Sourcing /><Footer /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/outreach"
            element={
              <ProtectedRoute>
                <PageTransition><VendorOutreach /><Footer /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/negotiation"
            element={
              <ProtectedRoute>
                <PageTransition><Negotiation /><Footer /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/workflow"
            element={
              <ProtectedRoute>
                <PageTransition><Workflow /><Footer /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <PageTransition><Settings /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/account/subscription"
            element={
              <ProtectedRoute>
                <PageTransition><SubscriptionManagement /></PageTransition>
              </ProtectedRoute>
            }
          />
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
        <Navbar />
        <AnimatedRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
